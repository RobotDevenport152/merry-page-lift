import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import { CheckCircle, MapPin, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type OrderStatus = 'loading' | 'paid' | 'pending' | 'payment_failed' | 'not_found';

/**
 * P0 FIX: Previously, this page trusted the URL param ?number= as proof of
 * payment. Any user could navigate to /order-success?number=ANYTHING and see
 * a success screen — whether or not they'd paid.
 *
 * Now we:
 * 1. Look up the order from the DB using the authenticated user's session
 * 2. Show the correct state based on actual DB status (paid / pending / failed)
 * 3. Handle the case where the Stripe webhook hasn't fired yet (polling)
 *
 * Note: The webhook may arrive a few seconds after Stripe redirects the user.
 * We poll up to ~10s before falling back to a "processing" message.
 */
export default function OrderSuccessPage() {
  const { locale, clearCart } = useApp();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const orderNumber = searchParams.get('number') || '';
  const batchCode   = searchParams.get('batch') || 'PA-2025-001';

  const [orderStatus, setOrderStatus] = useState<OrderStatus>('loading');
  const [pollCount, setPollCount] = useState(0);

  const MAX_POLLS = 5;
  const POLL_INTERVAL_MS = 2000;

  useEffect(() => {
    if (!orderNumber || !user) return;

    let cancelled = false;

    async function checkOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .eq('order_number', orderNumber)
        .eq('user_id', user!.id)   // Security: only fetch the authenticated user's own order
        .single();

      if (cancelled) return;

      if (error || !data) {
        setOrderStatus('not_found');
        return;
      }

      const status = data.status as string;

      if (status === 'paid' || status === 'processing' || status === 'shipped' || status === 'delivered') {
        setOrderStatus('paid');
        clearCart(); // P0 FIX: clear cart so user can't accidentally re-order
      } else if (status === 'payment_failed') {
        setOrderStatus('payment_failed');
      } else {
        // Still 'pending' — webhook may not have arrived yet
        setOrderStatus('pending');
      }
    }

    checkOrder();

    return () => { cancelled = true; };
  }, [orderNumber, user]);

  // Poll while pending (webhook may be in-flight)
  useEffect(() => {
    if (orderStatus !== 'pending' || pollCount >= MAX_POLLS) return;

    const timer = setTimeout(async () => {
      if (!orderNumber || !user) return;

      const { data } = await supabase
        .from('orders')
        .select('status')
        .eq('order_number', orderNumber)
        .eq('user_id', user.id)
        .single();

      if (data?.status === 'paid' || data?.status === 'processing') {
        setOrderStatus('paid');
        clearCart();
      } else {
        setPollCount(c => c + 1);
      }
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [orderStatus, pollCount, orderNumber, user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-16 text-center">

        {/* Loading */}
        {orderStatus === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-sm text-muted-foreground">
              {locale === 'zh' ? '正在确认您的订单…' : 'Confirming your order…'}
            </p>
          </div>
        )}

        {/* Payment confirmed */}
        {orderStatus === 'paid' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>

            <h1 className="font-display text-3xl mb-2">
              {locale === 'zh' ? '订单已确认！' : 'Order Confirmed!'}
            </h1>
            <p className="text-muted-foreground font-body mb-2">
              {locale === 'zh' ? '订单编号' : 'Order Number'}
            </p>
            <p className="font-mono text-lg text-gold font-semibold mb-8">{orderNumber}</p>
            <p className="text-muted-foreground font-body text-sm mb-8 max-w-md mx-auto">
              {locale === 'zh'
                ? '付款成功！我们会尽快处理并发货，您将收到一封确认邮件。'
                : 'Payment successful! We will process and ship your order soon. A confirmation email is on its way.'}
            </p>

            <div className="flex gap-4 justify-center mb-10">
              <Link to="/my-orders" className="px-6 py-3 border border-border rounded-sm font-body text-sm hover:bg-secondary transition-colors">
                {locale === 'zh' ? '查看我的订单' : 'My Orders'}
              </Link>
              <Link to="/shop" className="px-6 py-3 bg-accent text-accent-foreground rounded-sm font-body text-sm hover:bg-accent/90 transition-colors">
                {locale === 'zh' ? '继续购物' : 'Continue Shopping'}
              </Link>
            </div>

            {/* Traceability CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="max-w-md mx-auto bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-2 mb-2 justify-center">
                <MapPin className="w-4 h-4 text-gold" />
                <p className="font-display text-lg font-semibold">
                  {locale === 'zh' ? '追溯您的羊驼被' : 'Trace Your Duvet'}
                </p>
              </div>
              <p className="font-mono text-base font-semibold text-gold mb-3">{batchCode}</p>
              <Link
                to={`/traceability?code=${batchCode}`}
                className="block w-full text-center py-2.5 border border-gold/40 text-gold rounded-sm font-body text-sm hover:bg-gold/10 transition-colors"
              >
                {locale === 'zh' ? '📱 查看溯源故事 →' : '📱 View Trace Story →'}
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* Webhook in-flight — still pending after polling */}
        {orderStatus === 'pending' && pollCount >= MAX_POLLS && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="font-display text-2xl mb-4">
              {locale === 'zh' ? '订单处理中…' : 'Order Processing…'}
            </h1>
            <p className="text-muted-foreground font-body text-sm mb-6 max-w-md mx-auto">
              {locale === 'zh'
                ? '付款正在确认中，请稍候。如有疑问请联系我们，订单编号：'
                : 'Your payment is being confirmed. If you have questions, contact us with order number:'}
            </p>
            <p className="font-mono text-gold font-semibold mb-6">{orderNumber}</p>
            <Link to="/contact" className="px-6 py-3 border border-border rounded-sm font-body text-sm hover:bg-secondary">
              {locale === 'zh' ? '联系客服' : 'Contact Support'}
            </Link>
          </motion.div>
        )}

        {/* Payment failed */}
        {orderStatus === 'payment_failed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="font-display text-2xl mb-4">
              {locale === 'zh' ? '支付失败' : 'Payment Failed'}
            </h1>
            <p className="text-muted-foreground font-body text-sm mb-6">
              {locale === 'zh' ? '您的付款未能完成，请重试。' : 'Your payment could not be processed. Please try again.'}
            </p>
            <Link to="/checkout" className="px-6 py-3 bg-accent text-accent-foreground rounded-sm font-body text-sm hover:bg-accent/90">
              {locale === 'zh' ? '重新结账' : 'Try Again'}
            </Link>
          </motion.div>
        )}

        {/* Order not found */}
        {orderStatus === 'not_found' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="font-display text-2xl mb-4">
              {locale === 'zh' ? '未找到订单' : 'Order Not Found'}
            </h1>
            <Link to="/my-orders" className="text-gold hover:underline font-body text-sm">
              {locale === 'zh' ? '查看所有订单' : 'View All Orders'}
            </Link>
          </motion.div>
        )}

      </div>
    </div>
  );
}
