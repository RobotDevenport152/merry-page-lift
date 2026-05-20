# Stripe Webhook Setup

The `stripe-webhook` edge function handles asynchronous payment events from Stripe — it is what marks orders as `paid` and decrements product stock atomically. Until the webhook endpoint is registered in your Stripe Dashboard, orders will stay in the `pending` status forever.

## 1. Locate your webhook URL

The webhook is deployed at:

```
https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook
```

For this project:

```
https://zgwecvxcblzwghvskrni.supabase.co/functions/v1/stripe-webhook
```

## 2. Register the endpoint in Stripe

1. Open the [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks).
2. Click **Add endpoint**.
3. Paste the URL from step 1.
4. Under **Events to send**, add:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed` *(only if you rely on session-level metadata)*
5. Click **Add endpoint**.

## 3. Copy the signing secret

After the endpoint is created, Stripe shows a **Signing secret** that starts with `whsec_...`.

Copy it. This secret is what the edge function uses to verify that webhook calls genuinely came from Stripe.

## 4. Store the secret in Lovable Cloud

The project already has a secret named `STRIPE_WEBHOOK_SECRET`. Update it (or add it if missing) via **Lovable Cloud → Edge Function Secrets**. The edge function reads it as `Deno.env.get("STRIPE_WEBHOOK_SECRET")`.

> Do **not** commit this secret to the repo. It is environment-scoped.

## 5. Test it

### Option A — Stripe CLI (local dev)

```bash
stripe listen --forward-to https://zgwecvxcblzwghvskrni.supabase.co/functions/v1/stripe-webhook
# Or to a local instance:
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

Then trigger an event:

```bash
stripe trigger payment_intent.succeeded
```

### Option B — Production smoke test

1. Complete a real test-card checkout (`4242 4242 4242 4242`).
2. Open **Stripe Dashboard → Webhooks → your endpoint** and confirm the event shows a `200 OK` response.
3. In the database, verify:
   - The `orders` row for that session has `status = 'paid'`.
   - The `products.stock` for purchased items has decremented.

## 6. Troubleshooting

| Symptom | Likely cause |
|---|---|
| Stripe shows `401 Unauthorized` | `STRIPE_WEBHOOK_SECRET` mismatch — re-copy from Stripe Dashboard. |
| Stripe shows `400` with "no signature" | Function is being called without the `Stripe-Signature` header (someone hit the URL directly). Safe to ignore. |
| Orders stay `pending` even after a `200 OK` | The webhook handler errored after signature verification — check `supabase functions logs stripe-webhook`. |
| Stock not decrementing | Verify the `decrement_product_stock` RPC exists and the `product_id` in `order_items` matches a real product. |
