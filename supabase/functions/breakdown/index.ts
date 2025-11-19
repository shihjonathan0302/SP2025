// supabase/functions/breakdown/index.ts
// Futra - Gemini Breakdown Function (aligned with CreateGoalFlow)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

/* ---------------- CORS / helpers ---------------- */
const corsHeaders: HeadersInit = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
  });
}

function clampInt(v: unknown, def: number, min = 1, max = 3650) {
  const n = typeof v === "number" ? Math.floor(v) : Number.parseInt(String(v ?? ""), 10);
  if (Number.isFinite(n)) return Math.min(max, Math.max(min, n));
  return def;
}

/* ---------------- sanitize / normalize ---------------- */
function sanitizeGeminiText(raw: string) {
  let cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[\r\n]+/g, " ")
    .trim();

  // 只取第一個 JSON array block
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) cleaned = match[0];
  if (!cleaned.endsWith("]")) cleaned += "]";
  return cleaned;
}

type Subgoal = { day?: number; title?: string; [k: string]: unknown };
type Phase = {
  phase_no?: number;
  title?: string;
  summary?: string;
  phase_days?: number;
  start_condition?: string;
  end_condition?: string;
  subgoals?: Subgoal[];
  [k: string]: unknown;
};

function normalizePlan(plan: unknown, numPhases: number): Phase[] {
  const arr = Array.isArray(plan) ? plan : [plan];
  const norm: Phase[] = arr.map((p, idx) => {
    const src = (p ?? {}) as Record<string, unknown>;

    const sg = Array.isArray(src.subgoals) ? (src.subgoals as Subgoal[]) : [];

    // 確保每個 subgoal 至少有 title
    const subgoals = sg
      .map((s, i) => {
        const title = (s?.title ?? s?.toString?.() ?? "").toString().trim();
        if (!title) return null;
        const day =
          typeof s?.day === "number" && Number.isFinite(s.day) ? Math.max(1, Math.floor(s.day)) : i + 1;
        return { day, title };
      })
      .filter(Boolean) as Subgoal[];

    return {
      phase_no:
        typeof src.phase_no === "number" && Number.isFinite(src.phase_no)
          ? Math.max(1, Math.floor(src.phase_no))
          : idx + 1,
      title: (src.title ?? `Phase ${idx + 1}`).toString(),
      summary: (src.summary ?? "").toString(),
      phase_days:
        typeof src.phase_days === "number" && Number.isFinite(src.phase_days)
          ? Math.max(1, Math.floor(src.phase_days))
          : undefined,
      start_condition:
        src.start_condition != null ? src.start_condition!.toString() : undefined,
      end_condition: src.end_condition != null ? src.end_condition!.toString() : undefined,
      subgoals,
    };
  });

  // 若模型回傳相位數不足，補到 numPhases
  for (let i = norm.length; i < numPhases; i++) {
    norm.push({
      phase_no: i + 1,
      title: `Phase ${i + 1}`,
      summary: "",
      subgoals: [],
    });
  }

  return norm.slice(0, Math.max(1, numPhases));
}

/* ---------------- Gemini call ---------------- */
async function callGemini(prompt: string, model: string, apiKey: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 8192,
      },
    }),
  });

  const txt = await res.text();
  if (!res.ok) throw new Error(`[${model}] ${txt}`);

  const data = JSON.parse(txt);
  const raw =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p?.text ?? "")
      ?.join("\n")
      ?.trim() ?? "";

  if (!raw) throw new Error(`[${model}] empty response`);
  return raw;
}

/* ---------------- Fallback plan ---------------- */
function fallbackPlan(title: string, etaDays: number, numPhases: number): Phase[] {
  const phaseDays = Math.max(1, Math.floor(etaDays / Math.max(1, numPhases)));
  return Array.from({ length: numPhases }, (_, i) => ({
    phase_no: i + 1,
    title: `Phase ${i + 1}: ${title}`,
    summary: "Fallback plan (Gemini unavailable or parse failed).",
    phase_days: phaseDays,
    start_condition: "N/A",
    end_condition: "N/A",
    subgoals: Array.from({ length: Math.min(phaseDays, 7) }, (_, d) => ({
      day: d + 1,
      title: `Work toward "${title}" (day ${d + 1})`,
    })),
  }));
}

/* ---------------- Prompt builder ---------------- */
function buildPrompt(input: Record<string, unknown>) {
  const title = (input.title ?? "Untitled Goal").toString();
  const category = (input.category ?? "General").toString();
  const description = (input.description ?? "").toString();
  const motivation = (input.motivation ?? "").toString();
  const priority = (input.priority ?? "Medium").toString();
  const etaDays = clampInt(input.etaDays, 30, 1, 3650);
  const numPhases = clampInt(input.numPhases, 3, 1, 12);

  const context = (input.context ?? {}) as Record<string, unknown>;
  const insights = context.insights ?? {};
  const categoryDetails = context.categoryDetails ?? {};

  return {
    prompt: `
You are Futra, an intelligent productivity assistant.
Generate a clear, structured, and actionable milestone plan ONLY as valid JSON array.

=== GOAL ===
Title: "${title}"
Category: ${category}
Description: ${description || "Not provided"}
Motivation: ${motivation || "Not provided"}
Priority: ${priority}
Duration (days): ${etaDays}
Number of phases: ${numPhases}

=== INSIGHTS (verbatim JSON) ===
${JSON.stringify(insights, null, 2)}

=== CATEGORY DETAILS (verbatim JSON) ===
${JSON.stringify(categoryDetails, null, 2)}

=== STRICT OUTPUT FORMAT ===
Return a JSON array of ${numPhases} objects.
Each object must include:
- "phase_no": number (1-based)
- "title": string
- "summary": string
- "subgoals": array of { "day": number (1-based), "title": string }
Do NOT include any commentary, markdown, or prose outside valid JSON.
`.trim(),
    meta: { title, etaDays, numPhases },
  };
}

/* ---------------- HTTP entry ---------------- */
serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return json({ error: "Missing GEMINI_API_KEY" }, 500);

    const body = await req.json().catch(() => ({}));
    if (!body?.title || String(body.title).trim() === "") {
      return json({ error: "Missing 'title'" }, 400);
    }

    const { prompt, meta } = buildPrompt(body);

    let raw = "";
    let lastErr: unknown = null;

    // 先試 pro，失敗再試 flash
    for (const model of ["gemini-2.5-pro", "gemini-2.5-flash"]) {
      try {
        raw = await callGemini(prompt, model, apiKey);
        if (raw) break;
      } catch (e) {
        lastErr = e;
        // 繼續嘗試下一個 model
      }
    }

    if (!raw) {
      console.error("[Gemini all failed]", lastErr);
      const fb = fallbackPlan(meta.title, meta.etaDays, meta.numPhases);
      return json(fb, 200);
    }

    // 解析與正規化
    let parsed: unknown;
    try {
      parsed = JSON.parse(sanitizeGeminiText(raw));
    } catch (e) {
      console.warn("[Parse warn] falling back to summary bucket:", e);
      const fb = fallbackPlan(meta.title, meta.etaDays, meta.numPhases);
      return json(fb, 200);
    }

    const normalized = normalizePlan(parsed, meta.numPhases);
    return json(normalized, 200);
  } catch (err) {
    console.error("[breakdown] fatal:", err);
    return json({ error: String(err) }, 500);
  }
});