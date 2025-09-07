// supabase/functions/breakdown/index.ts
// Deno / Supabase Edge Function with Gemini 1.5 Flash + CORS

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// --- CORS 共用表頭 ---
const corsHeaders: HeadersInit = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

// --- 工具：安全回傳 JSON + CORS ---
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8",
    },
  });
}

// --- 解析 Gemini 輸出成 subgoals 陣列 ---
function parseSubgoalsTextToItems(text: string, title: string) {
  // 把模型輸出用行分割，挑出像「1. xxx」「- xxx」「• xxx」「* xxx」等項目
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const goalLines: string[] = [];
  for (const l of lines) {
    const m = l.match(/^(\d+\.\s+|\-\s+|\*\s+|•\s+)(.+)$/);
    if (m && m[2]) {
      goalLines.push(m[2]);
      continue;
    }
    // 若行內有分號或破折號清單，嘗試再切
    if (!m && /;|\u2022|\-/.test(l)) {
      const parts = l.split(/;|•|\-/).map((p) => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        goalLines.push(...parts);
      }
    }
  }

  // 如果沒有偵測到清單，就把整段當 1 條
  const selected = (goalLines.length ? goalLines : [text]).slice(0, 6);

  // 清理 Markdown 粗體/編號修飾
  const clean = (s: string) =>
    s
      .replace(/^\*\*(.+)\*\*$/, "$1")
      .replace(/^\*(.+)\*$/, "$1")
      .replace(/^["“”]+|["“”]+$/g, "")
      .replace(/^:+/, "")
      .trim();

  const now = Date.now();
  return selected.map((t, idx) => ({
    id: `sg-${now}-${idx + 1}`,
    title: clean(t),
    isDone: false,
    order: idx + 1,
  }));
}

// --- 呼叫 Gemini 1.5 Flash ---
async function generateWithGemini(title: string, etaDays?: number | null) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY (set it via: supabase secrets set GEMINI_API_KEY=...)");

  // 針對你的應用撰寫的 prompt（包含使用者輸入）
  const prompt = [
    `You're an expert goal planner. Break the goal into small, concrete, ordered action items.`,
    `Constraints:`,
    `- Audience: busy individual planning realistically.`,
    `- Output: 3–6 bullet points. Each bullet must be a single action sentence.`,
    `- Avoid fluff. No headings. No preface. No summaries.`,
    `- Start each item with an imperative verb (e.g., "Complete", "Draft", "Schedule").`,
    ``,
    `Goal: "${title}"`,
    typeof etaDays === "number" ? `Rough timeline (days): ${etaDays}` : `Timeline: not specified`,
  ].join("\n");

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    encodeURIComponent(apiKey);

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    throw new Error(`Gemini API error: ${r.status} ${r.statusText} ${errText}`);
  }

  const json = await r.json();
  // 典型回傳路徑：.candidates[0].content.parts[].text
  const text =
    json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p?.text ?? "").join("\n").trim() ?? "";

  if (!text) throw new Error("Gemini response is empty");

  return text;
}

// --- Edge Function 主處理器 ---
serve(async (req) => {
  try {
    // 預檢
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

    let payload: { title?: unknown; etaDays?: unknown } = {};
    try {
      payload = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const titleRaw = typeof payload.title === "string" ? payload.title : "";
    const etaRaw =
      typeof payload.etaDays === "number"
        ? payload.etaDays
        : typeof payload.etaDays === "string"
        ? Number.parseInt(payload.etaDays, 10)
        : null;

    const title = titleRaw.trim();
    const etaDays = Number.isFinite(etaRaw as number) ? (etaRaw as number) : null;

    if (!title) return json({ error: "Missing 'title' string in body" }, 400);

    // 呼叫 Gemini
    let text = "";
    try {
      text = await generateWithGemini(title, etaDays);
    } catch (e) {
      // 如果雲端模型掛了，用 fallback 以不中斷前端流程
      console.warn("[Gemini failed]", e);
      const now = Date.now();
      return json([
        { id: `sg-${now}-1`, title: `Define the plan for "${title}"`, isDone: false, order: 1 },
        { id: `sg-${now}-2`, title: "Schedule weekly checkpoints in calendar", isDone: false, order: 2 },
        { id: `sg-${now}-3`, title: "Complete first concrete milestone", isDone: false, order: 3 },
      ]);
    }

    const items = parseSubgoalsTextToItems(text, title);

    // 保底：至少回三條
    if (!items.length) {
      const now = Date.now();
      return json([
        { id: `sg-${now}-1`, title: `Outline steps for "${title}"`, isDone: false, order: 1 },
        { id: `sg-${now}-2`, title: "Block time for weekly progress", isDone: false, order: 2 },
        { id: `sg-${now}-3`, title: "Deliver first measurable result", isDone: false, order: 3 },
      ]);
    }

    return json(items);
  } catch (err) {
    console.error("[breakdown] fatal", err);
    return json({ error: String(err) }, 500);
  }
});