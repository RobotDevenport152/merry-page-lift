import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useProduct, useProducts } from '@/hooks/useProducts';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { ShieldCheck, Feather, Droplets, Bug, Zap, ChevronLeft, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const BENEFITS = [
  { icon: ShieldCheck, labelZh: '保暖', labelEn: 'Warmth', descZh: '3倍于羊毛', descEn: '3× warmer than wool' },
  { icon: Feather, labelZh: '轻盈', labelEn: 'Light', descZh: '仅羊毛被30%重量', descEn: '30% weight of wool' },
  { icon: Droplets, labelZh: '排潮', labelEn: 'Moisture', descZh: '吸收35%水蒸气', descEn: '35% vapor absorption' },
  { icon: Bug, labelZh: '抑螨', labelEn: 'Anti-mite', descZh: '64.37%趋避率', descEn: '64.37% avoidance' },
  { icon: Zap, labelZh: '阻电', labelEn: 'Anti-static', descZh: '天然抗静电', descEn: 'Natural anti-static' },
];

const COMPARISON = [
  { key: '保暖性', keyEn: 'Warmth', alpaca: '★★★★★', wool: '★★★☆☆', silk: '★★☆☆☆' },
  { key: '轻盈度', keyEn: 'Lightness', alpaca: '★★★★★', wool: '★★☆☆☆', silk: '★★★★☆' },
  { key: '排湿性', keyEn: 'Moisture', alpaca: '★★★★★', wool: '★★★☆☆', silk: '★★★☆☆' },
  { key: '抗螨性', keyEn: 'Anti-mite', alpaca: '★★★★★', wool: '★★☆☆☆', silk: '★★★☆☆' },
  { key: '耐用性', keyEn: 'Durability', alpaca: '★★★★★', wool: '★★★★☆', silk: '★★☆☆☆' },
  { key: '抗静电', keyEn: 'Anti-static', alpaca: '★★★★★', wool: '★☆☆☆☆', silk: '★★★☆☆' },
];

const MOCK_REVIEWS = [
  { id: '1', author: '张女士 / Ms. Zhang', rating: 5, date: '2025-03-10', textZh: '非常轻盈，比想象中更柔软。温控效果很好，不像羽绒被那样感觉闷热。强烈推荐！', textEn: 'Incredibly light and softer than expected. Temperature regulation is excellent — no stuffy feeling like down. Highly recommend!', verified: true, productVariant: '220×240cm' },
  { id: '2', author: '王先生 / Mr. Wang', rating: 5, date: '2025-02-28', textZh: '作为礼物送给父母，他们用了一周就说"终于睡好了"。包装精美，有溯源证书，仪式感很强。', textEn: 'Bought as a gift for my parents. One week in and they said "finally sleeping well." Beautiful packaging with the traceability certificate.', verified: true, productVariant: '200×230cm' },
  { id: '3', author: '李女士 / Ms. Li', rating: 4, date: '2025-01-15', textZh: '质量很好，填充均匀，面料很细腻。唯一美中不足是颜色比图片略偏米白。', textEn: 'Great quality, even fill, fine fabric. Only minor note: the color is slightly more off-white than in the photos.', verified: true, productVariant: '200×230cm' },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { locale, fp, currency, addToCart, t, recentlyViewed, addRecentlyViewed } = useApp();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'care' | 'reviews'>('description');
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts } = useProducts();

  useEffect(() => {
    if (product) {
      addRecentlyViewed(id || '');
    }
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="font-display text-3xl mb-4">{locale === 'zh' ? '产品未找到' : 'Product Not Found'}</h1>
          <Link to="/shop" className="text-gold hover:underline font-body">
            {locale === 'zh' ? '返回产品列表' : 'Back to Shop'}
          </Link>
        </div>
      </div>
    );
  }

  const careTipsZh = [
    '手洗或洗衣机轻柔模式，30°C 以下冷水',
    '使用羊毛专用洗涤剂，避免含酶洗涤剂',
    '平铺晾干，避免直接暴晒',
    '储存时置于透气袋中，放置樟脑球可防蛀',
    '切勿干洗（化学溶剂会破坏羊驼纤维蛋白质结构）',
  ];
  const careTipsEn = [
    'Hand wash or gentle machine cycle, cold water ≤30°C',
    'Use wool-specific detergent, avoid enzyme-based products',
    'Lay flat to dry, avoid direct sunlight',
    'Store in breathable bag with cedar balls to prevent moths',
    'Do not dry clean — solvents damage alpaca fiber proteins',
  ];

  const sameCategoryProducts = allProducts
    ? allProducts.filter(p => p.category === product.category && p.id !== product.id)
    : [];
  const featuredFill = allProducts
    ? allProducts.filter(p => p.featured && p.id !== product.id && !sameCategoryProducts.find(s => s.id === p.id))
    : [];
  const alsoBought = [...sameCategoryProducts, ...featuredFill].slice(0, 3);

  const recentIds = recentlyViewed.filter(rid => rid !== id);
  const recentProducts = allProducts
    ? recentIds.map(rid => allProducts.find(p => p.id === rid)).filter(Boolean).slice(0, 4)
    : [];

  const tabs = [
    { key: 'description' as const, zh: '描述', en: 'Description' },
    { key: 'specs' as const, zh: '规格', en: 'Specifications' },
    { key: 'care' as const, zh: '护理', en: 'Care' },
    { key: 'reviews' as const, zh: '评论', en: 'Reviews' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-6">
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-body mb-8">
            <ChevronLeft className="w-4 h-4" />
            {locale === 'zh' ? '返回产品列表' : 'Back to Shop'}
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-card">
                <img src={product.image} alt={locale === 'zh' ? product.nameZh : product.nameEn} className="w-full h-full object-cover" />
                <Link
                  to="/traceability"
                  className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-primary/80 backdrop-blur-sm text-primary-foreground text-xs font-body px-3 py-1.5 rounded-full hover:bg-primary transition-colors"
                >
                  <MapPin className="w-3 h-3 text-gold" />
                  {locale === 'zh' ? '可溯源至新西兰牧场' : 'Traceable NZ Farm'}
                  <span className="text-gold ml-0.5">→</span>
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-body mb-2">{product.category}</span>
              <h1 className="font-display text-3xl md:text-4xl font-semibold mb-1">
                {locale === 'zh' ? product.nameZh : product.nameEn}
              </h1>
              <p className="text-muted-foreground font-body text-sm mb-2">
                {locale === 'zh' ? product.nameEn : product.nameZh}
              </p>
              <p className="text-gold font-display text-3xl font-semibold mb-4">{fp(product.prices[currency])}</p>
              <p className="text-muted-foreground font-body leading-relaxed mb-6">
                {locale === 'zh' ? product.descZh : product.descEn}
              </p>

              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-xs font-body text-muted-foreground">{locale === 'zh' ? '选择尺寸' : 'Select Size'}</p>
                    <button
                      onClick={() => setSizeGuideOpen(v => !v)}
                      className="text-xs font-body text-gold hover:underline flex items-center gap-0.5"
                    >
                      {locale === 'zh' ? '尺寸参考' : 'Size Guide'}
                      {sizeGuideOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                  {sizeGuideOpen && (
                    <div className="mb-3 bg-muted rounded-sm p-3 text-xs font-body space-y-1.5 border border-border">
                      <p className="font-semibold text-foreground mb-2">{locale === 'zh' ? '中国床尺寸对照' : 'Bed Size Reference'}</p>
                      {[
                        { bed: locale === 'zh' ? '标准双人床（1.5m）' : 'Double (1.5m)', rec: '200×230cm' },
                        { bed: locale === 'zh' ? '大双人床（1.8m）' : 'Queen/King (1.8m)', rec: '220×240cm' },
                        { bed: locale === 'zh' ? '儿童床（0.9–1.2m）' : 'Single/Child', rec: '150×180cm' },
                      ].map(r => (
                        <div key={r.bed} className="flex justify-between items-center">
                          <span className="text-muted-foreground">{r.bed}</span>
                          <span className="font-semibold text-foreground">{locale === 'zh' ? '推荐' : 'Rec.'} {r.rec}</span>
                        </div>
                      ))}
                      <p className="text-muted-foreground/70 pt-1 border-t border-border">
                        {locale === 'zh' ? '建议比床宽各多出 30cm 以上，以获得最佳包裹感。' : 'Choose 30cm+ wider than your bed for best coverage.'}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {product.variants.map(v => (
                      <button
                        key={v.value}
                        onClick={() => setSelectedVariant(v.value)}
                        className={`px-4 py-2 rounded-sm border text-sm font-body transition-colors ${
                          selectedVariant === v.value
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border text-foreground hover:border-gold'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground font-body mb-2">
                {locale === 'zh' ? `库存: ${product.stock} 件` : `Stock: ${product.stock} units`}
              </p>

              {/* Care Instructions */}
              <div className="mb-4 border border-border rounded-sm overflow-hidden">
                <button
                  onClick={() => setCareOpen(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-body font-semibold hover:bg-muted transition-colors"
                >
                  <span>{locale === 'zh' ? '🧺 护理说明' : '🧺 Care Instructions'}</span>
                  {careOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {careOpen && (
                  <div className="px-4 pb-4 space-y-1.5 text-xs font-body text-muted-foreground border-t border-border pt-3">
                    {(locale === 'zh' ? careTipsZh : careTipsEn).map((tip, i) => (
                      <p key={i} className="flex gap-2"><span className="text-gold flex-shrink-0">·</span>{tip}</p>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => { addToCart(product, selectedVariant || undefined); }}
                disabled={product.stock <= 0}
                className="w-full py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm tracking-wider hover:bg-accent/90 transition disabled:opacity-50"
              >
                {product.stock <= 0 ? (locale === 'zh' ? '已售罄' : 'Sold Out') : t.products.addToCart}
              </button>

              <div className="mt-4">
                <Link
                  to="/traceability"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gold/40 text-gold-dark rounded-sm text-sm font-body hover:bg-gold/10 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {locale === 'zh' ? '验证产品真实性' : 'Verify Product Authenticity'}
                </Link>
              </div>

              <div className="grid grid-cols-5 gap-3 mt-8">
                {BENEFITS.map((b) => (
                  <div key={b.labelEn} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-1">
                      <b.icon className="w-5 h-5 text-gold" />
                    </div>
                    <p className="text-xs font-body font-semibold">{locale === 'zh' ? b.labelZh : b.labelEn}</p>
                    <p className="text-[10px] text-muted-foreground font-body">{locale === 'zh' ? b.descZh : b.descEn}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-16">
            <div className="flex gap-0 border-b border-border mb-8">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-sm font-body transition-colors ${
                    activeTab === tab.key
                      ? 'border-b-2 border-gold text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {locale === 'zh' ? tab.zh : tab.en}
                  {locale === 'zh' && <span className="text-muted-foreground font-normal ml-1 text-xs">/ {tab.en}</span>}
                  {locale !== 'zh' && <span className="text-muted-foreground font-normal ml-1 text-xs">/ {tab.zh}</span>}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <div>
                <div className="max-w-3xl mx-auto mb-10">
                  <h2 className="font-display text-2xl mb-4">{locale === 'zh' ? '产品故事' : 'Product Story'}</h2>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {locale === 'zh' ? product.descZh : product.descEn}
                  </p>
                </div>

                <div className="mb-10">
                  <h3 className="font-display text-xl text-center mb-6">{locale === 'zh' ? '五大优势' : 'Five Key Benefits'}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-3xl mx-auto">
                    {BENEFITS.map((b) => (
                      <div key={b.labelEn} className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-2">
                          <b.icon className="w-6 h-6 text-gold" />
                        </div>
                        <p className="text-sm font-body font-semibold">{locale === 'zh' ? b.labelZh : b.labelEn}</p>
                        <p className="text-xs text-muted-foreground font-body">{locale === 'zh' ? b.descZh : b.descEn}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xl text-center mb-6">{locale === 'zh' ? '被窝指标对比' : 'Duvet Comparison'}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full max-w-2xl mx-auto text-sm font-body">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3">{locale === 'zh' ? '指标' : 'Metric'}</th>
                          <th className="text-center p-3">{locale === 'zh' ? '羊驼被' : 'Alpaca'}</th>
                          <th className="text-center p-3">{locale === 'zh' ? '羊毛被' : 'Wool'}</th>
                          <th className="text-center p-3">{locale === 'zh' ? '蚕丝被' : 'Silk'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPARISON.map((row) => (
                          <tr key={row.key} className="border-b border-border">
                            <td className="p-3 font-semibold">{locale === 'zh' ? row.key : row.keyEn}</td>
                            <td className="p-3 text-center text-gold">{row.alpaca}</td>
                            <td className="p-3 text-center">{row.wool}</td>
                            <td className="p-3 text-center">{row.silk}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <div className="max-w-2xl mx-auto mb-10">
                  <h2 className="font-display text-2xl mb-6">{locale === 'zh' ? '产品规格' : 'Product Specifications'}</h2>
                  <table className="w-full text-sm font-body">
                    <tbody>
                      {[
                        { labelZh: '重量', labelEn: 'Weight', value: product.weight || '—' },
                        { labelZh: '充绒量', labelEn: 'Fill Power', value: product.fillPower || '—' },
                        { labelZh: '填充物', labelEn: 'Material', value: '100% Alpaca Fiber' },
                        { labelZh: '面料', labelEn: 'Cover', value: locale === 'zh' ? '纯棉' : 'Pure Cotton' },
                        { labelZh: '认证', labelEn: 'Certifications', value: product.certifications?.join(', ') || '—' },
                      ].map(row => (
                        <tr key={row.labelEn} className="border-b border-border">
                          <td className="py-3 pr-6 font-semibold text-muted-foreground w-40">{locale === 'zh' ? row.labelZh : row.labelEn}</td>
                          <td className="py-3">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-primary text-primary-foreground rounded-lg overflow-hidden max-w-3xl mx-auto">
                  <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
                  <div className="p-8 md:p-12 text-center">
                    <h2 className="font-display text-2xl md:text-3xl mb-6">
                      {locale === 'zh' ? '云之梦图案' : 'Cloud of Dreams'}
                    </h2>
                    <p className="font-body text-primary-foreground/80 leading-relaxed text-sm md:text-base">
                      {locale === 'zh'
                        ? '每一床太平洋羊驼被上都绣有我们的注册商标"云之梦"图案。该图案由新西兰丰盛湾阿拉旺部落的毛利艺术家 Patricia Erueti 专为 Pacific Alpacas 设计。购买一床太平洋羊驼被，不仅是拥有顶级品质寝具，更是将一件新西兰文化遗产带回家中。'
                        : "Each of our duvets features our trademarked 'Cloud of Dreams' pattern, designed exclusively for Pacific Alpacas by Māori artist Patricia Erueti of the Arawan tribe from New Zealand's Bay of Plenty. Every purchase carries a piece of New Zealand heritage."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="font-display text-2xl mb-6">{locale === 'zh' ? '护理说明' : 'Care Instructions'}</h2>
                <ul className="space-y-3">
                  {(locale === 'zh' ? careTipsZh : careTipsEn).map((tip, i) => (
                    <li key={i} className="flex gap-3 font-body text-sm text-muted-foreground">
                      <span className="text-gold flex-shrink-0 mt-0.5">·</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                  <div className="text-4xl font-display font-semibold mb-1">4.8</div>
                  <div className="text-gold text-xl mb-1">★★★★★</div>
                  <div className="text-sm text-muted-foreground font-body">127条评价 / 127 reviews</div>
                </div>

                <div className="space-y-2 mb-8 max-w-xs mx-auto">
                  {[
                    { stars: 5, label: '5★', pct: 78 },
                    { stars: 4, label: '4★', pct: 16 },
                    { stars: 3, label: '3★', pct: 5 },
                    { stars: 2, label: '2★', pct: 1 },
                    { stars: 1, label: '1★', pct: 0 },
                  ].map(row => (
                    <div key={row.stars} className="flex items-center gap-3 text-sm font-body">
                      <span className="w-6 text-muted-foreground">{row.label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{row.pct}%</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6">
                  {MOCK_REVIEWS.map(review => (
                    <div key={review.id} className="border border-border rounded-sm p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-body font-semibold text-sm">{review.author}</span>
                          {review.verified && (
                            <span className="ml-2 text-xs text-green-600 font-body">✓ 已验证购买 / Verified Purchase</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-body">{review.date}</span>
                      </div>
                      <div className="text-gold text-sm mb-1">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                      <div className="text-xs text-muted-foreground font-body mb-2">{locale === 'zh' ? '购买规格' : 'Variant'}: {review.productVariant}</div>
                      <p className="text-sm font-body text-muted-foreground">
                        {locale === 'zh' ? review.textZh : review.textEn}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <span className="text-sm font-body text-gold cursor-default">查看全部评价 →</span>
                </div>
              </div>
            )}
          </div>

          {/* Customers Also Bought */}
          {alsoBought.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl mb-6">
                {locale === 'zh' ? '购买此商品的顾客还购买了' : 'Customers Also Bought'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {alsoBought.map(p => (
                  <Link key={p.id} to={`/product/${p.id}`} className="group block">
                    <div className="aspect-square rounded-lg overflow-hidden bg-card mb-3">
                      <img src={p.image} alt={locale === 'zh' ? p.nameZh : p.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <p className="font-body font-semibold text-sm mb-1">{locale === 'zh' ? p.nameZh : p.nameEn}</p>
                    <p className="text-gold font-display text-sm">{fp(p.prices[currency])}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          {recentProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl mb-6">
                {locale === 'zh' ? '最近查看' : 'Recently Viewed'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recentProducts.map(p => (
                  <Link key={p!.id} to={`/product/${p!.id}`} className="group block">
                    <div className="aspect-square rounded-lg overflow-hidden bg-card mb-3">
                      <img src={p!.image} alt={locale === 'zh' ? p!.nameZh : p!.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <p className="font-body font-semibold text-sm mb-1">{locale === 'zh' ? p!.nameZh : p!.nameEn}</p>
                    <p className="text-gold font-display text-sm">{fp(p!.prices[currency])}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 pt-4 safe-bottom flex items-center gap-4 z-40">
        <span className="text-gold font-display text-xl font-semibold">{fp(product.prices[currency])}</span>
        <button
          onClick={() => addToCart(product, selectedVariant || undefined)}
          className="flex-1 py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm"
        >
          {t.products.addToCart}
        </button>
      </div>

      <Footer />
    </div>
  );
}
