import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { items, currency, shippingInfo, promoCode, promoDiscount } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Build line items for Stripe
    const lineItems = items.map((item: any) => ({
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

    // Calculate subtotal for order
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal >= 500 ? 0 : 25;
    const discount = promoDiscount || 0;
    const total = subtotal - discount + shippingCost;

    // Create order in database
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
        promo_code: promoCode || null,
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

    // Insert order items
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

    // Add shipping as a line item if not free
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: (currency || "nzd").toLowerCase(),
          product_data: { name: "Shipping", description: undefined },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-success?number=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      customer_email: userData.user.email,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
      },
      ...(discount > 0 ? {
        discounts: [{
          coupon: await stripe.coupons.create({
            amount_off: Math.round(discount * 100),
            currency: (currency || "nzd").toLowerCase(),
            duration: "once",
          }).then(c => c.id),
        }],
      } : {}),
    });

    // Update order with payment intent
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
