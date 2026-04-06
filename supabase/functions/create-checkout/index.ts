import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// P0 FIX: Restrict CORS to known origins only.
const ALLOWED_ORIGINS = [
  "https://pacificalpacas.com",
  "https://www.pacificalpacas.com",
  "http://localhost:5173",
  "http://localhost:8080",
];

function getCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

// P0 FIX: Promo codes are server-authoritative.
// Client sends code string only — discount is computed here.
const PROMO_CODES: Record<string, { discount: number; type: "percent" | "fixed"; minAmount?: number }> = {
  WELCOME10: { discount: 10, type: "percent" },
  LUXURY20: { discount: 20, type: "percent", minAmount: 500 },
  ALPACA50: { discount: 50, type: "fixed" },
};

function calculatePromoDiscount(code: string | null | undefined, subtotal: number): number {
  if (!code) return 0;
  const promo = PROMO_CODES[code.toUpperCase()];
  if (!promo) return 0;
  if (promo.minAmount && subtotal < promo.minAmount) return 0;
  if (promo.type === "percent") return parseFloat((subtotal * promo.discount / 100).toFixed(2));
  return promo.discount;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // P0 FIX: promoDiscount is NOT accepted from the client — ignored entirely
    const { items, currency, shippingInfo, promoCode } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!shippingInfo?.name || !shippingInfo?.email) {
      return new Response(JSON.stringify({ error: "Missing required shipping info" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity, 0
    );
    const shippingCost = subtotal >= 500 ? 0 : 25;
    // P0 FIX: Server re-derives discount from promo code string
    const discount = calculatePromoDiscount(promoCode, subtotal);
    const total = subtotal - discount + shippingCost;

    const orderNumber = `PA-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userData.user.id,
        status: "pending",
        shipping_name: shippingInfo.name,
        shipping_email: shippingInfo.email,
        shipping_phone: shippingInfo.phone || null,
        shipping_address: {
          province: shippingInfo.province,
          city: shippingInfo.city,
          district: shippingInfo.district,
          address: shippingInfo.address,
        },
        payment_method: "stripe",
        subtotal,
        discount,
        shipping_cost: shippingCost,
        total,
        currency: currency || "NZD",
        promo_code: promoCode ? promoCode.toUpperCase() : null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId || null,
      product_name: item.name,
      variant: item.variant || null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    await serviceClient.from("order_items").insert(orderItems);

    const lineItems: any[] = items.map((item: any) => ({
      price_data: {
        currency: (currency || "nzd").toLowerCase(),
        product_data: {
          name: item.name,
          description: item.variant || undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: (currency || "nzd").toLowerCase(),
          product_data: { name: "Shipping" },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const sessionParams: any = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/order-success?number=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      customer_email: userData.user.email,
      metadata: { order_id: order.id, order_number: orderNumber },
    };

    if (discount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: (currency || "nzd").toLowerCase(),
        duration: "once",
      });
      sessionParams.discounts = [{ coupon: coupon.id }];
    }

    // P1 FIX: Idempotency key prevents duplicate checkout sessions on retries
    const session = await stripe.checkout.sessions.create(sessionParams, {
      idempotencyKey: `checkout-${order.id}`,
    });

    if (session.payment_intent) {
      await serviceClient
        .from("orders")
        .update({ payment_intent_id: session.payment_intent as string })
        .eq("id", order.id);
    }

    return new Response(JSON.stringify({ url: session.url, orderNumber }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  }
});
