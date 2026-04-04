import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, MapPin, Facebook, Youtube, Instagram } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const { locale } = useApp();
  const [form, setForm] = useState({ name: '', email: '', enquiryType: 'Product Question', message: '' });
  const [loading, setLoading] = useState(false);

  const enquiryTypes = [
    { value: 'Product Question', label: locale === 'zh' ? '产品咨询' : 'Product Question' },
    { value: 'Wholesale Enquiry', label: locale === 'zh' ? '批发咨询' : 'Wholesale Enquiry' },
    { value: 'Grower Registration', label: locale === 'zh' ? '牧场主注册' : 'Grower Registration' },
    { value: 'Other', label: locale === 'zh' ? '其他' : 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setTimeout(() => {
      toast.success(locale === 'zh' ? '消息已发送！我们会尽快回复。' : 'Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', enquiryType: 'Product Question', message: '' });
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
              {locale === 'zh' ? '联系我们' : 'Get In Touch'}
            </h1>
            <p className="font-body text-primary-foreground/70 max-w-xl mx-auto">
              {locale === 'zh'
                ? '我们期待您的来信——无论您是客户、批发买家还是牧场主。'
                : "We'd love to hear from you — customers, wholesale buyers, and growers welcome."}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="flex-1 py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-card rounded-lg border border-border p-8 space-y-6">
                <h2 className="font-display text-2xl mb-4">
                  {locale === 'zh' ? '联系方式' : 'Contact Details'}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-body text-sm font-semibold">+64 21 950 204</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-body text-sm">info@pacificalpacas.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-body text-sm font-semibold">{locale === 'zh' ? '微信' : 'WeChat'}: pacificalpacas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-body text-sm">1 Pigeon Rock Road, RD2, Cromwell,<br />Central Otago 9382, New Zealand</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">P.O. Box 28684, Remuera, Auckland 1541, New Zealand</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex gap-4">
                    <a href="https://www.facebook.com/pacificalpacas/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="https://www.youtube.com/channel/UCfI8KvHECEQmRvcTuFSq-SA" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold transition-colors">
                      <Youtube className="w-5 h-5" />
                    </a>
                    <a href="https://www.instagram.com/pacific_alpacas/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-8 space-y-5">
                <h2 className="font-display text-2xl mb-2">
                  {locale === 'zh' ? '发送询问' : 'Send Enquiry'}
                </h2>
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '姓名 *' : 'Name *'}</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '邮箱 *' : 'Email *'}</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '咨询类型' : 'Enquiry Type'}</label>
                  <select value={form.enquiryType} onChange={e => setForm(f => ({ ...f, enquiryType: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors cursor-pointer">
                    {enquiryTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '消息 *' : 'Message *'}</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors resize-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm tracking-wider hover:bg-accent/90 transition disabled:opacity-50">
                  {loading ? '...' : (locale === 'zh' ? '发送' : 'Send Message')}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
