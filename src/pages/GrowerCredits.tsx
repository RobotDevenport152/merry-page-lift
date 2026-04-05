import { useNavigate, Link } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Copy } from 'lucide-react';
import { useState } from 'react';

const MOCK_TRANSACTIONS = [
  { id: '1', date: '2025-03-15', description_zh: 'PA-2025-001 批次收购结算', description_en: 'Batch PA-2025-001 settlement', amount: 2034, type: 'credit' },
  { id: '2', date: '2025-02-20', description_zh: 'PA-2025-002 批次预付款', description_en: 'Batch PA-2025-002 advance', amount: 800, type: 'credit' },
  { id: '3', date: '2025-01-10', description_zh: '兑换优惠券 GROWER50', description_en: 'Redeemed coupon GROWER50', amount: -50, type: 'debit' },
  { id: '4', date: '2024-11-10', description_zh: 'PA-2024-087 批次收购结算', description_en: 'Batch PA-2024-087 settlement', amount: 1927, type: 'credit' },
  { id: '5', date: '2024-06-05', description_zh: 'PA-2024-043 批次收购结算', description_en: 'Batch PA-2024-043 settlement', amount: 1251, type: 'credit' },
];

const CREDIT_BALANCE = 5962;
const PROMO_CODE = 'GROWER50';

export default function GrowerCreditsPage() {
  const { locale } = useApp();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!authLoading && !user) {
    navigate('/login');
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title={locale === 'zh' ? '我的积分账户' : 'My Credits'} />
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-6 max-w-3xl">

          {/* Portal Nav */}
          <div className="flex gap-1 mb-8 border-b border-border">
            <NavLink
              to="/grower/batches"
              className="px-4 py-2 font-body text-sm text-muted-foreground hover:text-foreground transition border-b-2 border-transparent -mb-px"
              activeClassName="border-gold text-foreground"
            >
              {locale === 'zh' ? '我的批次' : 'My Batches'}
            </NavLink>
            <NavLink
              to="/grower/credits"
              className="px-4 py-2 font-body text-sm text-muted-foreground hover:text-foreground transition border-b-2 border-transparent -mb-px"
              activeClassName="border-gold text-foreground"
            >
              {locale === 'zh' ? '我的积分' : 'My Credits'}
            </NavLink>
          </div>

          {/* Page title + back link */}
          <div className="mb-6">
            <h1 className="font-display text-3xl">
              {locale === 'zh' ? '我的积分账户' : 'My Credits'}
            </h1>
            <Link
              to="/grower/batches"
              className="text-xs text-gold hover:underline font-body mt-1 inline-block"
            >
              ← {locale === 'zh' ? '我的批次' : 'My Batches'}
            </Link>
          </div>

          {/* Balance card */}
          <div className="bg-card border border-border rounded-lg p-8 text-center mb-6">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-2">
              {locale === 'zh' ? '当前积分余额' : 'Current Credit Balance'}
            </p>
            <p className="font-display text-5xl font-semibold text-gold mb-2">
              NZD ${CREDIT_BALANCE.toLocaleString()}
            </p>
            <p className="font-body text-sm text-muted-foreground">
              {locale === 'zh' ? '可在商城直接抵扣' : 'Available to redeem in store'}
            </p>
          </div>

          {/* Rates card */}
          <div className="bg-gold/10 border border-gold/20 rounded-lg p-5 mb-6">
            <p className="font-body text-sm text-muted-foreground">
              {locale === 'zh'
                ? '积分计算规则：每公斤A+级纤维 = NZD $45 / A级 = NZD $42 / B+级 = NZD $37'
                : 'Credit rates: A+ grade NZD $45/kg · A grade NZD $42/kg · B+ grade NZD $37/kg'}
            </p>
          </div>

          {/* CTA button */}
          <div className="mb-6">
            <Link
              to="/shop"
              className="inline-block px-6 py-3 border border-gold text-gold font-body text-sm rounded hover:bg-gold hover:text-white transition"
            >
              {locale === 'zh' ? '前往商城兑换' : 'Redeem in Store'}
            </Link>
          </div>

          {/* Promo code card */}
          <div className="bg-card border border-border rounded-lg p-5 mb-8">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-3">
              {locale === 'zh' ? '专属优惠码' : 'Your Promo Code'}
            </p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-semibold tracking-widest border border-dashed border-gold/50 px-4 py-2 rounded text-gold">
                {PROMO_CODE}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs font-body text-muted-foreground hover:text-foreground transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? (locale === 'zh' ? '已复制' : 'Copied') : (locale === 'zh' ? '复制' : 'Copy')}
              </button>
            </div>
            <p className="font-body text-xs text-muted-foreground mt-3">
              {locale === 'zh'
                ? '将此码输入结账时的优惠码栏，可抵扣 NZD $50'
                : 'Enter this code at checkout to redeem NZD $50'}
            </p>
          </div>

          {/* Transaction history */}
          <h2 className="font-display text-xl mb-4">
            {locale === 'zh' ? '交易记录' : 'Transaction History'}
          </h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-semibold">
                    {locale === 'zh' ? '日期' : 'Date'}
                  </th>
                  <th className="text-left p-4 font-semibold">
                    {locale === 'zh' ? '说明' : 'Description'}
                  </th>
                  <th className="text-right p-4 font-semibold">
                    {locale === 'zh' ? '金额 (NZD)' : 'Amount (NZD)'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.map(tx => (
                  <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-NZ')}
                    </td>
                    <td className="p-4">
                      {locale === 'zh' ? tx.description_zh : tx.description_en}
                    </td>
                    <td className={`p-4 text-right font-semibold tabular-nums ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
