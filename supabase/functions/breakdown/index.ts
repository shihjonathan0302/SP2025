// supabase/functions/breakdown/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request): Promise<Response> => {
  // 必須處理預檢
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const title = typeof body.title === "string" ? body.title : "";
    const etaDays =
      typeof body.etaDays === "number"
        ? body.etaDays
        : Number.isFinite(Number(body.etaDays))
        ? Number(body.etaDays)
        : null;

    const now = Date.now();
    const items = [
      { id: `sg-${now}-1`, title: `Plan for "${title}"`, isDone: false, order: 1 },
      { id: `sg-${now}-2`, title: "Weekly schedule", isDone: false, order: 2 },
      { id: `sg-${now}-3`, title: "First milestone", isDone: false, order: 3 },
    ];

    return new Response(JSON.stringify(items), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Bad Request", details: String(err) }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
