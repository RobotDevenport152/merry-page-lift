import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * P0 FIX: Stripe Webhook Handler
 *
 * Previously, orders were written to the DB with status='pending' before payment,
 * and there was NO mechanism to advance them to 'paid'. This caused every successful
 * payment to remain in pending state permanently — stock was never decremented,
 * no fulfillment trigger could fire.
 *
 * This Edge Function:
 *  1. Verifies the Stripe webhook signature (prevents spoofed events)
 *  2. Handles checkout.session.completed → marks order as 'paid', decrements stock
 *  3. Handles payment_intent.payment_failed → marks order as 'payment_failed'
 *
 * Deployment: supabase functions deploy stripe-webhook
 * Stripe Dashboard: set webhook endpoint to
 *   https://<project>.supabase.co/functions/v1/stripe-webhook
 * Required events: checkout.session.completed, payment_intent.payment_failed
 */
serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return new Response("Webhook secret not configured", { status: 400 });
  }

  let event: Stripe.Event;
  const body = await req.text();

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
  });

  try {
    // Critical: verify signature before trusting any payload
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook signature verification failed: ${err.message}`, {
      status: 400,
    });
  }

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (!orderId) {
          console.error("checkout.session.completed: no order_id in metadata");
          break;
        }

        // 1. Mark order as paid with payment intent reference
        const { error: orderError } = await serviceClient
          .from("orders")
          .update({
            status: "paid",
            payment_intent_id: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)
          .eq("status", "pending"); // idempotency guard: only update if still pending

        if (orderError) {
          console.error("Failed to update order status:", orderError);
          // Return 500 so Stripe retries the webhook
          return new Response("Failed to update order", { status: 500 });
        }

        // 2. Decrement stock for each order item
        const { data: items, error: itemsError } = await serviceClient
          .from("order_items")
          .select("product_id, quantity")
          .eq("order_id", orderId);

        if (itemsError) {
          console.error("Failed to fetch order items:", itemsError);
          break;
        }

        for (const item of items ?? []) {
          if (!item.product_id) continue;

          // Use RPC to decrement atomically and prevent race conditions
          const { error: stockError } = await serviceClient.rpc(
            "decrement_product_stock",
            {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            },
          );

          if (stockError) {
            // Log but don't fail the webhook — stock can be reconciled manually
            console.error(
              `Stock decrement failed for product ${item.product_id}:`,
              stockError,
            );
          }
        }

        console.log(`Order ${session.metadata?.order_number} marked as paid`);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;

        // Find the order by payment_intent_id and mark it failed
        const { error } = await serviceClient
          .from("orders")
          .update({
            status: "payment_failed",
            updated_at: new Date().toISOString(),
          })
          .eq("payment_intent_id", pi.id)
          .eq("status", "pending");

        if (error) {
          console.error("Failed to mark order as payment_failed:", error);
        } else {
          console.log(`Payment failed for intent ${pi.id}`);
        }
        break;
      }

      default:
        // Unhandled event types are fine — just acknowledge receipt
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response(`Handler error: ${err.message}`, { status: 500 });
  }
});
