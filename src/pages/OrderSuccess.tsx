import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/Navbar';
import { CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderSuccessPage() {
  const { locale } = useApp();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('number') || 'PA-2025-XXXXXXXX';
  const batchCode = searchParams.get('batch') || 'PA-2025-001';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="font-display text-3xl mb-2">
            {locale === 'zh' ? '订单提交成功！' : 'Order Submitted!'}
          </h1>
          <p className="text-muted-foreground font-body mb-2">
            {locale === 'zh' ? '订单编号' : 'Order Number'}
          </p>
          <p className="font-mono text-lg text-gold font-semibold mb-8">{orderNumber}</p>
          <p className="text-muted-foreground font-body text-sm mb-8 max-w-md mx-auto">
            {locale === 'zh'
              ? '我们会尽快处理您的订单，您将收到一封确认邮件。'
              : 'We will process your order shortly. You will receive a confirmation email.'}
          </p>
          <div className="flex gap-4 justify-center mb-10">
            <Link to="/shop" className="px-6 py-3 border border-border rounded-sm font-body text-sm hover:bg-secondary transition-colors">
              {locale === 'zh' ? '继续购物' : 'Continue Shopping'}
            </Link>
            <Link to="/" className="px-6 py-3 bg-accent text-accent-foreground rounded-sm font-body text-sm hover:bg-accent/90 transition-colors">
              {locale === 'zh' ? '返回首页' : 'Back to Home'}
            </Link>
          </div>

          {/* Traceability CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-md mx-auto bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-2 justify-center">
              <MapPin className="w-4 h-4 text-gold" />
              <p className="font-display text-lg font-semibold">{locale === 'zh' ? '追溯您的羊驼被' : 'Trace Your Duvet'}</p>
            </div>
            <p className="text-xs text-muted-foreground font-body mb-1">
              {locale === 'zh' ? '批次编号' : 'Batch Code'}
            </p>
            <p className="font-mono text-base font-semibold text-gold mb-3">{batchCode}</p>
            <p className="text-xs text-muted-foreground font-body mb-4">
              {locale === 'zh'
                ? '扫描包装上的二维码，或点击下方按钮，查看您的被子来自哪个牧场的哪批羊驼。'
                : 'Scan the QR code on your packaging, or click below to see which farm and flock your duvet came from.'}
            </p>
            <Link
              to={`/traceability?code=${batchCode}`}
              className="block w-full text-center py-2.5 border border-gold/40 text-gold rounded-sm font-body text-sm hover:bg-gold/10 transition-colors"
            >
              {locale === 'zh' ? '📱 查看溯源故事 →' : '📱 View Trace Story →'}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
