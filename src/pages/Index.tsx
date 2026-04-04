import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CartDrawer from '@/components/CartDrawer';
import SEOHead from '@/components/SEOHead';
import { useApp } from '@/contexts/AppContext';

export default function Index() {
  const { locale } = useApp();
  return (
    <div className="min-h-screen">
      <SEOHead
        title={locale === 'zh' ? '新西兰最大羊驼纤维品牌' : 'New Zealand Premium Alpaca Fiber Brand'}
        description={locale === 'zh' ? '太平洋羊驼 — 自2001年起，专注奢华羊驼纤维寝具，800+合作牧场，全球深睡新标准。' : 'Pacific Alpacas — Since 2001, luxury alpaca fiber bedding from 800+ partner farms. The new standard of deep sleep.'}
      />
      <Navbar />
      <CartDrawer />
      <HeroSection />
    </div>
  );
}
