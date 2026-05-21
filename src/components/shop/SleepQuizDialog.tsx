import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
      { zh: '出汗/闷热', en: 'Sweating / Too hot', value: 'hot' },
      { zh: '过敏/螨虫', en: 'Allergies / Dust mites', value: 'allergy' },
      { zh: '总体睡眠质量差', en: 'Poor overall sleep quality', value: 'quality' },
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

interface Recommendation {
  product_id: string;
  product_name_en: string;
  product_name_zh: string;
  reason_en: string;
  reason_zh: string;
}

export function SleepQuizDialog({ open, onOpenChange }: Props) {
  const { locale } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);

  const reset = () => {
    setStep(0);
    setAnswers([]);
    setLoading(false);
    setResult(null);
  };

  const runRecommendation = async (allAnswers: string[]) => {
    setLoading(true);
    try {
      const { data: productRows } = await supabase
        .from('products')
        .select('id, name_en, name_zh, price_nzd, description_en, category')
        .eq('is_active', true);

      const products = (productRows ?? []).map((p) => ({
        id: p.id,
        name_en: p.name_en,
        name_zh: p.name_zh,
        tier: p.category,
        price_nzd: Number(p.price_nzd),
        description_en: p.description_en ?? '',
      }));

      const { data, error } = await supabase.functions.invoke('recommend', {
        body: { answers: allAnswers, products },
      });

      if (error) throw error;

      const rec = data as { product_id: string; reason_en: string; reason_zh: string };
      const matched = products.find((p) => p.id === rec.product_id) ?? products[0];

      const finalRec: Recommendation = {
        product_id: rec.product_id,
        product_name_en: matched?.name_en ?? '',
        product_name_zh: matched?.name_zh ?? '',
        reason_en: rec.reason_en,
        reason_zh: rec.reason_zh,
      };
      setResult(finalRec);

      // Save assessment (best effort)
      await supabase.from('sleep_assessments').insert({
        answers: allAnswers,
        recommended_products: [rec.product_id],
        reason_en: rec.reason_en,
        reason_zh: rec.reason_zh,
        converted: false,
      });
    } catch (e) {
      console.error('recommendation error', e);
      setResult({
        product_id: '',
        product_name_en: 'Luxury Alpaca Duvet',
        product_name_zh: '轻奢款羊驼被',
        reason_en: 'A balanced choice suited to most sleepers.',
        reason_zh: '适合大多数睡眠者的均衡之选。',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      runRecommendation(newAnswers);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {locale === 'zh' ? '找到适合你的被子' : 'Find Your Perfect Duvet'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="font-body text-sm text-muted-foreground">
              {locale === 'zh' ? '正在为您匹配最佳产品…' : 'Finding your perfect match…'}
            </p>
          </div>
        ) : !result ? (
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <p className="text-muted-foreground font-body text-sm mb-2">
              {locale === 'zh' ? '为您推荐' : 'Recommended for You'}
            </p>
            <p className="font-display text-2xl font-semibold mb-3">
              {locale === 'zh' ? result.product_name_zh : result.product_name_en}
            </p>
            <p className="font-body text-sm text-muted-foreground mb-6 px-2">
              {locale === 'zh' ? result.reason_zh : result.reason_en}
            </p>
            <Link
              to="/shop"
              onClick={() => onOpenChange(false)}
              className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-sm font-body hover:bg-accent/90 transition-colors"
            >
              {locale === 'zh' ? '查看产品' : 'View Products'}
            </Link>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
