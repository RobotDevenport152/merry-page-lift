import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { dbToLegacyProduct, type DbProduct } from '@/hooks/useProducts';
import { ShoppingBag } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  {
    questionZh: '您主要的睡眠困扰是什么？',
    questionEn: 'What is your main sleep concern?',
    options: [
      { zh: '怕冷/保暖不足', en: 'Too cold / Insufficient warmth', value: 'cold' },
      { zh: '浅睡易醒', en: 'Light sleeper / Wake easily', value: 'light' },
      { zh: '出汗/闷热', en: 'Sweating / Too hot', value: 'hot' },
      { zh: '过敏/螨虫', en: 'Allergies / Dust mites', value: 'allergy' },
      { zh: '初生婴儿使用', en: 'For newborn baby', value: 'newborn' },
    ],
  },
  {
    questionZh: '您的体型？',
    questionEn: 'Your body type?',
    options: [
      { zh: '偏瘦', en: 'Slim', value: 'slim' },
      { zh: '中等', en: 'Medium', value: 'medium' },
      { zh: '偏胖', en: 'Large', value: 'large' },
    ],
  },
  {
    questionZh: '您的预算范围？',
    questionEn: 'Your budget range?',
    options: [
      { zh: '¥1,000-2,000', en: 'NZ$249-449', value: 'budget' },
      { zh: '¥2,000-4,000', en: 'NZ$449-899', value: 'mid' },
      { zh: '¥4,000以上', en: 'NZ$899+', value: 'premium' },
    ],
  },
  {
    questionZh: '主要使用季节？',
    questionEn: 'Primary season of use?',
    options: [
      { zh: '春秋', en: 'Spring/Autumn', value: 'spring_autumn' },
      { zh: '冬季', en: 'Winter', value: 'winter' },
      { zh: '四季通用', en: 'All seasons', value: 'all' },
    ],
  },
];

function getRecommendedCategory(answers: string[]): string {
  const concern = answers[0];
  if (concern === 'newborn') return 'newborn';
  if (concern === 'light' || concern === 'cold') return 'duvet'; // premium
  if (concern === 'hot') return 'duvet'; // luxury/summer
  return 'duvet';
}

export function SleepQuizDialog({ open, onOpenChange }: Props) {
  const { locale, fp, currency, addToCart } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  const handleSelect = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  useEffect(() => {
    if (!done) return;
    const category = getRecommendedCategory(answers);
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('is_featured', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setRecommendedProducts(data.map(d => dbToLegacyProduct(d as DbProduct)));
      });
  }, [done, answers]);

  const reset = () => { setStep(0); setAnswers([]); setDone(false); setRecommendedProducts([]); };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {locale === 'zh' ? '找到适合你的被子' : 'Find Your Perfect Duvet'}
          </DialogTitle>
        </DialogHeader>

        {!done ? (
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="flex gap-1 mb-4">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-muted'}`} />
                ))}
              </div>
              <p className="font-body text-sm mb-4">{locale === 'zh' ? STEPS[step].questionZh : STEPS[step].questionEn}</p>
              <div className="space-y-2">
                {STEPS[step].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className="w-full text-left px-4 py-3 rounded-sm border border-border hover:border-accent hover:bg-accent/5 transition-colors font-body text-sm text-foreground"
                  >
                    {locale === 'zh' ? opt.zh : opt.en}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-4">
            <p className="text-muted-foreground font-body text-sm mb-4 text-center">
              {locale === 'zh' ? '为您推荐以下产品' : 'Recommended Products for You'}
            </p>
            {recommendedProducts.length > 0 ? (
              <div className="space-y-3">
                {recommendedProducts.map(product => (
                  <div key={product.id} className="flex items-center gap-3 border border-border rounded-sm p-3">
                    <img src={product.image} alt="" className="w-14 h-14 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${product.id}`}
                        onClick={() => onOpenChange(false)}
                        className="font-body font-semibold text-sm hover:text-gold truncate block"
                      >
                        {locale === 'zh' ? product.nameZh : product.nameEn}
                      </Link>
                      <p className="text-gold font-display text-sm">{fp(product.prices[currency])}</p>
                    </div>
                    <button
                      onClick={() => { addToCart(product); onOpenChange(false); }}
                      className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-gold flex-shrink-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}