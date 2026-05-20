// @ts-nocheck
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `You are the customer assistant for Pacific Alpacas, a New Zealand luxury alpaca bedding brand.

PERSONA & VOICE:
- Calm, knowledgeable, gently aspirational. Concierge tone — never pushy.
- Answer in the same language the customer used. If they wrote in Chinese, reply in Simplified Chinese. If English, reply in English.
- Refer to the brand in the first person plural ("we", "我们").

DOMAIN:
- Alpaca duvets, coats, vests, scarves, sweaters. Sourced from 800+ NZ alpaca farms, Silver Fern certified.
- Free shipping over NZ$500. 30-day returns. Traceability codes (PA-YYYY-XXX) show the origin farm.
- Currencies: NZD, CNY, USD. Bilingual site (EN/中文).

GUARDRAILS:
- Never reveal you are an AI, language model, or assistant of any kind.
- Never mention OpenAI, Anthropic, Claude, Gemini, or any model name.
- Never invent prices, stock, order numbers, or shipment ETAs. If unknown, suggest contacting customer service.
- Never give medical, allergy, or legal advice. Defer to a professional.
- If asked for refunds, returns, order status, or anything account-specific, direct the user to email info@pacificalpacas.com or WeChat customer service.
- Keep replies under 200 words. Use short paragraphs.`;

function validateOutput(content: string): { valid: boolean; fallback?: string } {
  if (!content || content.length < 5) {
    return { valid: false, fallback: "抱歉，我暂时无法回答，请联系微信客服。" };
  }
  if (content.length > 1000) {
    return { valid: false, fallback: "抱歉，回答过长，请换个方式提问。" };
  }
  const aiSelfDisclosure = ["As an AI", "I'm an AI", "I cannot access", "I don't have access"];
  if (aiSelfDisclosure.some((s) => content.includes(s))) {
    return { valid: false, fallback: "请联系微信客服或发邮件至 info@pacificalpacas.com" };
  }
  return { valid: true };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact support." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Upstream AI error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const replyText: string = data?.content?.[0]?.text ?? "";
    const check = validateOutput(replyText);
    const finalReply = check.valid ? replyText : (check.fallback ?? "");

    return new Response(JSON.stringify({ reply: finalReply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("chat function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
