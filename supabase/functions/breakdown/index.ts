// supabase/functions/breakdown/index.ts
// ✅ Futra Gemini Breakdown Function (Production Clean Version)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

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

// --- 假資料（fallback 用）---
function fallbackItems(title: string, etaDays: number, numPhases: number) {
  const phaseDays = Math.floor(etaDays / numPhases);
  return Array.from({ length: numPhases }, (_, i) => ({
    phase_no: i + 1,
    title: `Phase ${i + 1}: Step toward "${title}"`,
    summary: "Fallback data (Gemini unavailable)",
    phase_days: phaseDays,
    start_condition: "N/A",
    end_condition: "N/A",
    subgoals: Array.from({ length: phaseDays }, (_, d) => ({
      day: d + 1,
      title: `Day ${d + 1} of Phase ${i + 1}: Work on "${title}"`,
    })),
  }));
}

// --- 輔助函式：清理 Gemini 回傳 ---
function sanitizeGeminiText(raw: string) {
  let cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[\r\n]+/g, " ")
    .trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) cleaned = match[0];
  if (!cleaned.endsWith("]")) cleaned += "]";
  return cleaned;
}

// --- Gemini 呼叫 ---
async function generateWithGemini(body: Record<string, any>) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const { title, etaDays = 30, numPhases = 3, category, description, longTermGoal, currentLevel } = body;
  const phaseDays = Math.floor(etaDays / numPhases);

  const prompt = `
You are a productivity planning assistant in Futra.
Generate a structured milestone plan based on this goal context.

Title: "${title}"
Days: ${etaDays}, Phases: ${numPhases}
Category: ${category ?? "General"}
Description: ${description ?? "Not provided"}
Long-term purpose: ${longTermGoal ?? "Not specified"}
Current level: ${currentLevel ?? "Not specified"}

Each phase must include:
- phase_no, title, summary, phase_days, start_condition, end_condition
- subgoals: daily tasks { day, title }

Output valid JSON array only.
`.trim();

  const models = ["gemini-2.5-pro", "gemini-2.5-flash"];
  let responseText = "";
  let lastError = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 8192 },
        }),
      });

      const txt = await res.text();
      if (!res.ok) {
        lastError = txt;
        continue;
      }

      const data = JSON.parse(txt);
      responseText =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("\n")
          .trim() ?? "";

      if (responseText) break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!responseText) throw new Error(`[Gemini failed] ${lastError}`);

  try {
    return JSON.parse(sanitizeGeminiText(responseText));
  } catch (err) {
    console.warn("[WARN] JSON parse failed:", err);
    return [
      { phase_no: 1, title: "Parse failed", summary: "Could not parse Gemini output", subgoals: [{ day: 1, title: responseText.slice(0, 400) }] },
    ];
  }
}

// --- 伺服器主流程 ---
serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

    const body = await req.json().catch(() => ({}));
    if (!body.title) return json({ error: "Missing 'title'" }, 400);

    const output = await generateWithGemini(body).catch((e) => {
      console.error("[Gemini failed, using fallback]", e);
      return fallbackItems(body.title, body.etaDays, body.numPhases);
    });

    return json(output);
  } catch (err) {
    console.error("[breakdown] fatal:", err);
    return json({ error: String(err) }, 500);
  }
});