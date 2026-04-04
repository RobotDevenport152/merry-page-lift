import { useApp } from '@/contexts/AppContext';
import { X, Plus, Minus, Tag, Truck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type Currency } from '@/lib/store';

const FREE_SHIPPING_THRESHOLD: Record<Currency, number> = { NZD: 500, CNY: 2250, USD: 300 };

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal, promoDiscount, applyPromo, promoCode, fp, t, locale, currency } = useApp();
  const [codeInput, setCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!cartOpen) return null;

  const handleApply = () => {
    const ok = applyPromo(codeInput);
    setPromoError(ok ? '' : locale === 'zh' ? '无效优惠码' : 'Invalid promo code');
  };

  const shipping = cartTotal >= 500 ? 0 : 25;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/40 z-50" onClick={() => setCartOpen(false)} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl font-semibold">{t.cart.title}</h2>
          <button onClick={() => setCartOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shipping progress bar */}
        {(() => {
          const threshold = FREE_SHIPPING_THRESHOLD[currency];
          const remaining = threshold - cartTotal;
          const progress = Math.min(100, (cartTotal / threshold) * 100);
          return (
            <div className="px-6 py-3 bg-muted/50 border-b border-border">
              {remaining <= 0 ? (
                <p className="text-xs font-body text-green-700 flex items-center justify-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  {locale === 'zh' ? '🎉 已享免运费！' : '🎉 Free shipping applied!'}
                </p>
              ) : (
                <>
                  <div className="flex justify-between text-xs font-body text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{locale === 'zh' ? `再消费 ${fp(remaining)} 享免运费` : `${fp(remaining)} more for free shipping`}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </>
              )}
            </div>
          );
        })()}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body mb-4">{t.cart.empty}</p>
              <button onClick={() => setCartOpen(false)} className="text-sm text-gold underline font-body">
                {t.cart.continueShopping}
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.product.id}-${item.variant}`} className="flex gap-4 bg-card rounded-lg p-4">
                <img src={item.product.image} alt={locale === 'zh' ? item.product.nameZh : item.product.nameEn} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm truncate">
                    {locale === 'zh' ? item.product.nameZh : item.product.nameEn}
                  </h3>
                  {item.variant && <p className="text-xs text-muted-foreground font-body">{item.variant}</p>}
                  <p className="text-gold font-body font-semibold text-sm mt-1">{fp(item.product.prices[currency])}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-body w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeFromCart(item.product.id)} className="ml-auto text-xs text-muted-foreground hover:text-destructive font-body">
                      {t.cart.remove}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-border p-6 pb-safe space-y-4">
            {/* Promo code */}
            {!promoCode ? (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t.cart.promoCode}
                    value={codeInput}
                    onChange={e => setCodeInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleApply()}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded text-sm font-body bg-background"
                  />
                </div>
                <button onClick={handleApply} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-body rounded hover:opacity-90 transition">
                  {t.cart.apply}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm font-body">
                <span className="text-gold">✓ {promoCode}</span>
                <button onClick={() => { /* reset promo */ }} className="text-xs text-muted-foreground underline">{locale === 'zh' ? '移除' : 'Remove'}</button>
              </div>
            )}
            {promoError && <p className="text-xs text-destructive font-body">{promoError}</p>}
            {promoCode && promoDiscount > 0 && !promoError && (
              <p className="text-xs text-gold font-body">🎉 -{fp(promoDiscount)}</p>
            )}

            <div className="space-y-1 text-sm font-body">
              <div className="flex justify-between"><span>{t.cart.subtotal}</span><span>{fp(cartTotal)}</span></div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-gold"><span>{locale === 'zh' ? '折扣' : 'Discount'}</span><span>-{fp(promoDiscount)}</span></div>
              )}
              <div className="flex justify-between">
                <span>{locale === 'zh' ? '运费' : 'Shipping'}</span>
                <span>{shipping === 0 ? (locale === 'zh' ? '免运费' : 'Free') : fp(shipping)}</span>
              </div>
              <div className="flex justify-between font-display text-lg font-semibold pt-2 border-t border-border">
                <span>{locale === 'zh' ? '合计' : 'Total'}</span>
                <span className="text-gold">{fp(cartTotal - promoDiscount + shipping)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={() => setCartOpen(false)}
              className="block w-full py-3 bg-accent text-accent-foreground text-center font-body font-semibold rounded tracking-wider hover:bg-accent/90 transition"
            >
              {t.cart.checkout}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
