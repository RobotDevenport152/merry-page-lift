import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, MessageCircle, X } from 'lucide-react';

export default function Footer() {
  const { locale, t } = useApp();
  const [wechatOpen, setWechatOpen] = useState(false);

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <h3 className="font-display text-xl tracking-[0.3em] mb-3">PACIFIC ALPACAS</h3>
            <p className="text-primary-foreground/40 font-display italic text-sm">{t.footer.tagline}</p>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-wider uppercase text-primary-foreground/60 mb-4">{t.footer.company}</h4>
            <div className="space-y-2">
              <Link to="/#about" className="block text-sm font-body text-primary-foreground/50 hover:text-primary-foreground transition-colors">{t.nav.about}</Link>
              <Link to="/#fiber" className="block text-sm font-body text-primary-foreground/50 hover:text-primary-foreground transition-colors">{t.nav.whyAlpaca}</Link>
              <Link to="/#credentials" className="block text-sm font-body text-primary-foreground/50 hover:text-primary-foreground transition-colors">{t.nav.credentials}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-wider uppercase text-primary-foreground/60 mb-4">{locale === 'zh' ? '产品与服务' : 'Products'}</h4>
            <div className="space-y-2">
              <Link to="/shop" className="block text-sm font-body text-primary-foreground/50 hover:text-primary-foreground transition-colors">{t.nav.products}</Link>
              <Link to="/compare" className="block text-sm font-body text-primary-foreground/50 hover:text-primary-foreground transition-colors">{locale === 'zh' ? '系列对比' : 'Compare Tiers'}</Link>
              <Link to="/traceability" className="block text-sm font-body text-primary-foreground/50 hover:text-primary-foreground transition-colors">{locale === 'zh' ? '溯源查询' : 'Traceability'}</Link>
              <Link to="/returns" className="block text-sm font-body text-primary-foreground/50 hover:text-primary-foreground transition-colors">{locale === 'zh' ? '退换货政策' : 'Return Policy'}</Link>
              <Link to="/growers-info" className="block text-sm font-body text-primary-foreground/50 hover:text-primary-foreground transition-colors">{locale === 'zh' ? '牧场合作' : 'Growers'}</Link>
              <Link to="/wholesale" className="block text-sm font-body text-primary-foreground/50 hover:text-primary-foreground transition-colors">{locale === 'zh' ? '批发询价' : 'Wholesale'}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-wider uppercase text-primary-foreground/60 mb-4">{t.footer.support}</h4>
            <div className="space-y-2">
              <p className="text-sm font-body text-primary-foreground/50">info@pacificalpacas.com</p>
              <p className="text-sm font-body text-primary-foreground/50">+64 21 950 204</p>
              <button
                onClick={() => setWechatOpen(true)}
                className="text-sm font-body text-primary-foreground/50 hover:text-gold transition-colors text-left flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {locale === 'zh' ? '微信客服（扫码添加）' : 'WeChat Support (scan QR)'}
              </button>
              <p className="text-sm font-body text-primary-foreground/50">
                1 Pigeon Rock Road, RD2, Cromwell,<br />Central Otago 9382, New Zealand
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/30 text-xs font-body">{t.footer.rights}</p>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/pacificalpacas/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/40 hover:text-gold transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://www.youtube.com/channel/UCfI8KvHECEQmRvcTuFSq-SA" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/40 hover:text-gold transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/pacific_alpacas/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/40 hover:text-gold transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://wa.me/6421950204" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/40 hover:text-gold transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
      {wechatOpen && (
        <>
          <div className="fixed inset-0 bg-foreground/60 z-50" onClick={() => setWechatOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-lg shadow-2xl p-8 w-72 text-center">
            <button onClick={() => setWechatOpen(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
            <p className="font-display text-xl mb-1">{locale === 'zh' ? '扫码添加客服' : 'Scan to Add on WeChat'}</p>
            <p className="text-xs font-body text-muted-foreground mb-4">pacificalpacas</p>
            <div className="w-40 h-40 mx-auto bg-muted rounded-sm flex items-center justify-center mb-4 border border-border overflow-hidden">
              <img
                src="/images/wechat-qr.png"
                alt="WeChat QR"
                className="w-full h-full object-cover"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full flex-col items-center justify-center text-muted-foreground">
                <MessageCircle className="w-10 h-10 mb-2 text-green-500" />
                <p className="text-xs font-body">pacificalpacas</p>
              </div>
            </div>
            <p className="text-xs font-body text-muted-foreground">
              {locale === 'zh' ? '响应时间：工作日 2 小时内' : 'Response time: within 2 hours on business days'}
            </p>
          </div>
        </>
      )}
    </footer>
  );
}
