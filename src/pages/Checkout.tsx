import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { checkoutSchema, type CheckoutFormData } from '@/lib/schemas';

type Step = 'info' | 'payment' | 'confirm';

export default function CheckoutPage() {
  const { locale, cart, fp, cartTotal, promoDiscount, promoCode, currency, t } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('info');
  const [submitting, setSubmitting] = useState(false);

  // P2 FIX: Replace manual useState form management with react-hook-form + Zod.
  // Previously the form had no validation schema — required fields were checked
  // with a manual if-statement. Now every field is validated against checkoutSchema.
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'stripe',
      isGift: false,
      giftMessage: '',
    },
  });

  const isGift = watch('isGift');
  const paymentMethod = watch('paymentMethod');
  const giftMessage = watch('giftMessage') ?? '';

  const shipping = cartTotal >= 500 ? 0 : 25;
  const total = cartTotal - promoDiscount + shipping;

  const steps: { key: Step; labelZh: string; labelEn: string }[] = [
    { key: 'info', labelZh: '收货信息', labelEn: 'Shipping' },
    { key: 'payment', labelZh: '支付', labelEn: 'Payment' },
    { key: 'confirm', labelZh: '确认', labelEn: 'Confirm' },
  ];

  // Validation for step 1 — only the fields relevant to this step
  const validateInfoStep = handleSubmit(
    () => setStep('payment'),
    (errs) => {
      const relevantError = errs.name || errs.email || errs.phone;
      if (relevantError) {
        toast.error(locale === 'zh' ? '请填写必填项' : 'Please fill required fields');
      }
    },
  );

  const handleSubmitOrder = handleSubmit(async (formData: CheckoutFormData) => {
    if (!user) {
      toast.error(locale === 'zh' ? '请先登录后再提交订单' : 'Please log in to place an order');
      navigate('/login');
      return;
    }

    setSubmitting(true);

    try {
      if (formData.paymentMethod === 'stripe') {
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
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              province: formData.province,
              city: formData.city,
              district: formData.district,
              address: formData.address,
            },
            // P0 FIX: Send only the promo code string — server recalculates the discount
            promoCode: promoCode || undefined,
          },
        });

        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error('No checkout URL returned');
      } else {
        // WeChat / Alipay — placeholder until those integrations are built
        toast.info(locale === 'zh' ? '该支付方式暂未开通，请选择信用卡支付' : 'This payment method is not available yet. Please use credit card.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error(locale === 'zh' ? '支付失败，请重试' : 'Payment failed, please try again');
    } finally {
      setSubmitting(false);
    }
  });

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="font-display text-2xl mb-4">
            {locale === 'zh' ? '购物车为空' : 'Your cart is empty'}
          </h1>
          <Link to="/shop" className="text-gold hover:underline font-body">
            {locale === 'zh' ? '去选购' : 'Browse Products'}
          </Link>
        </div>
      </div>
    );
  }

  const fieldClass = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-sm bg-background text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors ${
      hasError ? 'border-destructive' : 'border-border'
    }`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <h1 className="font-display text-3xl text-center mb-8">{t.checkout.title}</h1>

          {/* Step Bar */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {steps.map((s, idx) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body ${
                    steps.findIndex(x => x.key === step) >= idx
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {steps.findIndex(x => x.key === step) > idx ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className="text-sm font-body hidden sm:inline">
                  {locale === 'zh' ? s.labelZh : s.labelEn}
                </span>
                {idx < steps.length - 1 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              className="lg:col-span-2 space-y-4"
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* ── Step 1: Shipping Info ── */}
              {step === 'info' && (
                <div className="space-y-4">
                  {[
                    { field: 'name' as const, label: locale === 'zh' ? '姓名 *' : 'Name *' },
                    { field: 'phone' as const, label: locale === 'zh' ? '电话 *' : 'Phone *' },
                    { field: 'email' as const, label: locale === 'zh' ? '邮箱 *' : 'Email *' },
                    { field: 'province' as const, label: locale === 'zh' ? '省份' : 'Province' },
                    { field: 'city' as const, label: locale === 'zh' ? '城市' : 'City' },
                    { field: 'district' as const, label: locale === 'zh' ? '区县' : 'District' },
                    { field: 'address' as const, label: locale === 'zh' ? '详细地址' : 'Address' },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="block text-sm font-body text-muted-foreground mb-1">
                        {f.label}
                      </label>
                      <input
                        {...register(f.field)}
                        className={fieldClass(!!errors[f.field])}
                      />
                      {errors[f.field] && (
                        <p className="text-xs text-destructive mt-1 font-body">
                          {errors[f.field]?.message}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Gift Mode */}
                  <div className="border border-border rounded-sm p-4 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('isGift')}
                        className="mt-0.5 w-4 h-4 flex-shrink-0"
                      />
                      <span className="font-body text-sm">
                        {locale === 'zh'
                          ? '🎁 礼品模式：不在包裹内附含价格信息，并提供礼品包装（+NZD$15）'
                          : '🎁 Gift mode: No price info in package, add gift wrapping (+NZD$15)'}
                      </span>
                    </label>
                    {isGift && (
                      <div>
                        <label className="block text-xs font-body text-muted-foreground mb-1">
                          {locale === 'zh'
                            ? '礼品留言（将打印在精美卡片上随产品寄出）'
                            : 'Gift message (printed on a card included with the order)'}
                        </label>
                        <textarea
                          {...register('giftMessage')}
                          maxLength={100}
                          rows={3}
                          placeholder={
                            locale === 'zh'
                              ? '写下您的祝福语，最多100字…'
                              : 'Your message, up to 100 characters…'
                          }
                          className="w-full px-3 py-2 border border-border rounded-sm bg-background text-foreground font-body text-sm resize-none focus:outline-none focus:border-gold transition-colors"
                        />
                        <p className="text-xs text-muted-foreground font-body text-right mt-0.5">
                          {giftMessage.length}/100
                        </p>
                        {errors.giftMessage && (
                          <p className="text-xs text-destructive mt-1 font-body">
                            {errors.giftMessage.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={validateInfoStep}
                    className="w-full py-3 bg-accent text-accent-foreground font-body font-medium rounded-sm hover:bg-accent/90 transition-colors"
                  >
                    {locale === 'zh' ? '下一步' : 'Continue'}
                  </button>
                </div>
              )}

              {/* ── Step 2: Payment Method ── */}
              {step === 'payment' && (
                <div className="space-y-4">
                  {[
                    { value: 'stripe' as const, labelZh: '国际信用卡 (Stripe)', labelEn: 'Credit Card (Stripe)' },
                    { value: 'wechat' as const, labelZh: '微信支付', labelEn: 'WeChat Pay' },
                    { value: 'alipay' as const, labelZh: '支付宝', labelEn: 'Alipay' },
                  ].map(pm => (
                    <button
                      key={pm.value}
                      type="button"
                      onClick={() => setValue('paymentMethod', pm.value)}
                      className={`w-full text-left px-4 py-3 border rounded-sm font-body text-sm transition-colors ${
                        paymentMethod === pm.value
                          ? 'border-accent bg-accent/5 text-foreground'
                          : 'border-border text-foreground hover:border-accent'
                      }`}
                    >
                      {locale === 'zh' ? pm.labelZh : pm.labelEn}
                      {pm.value === 'stripe' && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          <Lock className="w-3 h-3 inline" /> Secured by Stripe
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('info')}
                      className="px-6 py-3 border border-border text-foreground rounded-sm font-body text-sm hover:bg-secondary"
                    >
                      {locale === 'zh' ? '返回' : 'Back'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep('confirm')}
                      className="flex-1 py-3 bg-accent text-accent-foreground font-body font-medium rounded-sm hover:bg-accent/90 transition-colors"
                    >
                      {locale === 'zh' ? '确认订单' : 'Review Order'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Confirm ── */}
              {step === 'confirm' && (
                <div className="space-y-4">
                  <div className="bg-card p-4 rounded-sm border border-border text-sm font-body space-y-1">
                    <p>
                      <span className="text-muted-foreground">
                        {locale === 'zh' ? '收件人：' : 'Name: '}
                      </span>
                      {watch('name')}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        {locale === 'zh' ? '电话：' : 'Phone: '}
                      </span>
                      {watch('phone')}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        {locale === 'zh' ? '邮箱：' : 'Email: '}
                      </span>
                      {watch('email')}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        {locale === 'zh' ? '地址：' : 'Address: '}
                      </span>
                      {[watch('province'), watch('city'), watch('district'), watch('address')]
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        {locale === 'zh' ? '支付方式：' : 'Payment: '}
                      </span>
                      {paymentMethod === 'stripe'
                        ? t.checkout.stripe
                        : paymentMethod === 'wechat'
                        ? t.checkout.wechat
                        : t.checkout.alipay}
                    </p>
                    {isGift && (
                      <p className="text-gold">
                        <span className="text-muted-foreground">
                          {locale === 'zh' ? '礼品包装：' : 'Gift wrapping: '}
                        </span>
                        {locale === 'zh' ? '是（不含价格信息）' : 'Yes (no price included)'}
                        {giftMessage && (
                          <span className="block text-muted-foreground">"{giftMessage}"</span>
                        )}
                      </p>
                    )}
                  </div>

                  {cart.map(item => (
                    <div
                      key={`${item.product.id}-${item.variant}`}
                      className="flex items-center gap-3 bg-card p-3 rounded-sm border border-border"
                    >
                      <img
                        src={item.product.image}
                        alt=""
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-body text-sm font-semibold">
                          {locale === 'zh' ? item.product.nameZh : item.product.nameEn}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.variant} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-gold font-body font-semibold">
                        {fp(item.product.prices[currency] * item.quantity)}
                      </p>
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('payment')}
                      className="px-6 py-3 border border-border text-foreground rounded-sm font-body text-sm hover:bg-secondary"
                    >
                      {locale === 'zh' ? '返回' : 'Back'}
                    </button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={submitting}
                      className="flex-1 py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                      {submitting
                        ? locale === 'zh'
                          ? '提交中...'
                          : 'Submitting...'
                        : `${locale === 'zh' ? '提交订单' : 'Place Order'} ${fp(total)}`}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Order Summary Sidebar */}
            <div className="bg-card p-6 rounded-lg border border-border h-fit">
              <h3 className="font-display text-lg mb-4">
                {locale === 'zh' ? '订单摘要' : 'Order Summary'}
              </h3>
              {cart.map(item => (
                <div
                  key={`${item.product.id}-${item.variant}`}
                  className="flex justify-between text-sm font-body py-1"
                >
                  <span>
                    {locale === 'zh' ? item.product.nameZh : item.product.nameEn} ×
                    {item.quantity}
                  </span>
                  <span>{fp(item.product.prices[currency] * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-border mt-3 pt-3 space-y-1 text-sm font-body">
                <div className="flex justify-between">
                  <span>{locale === 'zh' ? '小计' : 'Subtotal'}</span>
                  <span>{fp(cartTotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>{locale === 'zh' ? '折扣' : 'Discount'}</span>
                    <span>-{fp(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{locale === 'zh' ? '运费' : 'Shipping'}</span>
                  <span>
                    {shipping === 0
                      ? locale === 'zh'
                        ? '免运费'
                        : 'Free'
                      : fp(shipping)}
                  </span>
                </div>
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
