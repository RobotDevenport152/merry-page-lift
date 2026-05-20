// @ts-nocheck
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `You are a sleep consultant for Pacific Alpacas NZ luxury alpaca bedding. Given quiz answers and product list, recommend ONE product. Return only valid JSON: { product_id, reason_en, reason_zh } — no markdown, no preamble. Keep each reason under 40 words.`;

interface Product {
  id: string;
  name_en: string;
  name_zh: string;
  tier?: string;
  price_nzd: number;
  description_en?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { answers, products } = await req.json() as {
      answers: string[];
      products: Product[];
    };

    if (!Array.isArray(answers) || !Array.isArray(products) || products.length === 0) {
      return new Response(JSON.stringify({ error: "answers[] and products[] required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing ANTHROPIC_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Customer quiz answers (ordered): ${JSON.stringify(answers)}

Available products:
${products.map((p) => `- id=${p.id} | ${p.name_en} / ${p.name_zh} | tier=${p.tier ?? "n/a"} | NZ$${p.price_nzd} | ${p.description_en ?? ""}`).join("\n")}

Choose the single best match and respond as JSON only.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: { product_id: string; reason_en: string; reason_zh: string } | null = null;
    if (response.ok) {
      const data = await response.json();
      const text: string = data?.content?.[0]?.text ?? "";
      try {
        // Strip any accidental code fences
        const cleaned = text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(cleaned);
        // Verify product_id is in the list
        if (!products.some((p) => p.id === parsed!.product_id)) {
          parsed = null;
        }
      } catch (e) {
        console.error("Parse error:", e, text);
      }
    } else {
      console.error("Anthropic error:", response.status, await response.text());
    }

    // Fallback recommendation: budget-tier mapping if AI failed
    if (!parsed) {
      const budgetAnswer = answers[2] ?? "mid";
      const tierMap: Record<string, string> = { premium: "premium", mid: "luxury", budget: "classic" };
      const wanted = tierMap[budgetAnswer] ?? "luxury";
      const fallbackProduct =
        products.find((p) => (p.tier ?? "").toLowerCase().includes(wanted)) ?? products[0];
      parsed = {
        product_id: fallbackProduct.id,
        reason_en: "A balanced choice matching your sleep needs and preferences.",
        reason_zh: "根据您的睡眠需求和偏好为您推荐的理想选择。",
      };
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("recommend error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
