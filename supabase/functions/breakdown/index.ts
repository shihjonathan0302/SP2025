// supabase/functions/breakdown/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const { title, etaDays } = await req.json().catch(() => ({ title: "", etaDays: null }));

  const now = Date.now();
  const items = [
    { id: `sg-${now}-1`, title: `Plan for "${title}"`, isDone: false, order: 1 },
    { id: `sg-${now}-2`, title: "Weekly schedule", isDone: false, order: 2 },
    { id: `sg-${now}-3`, title: "First milestone", isDone: false, order: 3 },
  ];

  return Response.json(items);
});
