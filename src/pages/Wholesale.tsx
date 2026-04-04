import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Scissors, Droplets, Package } from 'lucide-react';
import { toast } from 'sonner';

const OFFERINGS = [
  { icon: Scissors, titleEn: 'Raw Fibre', titleZh: '原始纤维', descEn: 'Unsorted alpaca fleece direct from our collection pool', descZh: '来自我们收集池的未分类羊驼毛' },
  { icon: Droplets, titleEn: 'Scoured Fibre', titleZh: '清洗纤维', descEn: 'Cleaned and degreased, ready for processing', descZh: '已清洁脱脂，可直接加工' },
  { icon: Package, titleEn: 'Bulk Finished Product', titleZh: '批量成品', descEn: 'Duvets and blankets at below-retail wholesale pricing', descZh: '低于零售价的批发被子和毛毯' },
];

export default function WholesalePage() {
  const { locale } = useApp();
  const [form, setForm] = useState({ companyName: '', contactName: '', email: '', country: '', productInterest: 'Raw Fibre', volume: '', message: '' });
  const [loading, setLoading] = useState(false);

  const productOptions = [
    { value: 'Raw Fibre', label: locale === 'zh' ? '原始纤维' : 'Raw Fibre' },
    { value: 'Scoured Fibre', label: locale === 'zh' ? '清洗纤维' : 'Scoured Fibre' },
    { value: 'Processed Fibre', label: locale === 'zh' ? '加工纤维' : 'Processed Fibre' },
    { value: 'Finished Duvets/Blankets', label: locale === 'zh' ? '成品被子/毛毯' : 'Finished Duvets/Blankets' },
    { value: 'Mixed Order', label: locale === 'zh' ? '混合订单' : 'Mixed Order' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.contactName || !form.email) return;
    setLoading(true);
    setTimeout(() => {
      toast.success(locale === 'zh' ? '批发询价已提交！我们会尽快联系您。' : 'Wholesale enquiry submitted! We\'ll contact you soon.');
      setForm({ companyName: '', contactName: '', email: '', country: '', productInterest: 'Raw Fibre', volume: '', message: '' });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <CartDrawer />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl mb-4">
              {locale === 'zh' ? '批发与采购' : 'Wholesale & Bulk Orders'}
            </h1>
            <p className="font-body text-primary-foreground/70 max-w-2xl mx-auto">
              {locale === 'zh'
                ? '太平洋羊驼向国内外买家供应原料、清洗后和加工后的羊驼纤维。我们还为经销商提供批量成品。'
                : "Pacific Alpacas supplies raw, scoured, and processed alpaca fibre to domestic and international buyers. We also offer bulk finished product for resellers."}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="flex-1 py-16">
        <div className="container mx-auto px-6">
          {/* Offerings */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {OFFERINGS.map((item, i) => (
              <motion.div key={item.titleEn} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-lg border border-border p-6 text-center hover:border-gold/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{locale === 'zh' ? item.titleZh : item.titleEn}</h3>
                <p className="text-xs text-muted-foreground font-body">{locale === 'zh' ? item.descZh : item.descEn}</p>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto bg-card rounded-lg border border-border p-8 space-y-5">
            <h2 className="font-display text-2xl mb-2">
              {locale === 'zh' ? '批发询价' : 'Wholesale Enquiry'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '公司名称 *' : 'Company Name *'}</label>
                <input type="text" required value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                  className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '联系人 *' : 'Contact Name *'}</label>
                <input type="text" required value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                  className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '邮箱 *' : 'Email *'}</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '国家' : 'Country'}</label>
                <input type="text" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '产品兴趣' : 'Product Interest'}</label>
                <select value={form.productInterest} onChange={e => setForm(f => ({ ...f, productInterest: e.target.value }))}
                  className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors cursor-pointer">
                  {productOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '预估年采购量' : 'Est. Annual Volume'}</label>
                <input type="text" value={form.volume} onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
                  placeholder={locale === 'zh' ? '公斤或件数' : 'kg or units'}
                  className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '留言' : 'Message'}</label>
              <textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm tracking-wider hover:bg-accent/90 transition disabled:opacity-50">
              {loading ? '...' : (locale === 'zh' ? '提交批发询价' : 'Submit Wholesale Enquiry')}
            </button>
          </motion.form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
