import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Layers } from 'lucide-react';

interface Batch {
  id: string;
  batch_code: string | null;
  fiber_grade: string | null;
  weight_kg: number | null;
  status: string | null;
  created_at: string;
}

export default function AdminFiberBatches() {
  const { locale } = useApp();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('fiber_batches').select('*').order('created_at', { ascending: false }).limit(100);
      setBatches((data as Batch[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="font-display text-lg flex items-center gap-2">
          <Layers className="w-4 h-4" />
          {locale === 'zh' ? '纤维批次管理' : 'Fiber Batches'}
        </h3>
      </div>
      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground font-body">Loading...</div>
      ) : batches.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground font-body">
          {locale === 'zh' ? '暂无批次' : 'No batches yet'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '批次号' : 'Batch'}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '等级' : 'Grade'}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '重量 (kg)' : 'Weight (kg)'}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '状态' : 'Status'}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '日期' : 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(b => (
                <tr key={b.id} className="border-t border-border hover:bg-muted/50">
                  <td className="p-4 font-mono text-xs">{b.batch_code || b.id.slice(0, 8)}</td>
                  <td className="p-4">{b.fiber_grade || '—'}</td>
                  <td className="p-4">{b.weight_kg ?? '—'}</td>
                  <td className="p-4 capitalize">{b.status || '—'}</td>
                  <td className="p-4 text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
