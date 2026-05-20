# Prompt Engineering — Pacific Alpacas

This document covers prompt design for the two AI-backed surfaces in this codebase:

1. **`/functions/chat`** — customer-facing concierge chat
2. **`/functions/recommend`** — AI-powered product recommendation behind the Sleep Test quiz

Both call the Anthropic Messages API (`claude-haiku-4-5-20251001`) directly. We selected Haiku for latency and cost; Pacific Alpacas conversations are short and the recommendation task is single-shot JSON, so reasoning-heavy models would be over-engineered.

---

## 1. Chat assistant — system prompt design

The system prompt (see `supabase/functions/chat/index.ts`) is structured into four explicit sections:

### PERSONA & VOICE
> "Calm, knowledgeable, gently aspirational. Concierge tone — never pushy."

We tried looser phrasings ("friendly assistant", "helpful AI"). They consistently produced upsell-flavored output. Naming the *style of luxury retail* (concierge) anchors register and pace.

### Bilingual persona switching

> "Answer in the same language the customer used. If they wrote in Chinese, reply in Simplified Chinese. If English, reply in English."

This single rule replaces what other implementations do with a language-classifier preprocessing step. Claude reliably mirrors input language when explicitly told to — no `detect_language()` call needed. We specifically say **Simplified Chinese** because mainland customers reading the site expect 简体, not 繁體.

### DOMAIN

A compact factual grounding (farms, certifications, shipping thresholds, traceability code shape). This is the *anti-hallucination layer*. Without it, models invent shipping prices and farm counts when asked.

### GUARDRAILS

The most-iterated section. Each rule is here because we saw it violated in dev testing:

| Rule | Why |
|---|---|
| Never reveal you're an AI | Brand experience — luxury customers should not feel like they're talking to a bot. |
| Never mention model providers | One early test produced "I'm Claude, made by Anthropic" mid-reply when asked "who are you?". |
| Never invent prices, stock, ETAs | Models will confabulate plausible-looking numbers if not told to defer. |
| No medical/allergy/legal advice | Pure liability avoidance — alpaca fiber is hypoallergenic-adjacent and customers ask. |
| Order-specific → deflect to human | The function has no DB access; pretending otherwise would mislead. |
| Under 200 words | Empirically, replies over ~200 words read as AI-generated. |

---

## 2. Output validation — defense in depth

Even with a tight system prompt, ~1% of generations drift. We post-process every reply through `validateOutput()`:

```ts
function validateOutput(content: string): { valid: boolean; fallback?: string }
```

### Rule 1 — length < 5 chars
Catches empty completions (API hiccups, content-filter triggers). Returns Chinese fallback because most short failures we observed were on Chinese inputs hitting moderation.

### Rule 2 — length > 1000 chars
Catches runaway generations that ignored the "under 200 words" rule. Returning the raw output would harm UX (chat bubble overflow); the fallback nudges the user to rephrase.

### Rule 3 — AI self-disclosure phrases
The hardcoded list (`"As an AI"`, `"I'm an AI"`, `"I cannot access"`, `"I don't have access"`) was built from real leak phrases observed during testing. When detected, we replace the entire response with a fallback pointing to human support — keeping the persona intact.

### Why not silent retry?
We considered re-prompting on validation failure. We rejected it because:
- Adds latency (median ~700ms extra)
- The same prompt usually fails the same way
- The fallback is *honest* — it tells the customer "you need a human" rather than hiding the failure

### What validation does NOT do
- It does not detect *factual* hallucinations (e.g. "shipping is NZ$15" when it's actually NZ$25 below the free threshold). Those are mitigated upstream in the system prompt only.
- It does not enforce language matching. We've not observed Claude reply in the wrong language in 100+ test runs.

---

## 3. Sleep recommendation — structured-output prompt

`supabase/functions/recommend/index.ts` is a single-shot product picker. The constraints are tighter than the chat prompt:

```
Return only valid JSON: { product_id, reason_en, reason_zh } — no markdown, no preamble.
Keep each reason under 40 words.
```

### Why these specific words matter

- **"only valid JSON"** — without this, Claude prefixes responses with "Here is the recommendation:" prose. That breaks `JSON.parse()`.
- **"no markdown, no preamble"** — even with "JSON only", Claude sometimes wraps output in ```json fences. Saying "no markdown" cuts this to near-zero. We *also* defensively strip fences in the parser (belt and braces).
- **"under 40 words"** — bilingual UI: both reasons render in a small modal. Longer text breaks the visual rhythm.

### User-message format

```
Customer quiz answers (ordered): ["cold", "medium", "premium", "winter"]

Available products:
- id=abc-123 | Premium Duvet / 高奢款 | tier=duvet | NZ$899 | Heavy weight...

Choose the single best match and respond as JSON only.
```

We pass the **full product catalog** to the model rather than pre-filtering. The model is good at multi-attribute matching (budget × season × concern). Server-side pre-filtering would force us to encode that logic ourselves and lose nuance.

### JSON output constraint — why it matters

If we accepted free-form output and parsed prose with regex, every model upgrade would silently change the contract. Strict JSON gives us:

- **Schema validation** — we verify `product_id` actually exists in our catalog before trusting it (line: `if (!products.some((p) => p.id === parsed.product_id)) parsed = null`). This blocks the rare hallucination where the model invents a UUID.
- **Deterministic UI rendering** — the React component knows exactly what fields to read.
- **Easy fallback** — when parsing fails or the product_id is invalid, we fall back to a budget-tier lookup (`premium → premium tier`, etc.) with generic copy. The user never sees a broken state.

---

## 4. Lessons learned

### What happens without validation

Real dev-log examples that motivated each guardrail:

- **Self-disclosure leak** — User: "Are you a real person?" → Model: "As an AI assistant, I should be transparent that I'm not human. However, I can help you..." (now caught by validateOutput Rule 3)
- **Format drift** — Recommendation function once returned: ```` ```json\n{...}\n``` ```` (now stripped before parsing)
- **Hallucinated product** — Returned `product_id: "duvet-king-size-2024"` which didn't exist (now blocked by post-parse validation against the product list)
- **Runaway length** — Customer asked "tell me about alpacas" and got a 1,400-word essay (now truncated by Rule 2)
- **Wrong currency** — Without explicit "NZD, CNY, USD" in the system prompt, the model would default to USD when answering Chinese-language pricing questions

### General principles

1. **Validation is cheaper than tighter prompts.** Adding clauses to the system prompt has diminishing returns and increases latency on every call. Validation runs only on bad output.
2. **Always pin the model version.** `claude-haiku-4-5-20251001`, not `claude-haiku-latest`. Silent model upgrades are the #1 source of prompt regressions.
3. **Fallback should be honest.** When AI fails, route to a human (`info@pacificalpacas.com`) rather than producing degraded AI output. Customers trust the brand more.
4. **Test in the target language.** A prompt that works in English may fail subtly in Chinese (different tokenization, different moderation triggers). Both `chat` and `recommend` were tested with bilingual inputs.

---

## File reference

- `supabase/functions/chat/index.ts` — system prompt + `validateOutput()`
- `supabase/functions/recommend/index.ts` — recommendation prompt + JSON parser + fallback
- `src/components/SleepQuizDialog.tsx` — calls `/recommend` and persists results to `sleep_assessments`

Last updated: May 2026
