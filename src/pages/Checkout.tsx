import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'info' | 'payment' | 'confirm';

export default function CheckoutPage() {
  const { locale, cart, fp, cartTotal, promoDiscount, promoCode, currency, t } = useApp();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('info');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    province: '', city: '', district: '', address: '',
    paymentMethod: 'stripe',
    isGift: false,
    giftMessage: '',
  });

  const shipping = cartTotal >= 500 ? 0 : 25;
  const total = cartTotal - promoDiscount + shipping;

  const steps: { key: Step; labelZh: string; labelEn: string }[] = [
    { key: 'info', labelZh: '收货信息', labelEn: 'Shipping' },
    { key: 'payment', labelZh: '支付', labelEn: 'Payment' },
    { key: 'confirm', labelZh: '确认', labelEn: 'Confirm' },
  ];

  const handleField = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      toast.error(locale === 'zh' ? '请先登录后再提交订单' : 'Please log in to place an order');
      navigate('/login');
      return;
    }

    setSubmitting(true);

    try {
      if (form.paymentMethod === 'stripe') {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            items: cart.map(item => ({
              productId: item.product.id,
              name: locale === 'zh' ? item.product.nameZh : item.product.nameEn,
              price: item.product.prices[currency],
              quantity: item.quantity,
              variant: item.variant,
            })),
            currency,
            shippingInfo: {
              name: form.name,
              email: form.email,
              phone: form.phone,
              province: form.province,
              city: form.city,
              district: form.district,
              address: form.address,
            },
            promoCode,
            promoDiscount,
          },
        });

        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error('No checkout URL returned');
      } else {
        const orderNumber = `PA-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        toast.success(locale === 'zh' ? '订单已提交！' : 'Order submitted!');
        navigate(`/order-success?number=${orderNumber}`);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error(locale === 'zh' ? '支付失败，请重试' : 'Payment failed, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="font-display text-2xl mb-4">{locale === 'zh' ? '购物车为空' : 'Your cart is empty'}</h1>
          <Link to="/shop" className="text-gold hover:underline font-body">{locale === 'zh' ? '去选购' : 'Browse Products'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <h1 className="font-display text-3xl text-center mb-8">{t.checkout.title}</h1>

          {/* Login prompt banner */}
          {!authLoading && !user && (
            <div className="mb-6 bg-gold/10 border border-gold/20 rounded-lg p-4 text-center">
              <p className="font-body text-sm text-muted-foreground">
                {locale === 'zh' ? '提交订单前请先' : 'Please '}
                <Link to="/login" className="text-gold hover:underline font-semibold">
                  {locale === 'zh' ? '登录' : 'log in'}
                </Link>
                {locale === 'zh' ? '您的账户，以便追踪订单。' : ' to track your orders.'}
              </p>
            </div>
          )}

          {/* Step Bar */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {steps.map((s, idx) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body ${
                  steps.findIndex(x => x.key === step) >= idx ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {steps.findIndex(x => x.key === step) > idx ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-sm font-body hidden sm:inline">{locale === 'zh' ? s.labelZh : s.labelEn}</span>
                {idx < steps.length - 1 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div className="lg:col-span-2 space-y-4" key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {step === 'info' && (
                <div className="space-y-4">
                  {[
                    { field: 'name', label: locale === 'zh' ? '姓名' : 'Name', required: true },
                    { field: 'phone', label: locale === 'zh' ? '电话' : 'Phone', required: true },
                    { field: 'email', label: locale === 'zh' ? '邮箱' : 'Email', required: true },
                    { field: 'province', label: locale === 'zh' ? '省份' : 'Province' },
                    { field: 'city', label: locale === 'zh' ? '城市' : 'City' },
                    { field: 'district', label: locale === 'zh' ? '区县' : 'District' },
                    { field: 'address', label: locale === 'zh' ? '详细地址' : 'Address' },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="block text-sm font-body text-muted-foreground mb-1">{f.label} {f.required && '*'}</label>
                      <input
                        value={(form as any)[f.field]}
                        onChange={e => handleField(f.field, e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-sm bg-background text-foreground font-body text-sm"
                      />
                    </div>
                  ))}
                  {/* Gift Mode */}
                  <div className="border border-border rounded-sm p-4 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isGift}
                        onChange={e => handleField('isGift', e.target.checked)}
                        className="mt-0.5 w-4 h-4 flex-shrink-0"
                      />
                      <span className="font-body text-sm">
                        {locale === 'zh'
                          ? '🎁 礼品模式：不在包裹内附含价格信息，并提供礼品包装（+NZD$15）'
                          : '🎁 Gift mode: No price info in package, add gift wrapping (+NZD$15)'}
                      </span>
                    </label>
                    {form.isGift && (
                      <div>
                        <label className="block text-xs font-body text-muted-foreground mb-1">
                          {locale === 'zh' ? '礼品留言（将打印在精美卡片上随产品寄出）' : 'Gift message (printed on a card included with the order)'}
                        </label>
                        <textarea
                          value={form.giftMessage}
                          onChange={e => handleField('giftMessage', e.target.value)}
                          maxLength={100}
                          rows={3}
                          placeholder={locale === 'zh' ? '写下您的祝福语，最多100字…' : 'Your message, up to 100 characters…'}
                          className="w-full px-3 py-2 border border-border rounded-sm bg-background text-foreground font-body text-sm resize-none focus:outline-none focus:border-gold transition-colors"
                        />
                        <p className="text-xs text-muted-foreground font-body text-right mt-0.5">{form.giftMessage.length}/100</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!form.name || !form.email || !form.phone) {
                        toast.error(locale === 'zh' ? '请填写必填项' : 'Please fill required fields');
                        return;
                      }
                      setStep('payment');
                    }}
                    className="w-full py-3 bg-accent text-accent-foreground font-body font-medium rounded-sm hover:bg-accent/90 transition-colors"
                  >
                    {locale === 'zh' ? '下一步' : 'Continue'}
                  </button>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-4">
                  {[
                    { value: 'stripe', labelZh: '国际信用卡 (Stripe)', labelEn: 'Credit Card (Stripe)' },
                    { value: 'wechat', labelZh: '微信支付', labelEn: 'WeChat Pay' },
                    { value: 'alipay', labelZh: '支付宝', labelEn: 'Alipay' },
                  ].map(pm => (
                    <button
                      key={pm.value}
                      onClick={() => handleField('paymentMethod', pm.value)}
                      className={`w-full text-left px-4 py-3 border rounded-sm font-body text-sm transition-colors ${
                        form.paymentMethod === pm.value
                          ? 'border-accent bg-accent/5 text-foreground'
                          : 'border-border text-foreground hover:border-accent'
                      }`}
                    >
                      {locale === 'zh' ? pm.labelZh : pm.labelEn}
                      {pm.value === 'stripe' && <span className="ml-2 text-xs text-muted-foreground"><Lock className="w-3 h-3 inline" /> Secured by Stripe</span>}
                    </button>
                  ))}
                  <div className="flex gap-3">
                    <button onClick={() => setStep('info')} className="px-6 py-3 border border-border text-foreground rounded-sm font-body text-sm hover:bg-secondary">
                      {locale === 'zh' ? '返回' : 'Back'}
                    </button>
                    <button onClick={() => setStep('confirm')} className="flex-1 py-3 bg-accent text-accent-foreground font-body font-medium rounded-sm hover:bg-accent/90 transition-colors">
                      {locale === 'zh' ? '确认订单' : 'Review Order'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'confirm' && (
                <div className="space-y-4">
                  <div className="bg-card p-4 rounded-sm border border-border text-sm font-body space-y-1">
                    <p><span className="text-muted-foreground">{locale === 'zh' ? '收件人：' : 'Name: '}</span>{form.name}</p>
                    <p><span className="text-muted-foreground">{locale === 'zh' ? '电话：' : 'Phone: '}</span>{form.phone}</p>
                    <p><span className="text-muted-foreground">{locale === 'zh' ? '邮箱：' : 'Email: '}</span>{form.email}</p>
                    <p><span className="text-muted-foreground">{locale === 'zh' ? '地址：' : 'Address: '}</span>{form.province} {form.city} {form.district} {form.address}</p>
                    <p><span className="text-muted-foreground">{locale === 'zh' ? '支付方式：' : 'Payment: '}</span>
                      {form.paymentMethod === 'stripe' ? t.checkout.stripe : form.paymentMethod === 'wechat' ? t.checkout.wechat : t.checkout.alipay}
                    </p>
                    {form.isGift && (
                      <p className="text-gold">
                        <span className="text-muted-foreground">{locale === 'zh' ? '礼品包装：' : 'Gift wrapping: '}</span>
                        {locale === 'zh' ? '是（不含价格信息）' : 'Yes (no price included)'}
                        {form.giftMessage && <span className="block text-muted-foreground">"{form.giftMessage}"</span>}
                      </p>
                    )}
                  </div>
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3 bg-card p-3 rounded-sm border border-border">
                      <img src={item.product.image} alt="" className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-body text-sm font-semibold">{locale === 'zh' ? item.product.nameZh : item.product.nameEn}</p>
                        <p className="text-xs text-muted-foreground">{item.variant} × {item.quantity}</p>
                      </div>
                      <p className="text-gold font-body font-semibold">{fp(item.product.prices[currency] * item.quantity)}</p>
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <button onClick={() => setStep('payment')} className="px-6 py-3 border border-border text-foreground rounded-sm font-body text-sm hover:bg-secondary">
                      {locale === 'zh' ? '返回' : 'Back'}
                    </button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={submitting}
                      className="flex-1 py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                      {submitting
                        ? (locale === 'zh' ? '提交中...' : 'Submitting...')
                        : `${locale === 'zh' ? '提交订单' : 'Place Order'} ${fp(total)}`}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <div className="bg-card p-6 rounded-lg border border-border h-fit">
              <h3 className="font-display text-lg mb-4">{locale === 'zh' ? '订单摘要' : 'Order Summary'}</h3>
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm font-body py-1">
                  <span>{locale === 'zh' ? item.product.nameZh : item.product.nameEn} ×{item.quantity}</span>
                  <span>{fp(item.product.prices[currency] * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-border mt-3 pt-3 space-y-1 text-sm font-body">
                <div className="flex justify-between"><span>{locale === 'zh' ? '小计' : 'Subtotal'}</span><span>{fp(cartTotal)}</span></div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-gold"><span>{locale === 'zh' ? '折扣' : 'Discount'}</span><span>-{fp(promoDiscount)}</span></div>
                )}
                <div className="flex justify-between"><span>{locale === 'zh' ? '运费' : 'Shipping'}</span><span>{shipping === 0 ? (locale === 'zh' ? '免运费' : 'Free') : fp(shipping)}</span></div>
                <div className="flex justify-between font-display text-lg font-semibold pt-2 border-t border-border">
                  <span>{t.checkout.total}</span>
                  <span className="text-gold">{fp(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
