import { useApp } from '@/contexts/AppContext';

const TRUST_ITEMS = [
  { emoji: '🐑', zh: '800+ 新西兰牧场', en: '800+ NZ Farms' },
  { emoji: '🏅', zh: 'Silver Fern 认证', en: 'Silver Fern Certified' },
  { emoji: '✈️', zh: 'NZ$500+ 免运费', en: 'Free Shipping over NZ$500' },
  { emoji: '↩️', zh: '30天退换', en: '30-Day Returns' },
  { emoji: '🔒', zh: '安全支付', en: 'Secure Payment' },
];

export default function TrustBar() {
  const { locale } = useApp();
  return (
    <section className="py-6 bg-muted/50 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {TRUST_ITEMS.map((item) => (
            <div key={item.en} className="flex items-center gap-2 text-sm font-body text-muted-foreground">
              <span className="text-lg">{item.emoji}</span>
              <span>{locale === 'zh' ? item.zh : item.en}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
