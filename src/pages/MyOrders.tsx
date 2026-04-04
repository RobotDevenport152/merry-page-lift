import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { Package, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
  pending: { zh: '待支付', en: 'Pending' },
  paid: { zh: '已支付', en: 'Paid' },
  processing: { zh: '处理中', en: 'Processing' },
  shipped: { zh: '已发货', en: 'Shipped' },
  delivered: { zh: '已送达', en: 'Delivered' },
};

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
  shipping_name: string;
  order_items: { product_name: string; variant: string | null; quantity: number; unit_price: number }[];
}

export default function MyOrdersPage() {
  const { locale, fp, currency } = useApp();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setOrders(data as any);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl mb-4">{locale === 'zh' ? '请先登录' : 'Please log in'}</h1>
          <Link to="/login" className="text-gold hover:underline font-body">{locale === 'zh' ? '去登录' : 'Log In'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title={locale === 'zh' ? '我的订单' : 'My Orders'} />
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="font-display text-3xl text-center mb-10">{locale === 'zh' ? '我的订单' : 'My Orders'}</h1>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-body mb-4">{locale === 'zh' ? '暂无订单' : 'No orders yet'}</p>
              <Link to="/shop" className="text-gold hover:underline font-body">{locale === 'zh' ? '去选购' : 'Start Shopping'}</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition"
                  >
                    <div>
                      <p className="font-display font-semibold">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground font-body mt-1">
                        {new Date(order.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-NZ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-body ${STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'}`}>
                        {STATUS_LABELS[order.status]?.[locale === 'zh' ? 'zh' : 'en'] || order.status}
                      </span>
                      <span className="text-gold font-display font-semibold">{fp(Number(order.total))}</span>
                      {expandedId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {expandedId === order.id && (
                    <div className="border-t border-border p-5 space-y-3">
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm font-body">
                          <span>{item.product_name} {item.variant ? `(${item.variant})` : ''} ×{item.quantity}</span>
                          <span>{fp(Number(item.unit_price) * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
