import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Download } from 'lucide-react';

const MOCK_BATCHES = [
  { batch_code: 'PA-2025-001', created_at: '2025-03-15', weight_kg: 45.2, grade: 'A+', status: 'paid', payout_nzd: 2034 },
  { batch_code: 'PA-2025-002', created_at: '2025-02-20', weight_kg: 38.7, grade: 'A', status: 'processing', payout_nzd: 1625 },
  { batch_code: 'PA-2024-087', created_at: '2024-11-10', weight_kg: 52.1, grade: 'B+', status: 'paid', payout_nzd: 1927 },
  { batch_code: 'PA-2024-043', created_at: '2024-06-05', weight_kg: 29.8, grade: 'A', status: 'paid', payout_nzd: 1251 },
  { batch_code: 'PA-2023-112', created_at: '2023-12-18', weight_kg: 41.3, grade: 'A+', status: 'paid', payout_nzd: 1859 },
];

type Batch = typeof MOCK_BATCHES[number];

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  received: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<string, { zh: string; en: string }> = {
  paid: { zh: '已结算', en: 'Paid' },
  processing: { zh: '处理中', en: 'Processing' },
  received: { zh: '已接收', en: 'Received' },
};

const YEAR_FILTERS = ['All', '2025', '2024', '2023'];

function exportCSV(batches: Batch[]) {
  const header = 'Batch Code,Date,Weight (kg),Grade,Status,Payout (NZD)';
  const rows = batches.map(b =>
    `${b.batch_code},${b.created_at},${b.weight_kg},${b.grade},${b.status},${b.payout_nzd}`
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fiber-batches.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function GrowerBatchesPage() {
  const { locale } = useApp();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [yearFilter, setYearFilter] = useState('All');

  const { data: fetchedBatches, isLoading: queryLoading } = useQuery({
    queryKey: ['fiber_batches', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiber_batches')
        .select('*')
        .eq('grower_user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((d: any) => ({
        batch_code: d.batch_code,
        created_at: d.created_at,
        weight_kg: d.weight_kg ?? 0,
        grade: d.fiber_grade ?? 'N/A',
        status: d.status ?? 'received',
        payout_nzd: d.payout ?? 0,
      })) as Batch[];
    },
    enabled: !!user,
  });

  if (!authLoading && !user) {
    navigate('/login');
    return null;
  }

  const batches: Batch[] = fetchedBatches && fetchedBatches.length > 0 ? fetchedBatches : MOCK_BATCHES;

  const filtered = yearFilter === 'All'
    ? batches
    : batches.filter(b => b.batch_code.startsWith(`PA-${yearFilter}`));

  const totalWeight = filtered.reduce((s, b) => s + b.weight_kg, 0);
  const totalPayout = filtered.reduce((s, b) => s + b.payout_nzd, 0);

  const loading = authLoading || queryLoading;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title={locale === 'zh' ? '我的纤维批次' : 'My Fiber Batches'} />
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-6 max-w-5xl">

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

          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl">
                {locale === 'zh' ? '我的纤维批次' : 'My Fiber Batches'}
              </h1>
              <Link
                to="/grower/credits"
                className="text-xs text-gold hover:underline font-body mt-1 inline-block"
              >
                ← {locale === 'zh' ? '我的积分' : 'My Credits'}
              </Link>
            </div>
            <button
              onClick={() => exportCSV(filtered)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm font-body hover:border-gold/50 transition"
            >
              <Download className="w-4 h-4" />
              {locale === 'zh' ? '导出 CSV' : 'Export CSV'}
            </button>
          </div>

          {/* Year filters */}
          <div className="flex gap-2 mb-6">
            {YEAR_FILTERS.map(y => (
              <button
                key={y}
                onClick={() => setYearFilter(y)}
                className={`px-3 py-1 rounded text-sm font-body border transition ${
                  yearFilter === y
                    ? 'bg-gold text-white border-gold'
                    : 'border-border text-muted-foreground hover:border-gold/50'
                }`}
              >
                {y === 'All' ? (locale === 'zh' ? '全部' : 'All') : y}
              </button>
            ))}
          </div>

          {/* Summary stats */}
          {!loading && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="font-display text-2xl font-semibold">{filtered.length}</p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  {locale === 'zh' ? '总批次' : 'Total Batches'}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="font-display text-2xl font-semibold">{totalWeight.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  {locale === 'zh' ? '总重量 (kg)' : 'Total Weight (kg)'}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="font-display text-2xl font-semibold text-gold">
                  NZD ${totalPayout.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  {locale === 'zh' ? '总收益 (NZD)' : 'Total Payout (NZD)'}
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-semibold">
                      {locale === 'zh' ? '批次编号' : 'Batch Code'}
                    </th>
                    <th className="text-left p-4 font-semibold">
                      {locale === 'zh' ? '日期' : 'Date'}
                    </th>
                    <th className="text-left p-4 font-semibold">
                      {locale === 'zh' ? '重量 (kg)' : 'Weight (kg)'}
                    </th>
                    <th className="text-left p-4 font-semibold">
                      {locale === 'zh' ? '等级' : 'Grade'}
                    </th>
                    <th className="text-left p-4 font-semibold">
                      {locale === 'zh' ? '状态' : 'Status'}
                    </th>
                    <th className="text-left p-4 font-semibold">
                      {locale === 'zh' ? '收益 (NZD)' : 'Payout (NZD)'}
                    </th>
                    <th className="text-left p-4 font-semibold">
                      {locale === 'zh' ? '溯源' : 'Traceability'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-border">
                          <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse w-24" /></td>
                          <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse w-20" /></td>
                          <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse w-12" /></td>
                          <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse w-10" /></td>
                          <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse w-16" /></td>
                          <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse w-16" /></td>
                          <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse w-20" /></td>
                        </tr>
                      ))
                    : filtered.map(batch => (
                        <tr key={batch.batch_code} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <span className="font-mono text-xs">{batch.batch_code}</span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(batch.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-NZ')}
                          </td>
                          <td className="p-4">{batch.weight_kg}</td>
                          <td className="p-4 font-semibold">{batch.grade}</td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[batch.status] || 'bg-muted text-muted-foreground'}`}>
                              {STATUS_LABELS[batch.status]?.[locale === 'zh' ? 'zh' : 'en'] || batch.status}
                            </span>
                          </td>
                          <td className="p-4 text-gold font-semibold">
                            NZD ${batch.payout_nzd.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <Link
                              to={`/traceability?code=${batch.batch_code}`}
                              className="text-gold hover:underline text-xs"
                            >
                              {locale === 'zh' ? '查看溯源 →' : 'View →'}
                            </Link>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
