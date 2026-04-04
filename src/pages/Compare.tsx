import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import SEOHead from '@/components/SEOHead';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const TIERS = [
  {
    id: 'duvet-classic',
    nameZh: '经典款',
    nameEn: 'Classic',
    priceZh: 'NZD$449 起',
    priceEn: 'From NZD$449',
    fabricZh: '40S 纯棉',
    fabricEn: '40S Pure Cotton',
    fillZh: '100% 羊驼毛',
    fillEn: '100% Alpaca Fiber',
    feelZh: '温暖厚实',
    feelEn: 'Warm & Substantial',
    forZh: '日常使用',
    forEn: 'Daily Use',
    certZh: '溯源证书',
    certEn: 'Trace Certificate',
    highlight: false,
  },
  {
    id: 'duvet-luxury',
    nameZh: '轻奢款',
    nameEn: 'Luxury',
    priceZh: 'NZD$649 起',
    priceEn: 'From NZD$649',
    fabricZh: '180S 匹马棉',
    fabricEn: '180S Pima Cotton',
    fillZh: '羊驼腹部毛',
    fillEn: 'Alpaca Belly Fiber',
    feelZh: '轻盈柔滑',
    feelEn: 'Light & Silky',
    forZh: '品质生活追求者',
    forEn: 'Quality Lifestyle',
    certZh: '溯源证书',
    certEn: 'Trace Certificate',
    highlight: true,
  },
  {
    id: 'duvet-premium',
    nameZh: '高奢款',
    nameEn: 'Premium',
    priceZh: 'NZD$1,099 起',
    priceEn: 'From NZD$1,099',
    fabricZh: '180S 埃及长绒棉',
    fabricEn: '180S Egyptian Cotton',
    fillZh: '3岁以下小羊驼毛',
    fillEn: 'Young Alpaca (<3yo)',
    feelZh: '极致细腻',
    feelEn: 'Ultimate Fineness',
    forZh: '极致睡眠 / 送礼首选',
    forEn: 'Ultimate Sleep / Gifting',
    certZh: '溯源证书 + 总理签名',
    certEn: 'Trace Cert + PM Signature',
    highlight: false,
  },
];

type RowKey = 'fabricZh' | 'fabricEn' | 'fillZh' | 'fillEn' | 'feelZh' | 'feelEn' | 'forZh' | 'forEn' | 'certZh' | 'certEn';

export default function ComparePage() {
  const { locale } = useApp();

  const rows: { labelZh: string; labelEn: string; keyZh: RowKey; keyEn: RowKey }[] = [
    { labelZh: '面料', labelEn: 'Fabric', keyZh: 'fabricZh', keyEn: 'fabricEn' },
    { labelZh: '填充', labelEn: 'Fill', keyZh: 'fillZh', keyEn: 'fillEn' },
    { labelZh: '触感', labelEn: 'Feel', keyZh: 'feelZh', keyEn: 'feelEn' },
    { labelZh: '适合人群', labelEn: 'Best For', keyZh: 'forZh', keyEn: 'forEn' },
    { labelZh: '证书', labelEn: 'Certificate', keyZh: 'certZh', keyEn: 'certEn' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={locale === 'zh' ? '产品系列对比 — 太平洋羊驼' : 'Compare Collections — Pacific Alpacas'}
        description={locale === 'zh' ? '经典款、轻奢款、高奢款全面对比，找到最适合你的那一款。' : 'Compare Classic, Luxury and Premium tiers to find your perfect alpaca duvet.'}
      />
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-body">
              {locale === 'zh' ? '选择适合你的系列' : 'Find Your Tier'}
            </span>
            <h1 className="font-display text-4xl md:text-5xl mt-4 mb-4">
              {locale === 'zh' ? '产品系列对比' : 'Collection Comparison'}
            </h1>
            <p className="text-muted-foreground font-body max-w-xl mx-auto text-sm">
              {locale === 'zh'
                ? '三款系列的核心差异一目了然。选择与您身份认同最契合的那款。'
                : 'See the key differences across our three tiers at a glance.'}
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto text-sm font-body border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 text-muted-foreground font-normal w-32" />
                  {TIERS.map(tier => (
                    <th key={tier.id} className={`p-4 text-center ${tier.highlight ? 'bg-gold/8 border-x border-gold/20' : ''}`}>
                      <div className={`font-display text-2xl font-semibold mb-1 ${tier.highlight ? 'text-gold' : ''}`}>
                        {locale === 'zh' ? tier.nameZh : tier.nameEn}
                      </div>
                      <div className="text-muted-foreground text-xs font-body">
                        {locale === 'zh' ? tier.priceZh : tier.priceEn}
                      </div>
                      {tier.highlight && (
                        <div className="mt-2 inline-block bg-gold/10 text-gold text-[10px] px-2 py-0.5 rounded-full font-body">
                          {locale === 'zh' ? '最受欢迎' : 'Most Popular'}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.labelEn} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      {locale === 'zh' ? row.labelZh : row.labelEn}
                    </td>
                    {TIERS.map(tier => (
                      <td key={tier.id} className={`p-4 text-center ${tier.highlight ? 'bg-gold/5 border-x border-gold/20' : ''}`}>
                        {locale === 'zh' ? tier[row.keyZh] : tier[row.keyEn]}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-border">
                  <td className="p-4" />
                  {TIERS.map(tier => (
                    <td key={tier.id} className={`p-4 text-center ${tier.highlight ? 'bg-gold/5 border-x border-gold/20 border-b border-gold/20' : ''}`}>
                      <Link
                        to={`/product/${tier.id}`}
                        className={`inline-block px-6 py-2 rounded-sm font-body text-sm font-semibold transition-colors ${
                          tier.highlight
                            ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                            : 'border border-border hover:border-gold hover:text-gold'
                        }`}
                      >
                        {locale === 'zh' ? '查看详情' : 'View Details'}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-6">
            {TIERS.map(tier => (
              <div key={tier.id} className={`bg-card rounded-lg border p-5 space-y-4 ${tier.highlight ? 'border-gold/40' : 'border-border'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className={`font-display text-2xl font-semibold ${tier.highlight ? 'text-gold' : ''}`}>
                      {locale === 'zh' ? tier.nameZh : tier.nameEn}
                    </h2>
                    <p className="text-muted-foreground text-xs font-body mt-0.5">{locale === 'zh' ? tier.priceZh : tier.priceEn}</p>
                  </div>
                  {tier.highlight && (
                    <span className="bg-gold/10 text-gold text-[10px] px-2 py-1 rounded-full font-body">
                      {locale === 'zh' ? '最受欢迎' : 'Most Popular'}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm font-body">
                  {rows.map(row => (
                    <div key={row.labelEn} className="flex justify-between">
                      <span className="text-muted-foreground">{locale === 'zh' ? row.labelZh : row.labelEn}</span>
                      <span className="font-medium">{locale === 'zh' ? tier[row.keyZh] : tier[row.keyEn]}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to={`/product/${tier.id}`}
                  className={`block w-full text-center py-2.5 rounded-sm font-body text-sm font-semibold transition-colors ${
                    tier.highlight
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'border border-border hover:border-gold hover:text-gold'
                  }`}
                >
                  {locale === 'zh' ? '查看详情' : 'View Details'}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 text-sm font-body text-muted-foreground">
            <p className="mb-2">
              {locale === 'zh'
                ? '高奢款的核心卖点是总理签名溯源证书，不仅是纤维细度——这是新西兰品质最权威的背书。'
                : 'The Premium tier\'s key differentiator is the PM-signed traceability certificate — the most authoritative NZ quality endorsement.'}
            </p>
            <Link to="/shop" className="text-gold hover:underline">
              {locale === 'zh' ? '查看全部产品 →' : 'Browse All Products →'}
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
