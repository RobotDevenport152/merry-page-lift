import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Thermometer, Feather, Droplets, Bug, Zap, ShoppingBag, Star, ArrowRight } from 'lucide-react';
import GrowerNetworkSection from '@/components/GrowerNetworkSection';
import Footer from '@/components/Footer';
import { SleepQuizDialog } from '@/components/SleepQuizDialog';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';

const REVIEWS = [
  {
    textZh: '第一次睡羊驼被，完全没有想到这么轻——比我用了十年的羽绒被轻了一半，但比它暖得多。最关键的是买了两个月我的过敏性鼻炎改善了很多。',
    textEn: 'My first alpaca duvet and I was amazed by how light it is — half the weight of my decade-old down duvet but much warmer. Most importantly, my allergies have improved significantly in two months.',
    authorZh: '张女士，上海',
    authorEn: 'Ms. Zhang, Shanghai',
    date: '2025年3月',
    productZh: '轻奢款冬被 220×240cm',
    productEn: 'Luxury Duvet 220×240cm',
  },
  {
    textZh: '送给父母的退休礼物，他们用了一周就打电话来说"终于睡了个好觉"。物流很快，包装非常精美，有溯源证书，拆箱的仪式感非常好。',
    textEn: 'Bought as a retirement gift for my parents. Within a week they called to say "finally had a good night\'s sleep." Fast shipping, beautiful packaging, and the traceability certificate was a lovely touch.',
    authorZh: '李先生，北京',
    authorEn: 'Mr. Li, Beijing',
    date: '2025年1月',
    productZh: '高奢款被 200×230cm',
    productEn: 'Premium Duvet 200×230cm',
  },
  {
    textZh: '有顾虑担心宝宝皮肤会过敏，客服回复非常专业，详细介绍了灭菌工艺。收到后发现面料真的很柔软，宝宝睡得很踏实。',
    textEn: 'I was worried about my baby\'s skin sensitivity. Customer service was very professional and explained the sterilization process in detail. The fabric is incredibly soft and baby sleeps soundly.',
    authorZh: '王女士，成都',
    authorEn: 'Ms. Wang, Chengdu',
    date: '2024年12月',
    productZh: '初生羊驼被',
    productEn: 'Newborn Alpaca Blanket',
  },
];

export default function HeroSection() {
  const { t, locale, fp, currency, addToCart } = useApp();
  const [quizOpen, setQuizOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmailInput('');
  };
  const { data: featuredProducts } = useFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-comforter.jpg" alt="Pacific Alpacas Luxury Duvet" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/30 to-primary/70" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p className="text-primary-foreground/70 text-xs tracking-[0.4em] uppercase font-body mb-6 animate-fade-in">
            {t.hero.subtitle}
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary-foreground font-light mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t.hero.title}
          </h1>
          <p className="font-display text-xl md:text-2xl text-gold-light italic mb-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {t.hero.tagline}
          </p>
          <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <a href="/shop" className="border border-primary-foreground/40 text-primary-foreground px-10 py-4 text-sm tracking-[0.2em] uppercase font-body hover:bg-primary-foreground/10 transition-all">
              {t.hero.cta}
            </a>
            <button
              onClick={() => setQuizOpen(true)}
              className="border border-gold/40 text-gold px-8 py-4 text-sm tracking-[0.2em] uppercase font-body hover:bg-gold/10 transition-all"
            >
              {locale === 'zh' ? '睡眠测试' : 'Sleep Quiz'}
            </button>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <p className="text-primary-foreground/40 text-xs tracking-[0.3em] uppercase font-body mb-2">{t.hero.scroll}</p>
            <div className="w-px h-12 bg-primary-foreground/20 mx-auto" />
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <img src="/images/nz-alpaca.jpg" alt="New Zealand Alpaca" className="rounded-sm shadow-lg" loading="lazy" width={1200} height={800} />
            </div>
            <div>
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-body">{t.about.badge}</span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mt-4 mb-6 leading-tight">{t.about.title}</h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">{t.about.desc}</p>
              <p className="text-muted-foreground font-body leading-relaxed mb-8">{t.about.process}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { val: '25+', label: t.about.stats.years },
                  { val: '800+', label: t.about.stats.farms },
                  { val: '70%', label: t.about.stats.market },
                  { val: '100+', label: t.about.stats.capacity },
                ].map(s => (
                  <div key={s.val} className="text-center">
                    <p className="font-display text-3xl font-semibold text-gold">{s.val}</p>
                    <p className="text-xs text-muted-foreground font-body mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products — 第三屏 */}
      <section id="products" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-body">{t.products.badge}</span>
              <h2 className="font-display text-3xl md:text-4xl mt-2">{t.products.title}</h2>
            </div>
            <Link to="/shop" className="text-sm font-body text-gold hover:underline flex items-center gap-1">
              {t.products.viewAll} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map(product => (
                <div key={product.id} className="group bg-card rounded-lg overflow-hidden border border-border hover:border-gold/30 hover:shadow-lg transition-all">
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden">
                      <img src={product.image} alt={locale === 'zh' ? product.nameZh : product.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      {product.badge && (
                        <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] px-3 py-1 rounded-full font-body font-semibold tracking-wider uppercase">{product.badge}</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-display text-lg font-semibold mb-1 hover:text-gold transition-colors">{locale === 'zh' ? product.nameZh : product.nameEn}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground font-body mb-3 line-clamp-2">{locale === 'zh' ? product.descZh : product.descEn}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gold font-display text-xl font-semibold">{fp(product.prices[currency])}</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="w-9 h-9 rounded-full bg-primary text-primary-foreground hover:bg-gold flex items-center justify-center transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden border border-border animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-6 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/compare" className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-gold transition-colors border border-border px-4 py-2 rounded-sm hover:border-gold">
              {locale === 'zh' ? '不确定选哪款？查看系列对比 →' : 'Not sure? Compare all tiers →'}
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 bg-cream-dark">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-body">{locale === 'zh' ? '真实评价' : 'Customer Reviews'}</span>
            <h2 className="font-display text-3xl md:text-4xl mt-4">
              {locale === 'zh' ? '来自真实客户的声音' : 'What Our Customers Say'}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {REVIEWS.map((review, i) => (
              <div key={i} className="bg-background rounded-lg p-6 border border-border flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                  "{locale === 'zh' ? review.textZh : review.textEn}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-body font-semibold text-sm">{locale === 'zh' ? review.authorZh : review.authorEn}</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    <span className="text-gold">✓ {locale === 'zh' ? '验证购买' : 'Verified'}</span>
                    {' · '}{locale === 'zh' ? review.productZh : review.productEn}
                    {' · '}{review.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fiber / Why Alpaca */}
      <section id="fiber" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-body">{t.fiber.badge}</span>
            <h2 className="font-display text-3xl md:text-5xl mt-4 mb-4">{t.fiber.title}</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground font-body">{t.fiber.desc}</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <img src="/images/alpaca-fiber.jpg" alt="Alpaca Fiber" className="rounded-sm shadow-lg" loading="lazy" width={1024} height={1024} />
            <div className="space-y-2">
              <div className="bg-background rounded-lg p-6 text-center mb-6">
                <p className="font-display text-5xl font-bold text-gold">25%</p>
                <p className="text-muted-foreground font-body text-sm mt-2">{t.fiber.deepSleep}</p>
                <p className="text-muted-foreground/60 font-body text-xs mt-1">{t.fiber.climate}</p>
              </div>
              {[
                { icon: Thermometer, ...t.fiber.warmth },
                { icon: Feather, ...t.fiber.light },
                { icon: Droplets, ...t.fiber.moisture },
                { icon: Bug, ...t.fiber.mite },
                { icon: Zap, ...t.fiber.static },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-background rounded-lg p-4">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground font-body">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl mb-2">{t.process.title}</h2>
            <p className="text-primary-foreground/60 font-body text-sm">{t.process.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {t.process.steps.map((step: any, i: number) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display text-gold text-lg font-semibold">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="font-display font-semibold text-sm mb-2">{step.title}</h3>
                <p className="text-primary-foreground/50 font-body text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grower Network */}
      <GrowerNetworkSection />

      {/* Credentials */}
      <section id="credentials" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-body">{t.credentials.badge}</span>
            <h2 className="font-display text-3xl md:text-5xl mt-4">{t.credentials.title}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[t.credentials.fernmark, t.credentials.nzmade, t.credentials.iaa, t.credentials.hurun].map((cred: any, i: number) => (
              <div key={i} className="bg-card rounded-lg p-6 border border-border hover:border-gold/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                  <span className="text-gold font-display font-bold">{['🏅', '🇳🇿', '🦙', '🏆'][i]}</span>
                </div>
                <h3 className="font-display font-semibold mb-2">{cred.title}</h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{cred.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Subscription */}
      <section className="py-20 bg-gold/10 border-y border-gold/20">
        <div className="container mx-auto px-6 text-center max-w-xl">
          <span className="text-gold text-xs tracking-[0.3em] uppercase font-body">Newsletter</span>
          <h2 className="font-display text-3xl md:text-4xl mt-4 mb-3">
            {locale === 'zh' ? '抢先获得新品资讯' : 'First to Know, First to Get'}
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-8">
            {locale === 'zh'
              ? '加入 12,000+ 位订阅者，第一时间获取新品发布与农场故事'
              : 'Join 12,000+ subscribers for new arrivals and grower stories'}
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder={locale === 'zh' ? '您的电子邮箱' : 'Your email address'}
              className="flex-1 px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors"
              required
            />
            <button
              type="submit"
              disabled={subscribed}
              className="px-6 py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-70 whitespace-nowrap"
            >
              {subscribed
                ? (locale === 'zh' ? '✓ 已订阅' : '✓ Subscribed')
                : (locale === 'zh' ? '订阅' : 'Subscribe')}
            </button>
          </form>
          <p className="text-xs text-muted-foreground font-body mt-3">
            {locale === 'zh' ? '不发垃圾邮件，随时可退订。' : 'No spam. Unsubscribe anytime.'}
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Sleep Quiz */}
      <SleepQuizDialog open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
}
