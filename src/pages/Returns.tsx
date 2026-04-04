import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import SEOHead from '@/components/SEOHead';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Mail, RefreshCw } from 'lucide-react';

export default function ReturnsPage() {
  const { locale } = useApp();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={locale === 'zh' ? '退换货政策 — 太平洋羊驼' : 'Return Policy — Pacific Alpacas'}
        description={locale === 'zh' ? '30天无忧退换，品质问题免费处理。' : '30-day hassle-free returns. Quality issues handled at no cost.'}
      />
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-body">
              {locale === 'zh' ? '售后保障' : 'After-Sale Support'}
            </span>
            <h1 className="font-display text-4xl md:text-5xl mt-4 mb-4">
              {locale === 'zh' ? '退换货政策' : 'Return & Exchange Policy'}
            </h1>
            <p className="text-muted-foreground font-body">
              {locale === 'zh'
                ? '我们相信您会爱上每一床太平洋羊驼被。如果您不满意，我们承诺让您无后顾之忧。'
                : 'We believe you\'ll love your Pacific Alpacas duvet. If not, we\'re here to make it right.'}
            </p>
          </div>

          {/* Highlight */}
          <div className="bg-gold/5 border border-gold/20 rounded-lg p-6 mb-10 text-center">
            <p className="font-display text-3xl font-semibold text-gold mb-1">
              {locale === 'zh' ? '30天无忧退换' : '30-Day Hassle-Free Returns'}
            </p>
            <p className="text-muted-foreground font-body text-sm">
              {locale === 'zh'
                ? '收货后30天内，不满意即可退换，无需过多解释。'
                : 'Not satisfied within 30 days of receiving your order? We\'ll make it right.'}
            </p>
          </div>

          <div className="space-y-8 font-body">
            {/* Conditions */}
            <section>
              <h2 className="font-display text-xl mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-gold" />
                {locale === 'zh' ? '退换条件' : 'Eligibility'}
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(locale === 'zh' ? [
                  '产品未使用，保持原始包装状态',
                  '附上原始订单号',
                  '在收货后30天内提交申请',
                  '运费由买家承担（新西兰境内 NZD$15，国际运费自理）',
                ] : [
                  'Product unused, in original packaging',
                  'Original order number required',
                  'Request submitted within 30 days of receipt',
                  'Return shipping paid by buyer (NZ domestic NZD$15; international at cost)',
                ]).map((item, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-gold mt-0.5">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Process */}
            <section>
              <h2 className="font-display text-xl mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-gold" />
                {locale === 'zh' ? '退换流程' : 'How It Works'}
              </h2>
              <div className="space-y-4">
                {(locale === 'zh' ? [
                  { step: '1', title: '发起申请', desc: '发邮件至 returns@pacificalpacas.com，说明订单号和退换原因，获取退货授权码（RMA）。' },
                  { step: '2', title: '寄回产品', desc: '将产品寄回仓库地址：1 Pigeon Rock Road, RD2, Cromwell, Central Otago 9382, New Zealand。请注明 RMA 编号。' },
                  { step: '3', title: '验收退款', desc: '我们收到并验收产品后，5个工作日内原路退款至您的支付账户。' },
                ] : [
                  { step: '1', title: 'Submit Request', desc: 'Email returns@pacificalpacas.com with your order number and reason to receive a Return Merchandise Authorization (RMA) code.' },
                  { step: '2', title: 'Ship Back', desc: 'Send the product to: 1 Pigeon Rock Road, RD2, Cromwell, Central Otago 9382, New Zealand. Include your RMA code.' },
                  { step: '3', title: 'Refund Processed', desc: 'Once received and inspected, your refund will be issued within 5 business days to your original payment method.' },
                ]).map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 text-gold font-display font-semibold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-0.5">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quality issues */}
            <section className="bg-card border border-border rounded-lg p-5">
              <h2 className="font-display text-xl mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-gold" />
                {locale === 'zh' ? '品质问题特别说明' : 'Quality Issues'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {locale === 'zh'
                  ? '如产品存在质量问题（如填充不均、面料缺陷、缝制问题），运费由我们全额承担，并优先安排补发新品，无需等待退款流程。请拍照发送至 quality@pacificalpacas.com，我们将在1个工作日内回复。'
                  : 'For quality defects (uneven fill, fabric faults, stitching issues), we cover all return shipping and prioritize sending a replacement. Email photos to quality@pacificalpacas.com — we\'ll respond within 1 business day.'}
              </p>
            </section>

            {/* Contact */}
            <section className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                {locale === 'zh' ? '有疑问？随时联系我们' : 'Questions? We\'re here to help'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:returns@pacificalpacas.com"
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-border rounded-sm font-body text-sm hover:border-gold hover:text-gold transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  returns@pacificalpacas.com
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-sm font-body text-sm hover:bg-accent/90 transition-colors"
                >
                  {locale === 'zh' ? '联系客服' : 'Contact Support'}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
