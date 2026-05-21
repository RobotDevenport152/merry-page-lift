import { useApp } from '@/contexts/AppContext';
import { PROMO_CODES } from '@/lib/store';
import { Tag } from 'lucide-react';

export default function AdminPromos() {
  const { locale } = useApp();
  const entries = Object.entries(PROMO_CODES);

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-lg flex items-center gap-2">
          <Tag className="w-4 h-4" />
          {locale === 'zh' ? '优惠码管理' : 'Promo Codes'}
        </h3>
        <button className="px-4 py-2 bg-accent text-accent-foreground text-sm font-body rounded hover:opacity-90 transition">
          + {locale === 'zh' ? '新增优惠码' : 'Add Promo'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '优惠码' : 'Code'}</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '类型' : 'Type'}</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '折扣' : 'Discount'}</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '最低金额' : 'Min Amount'}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([code, p]) => (
              <tr key={code} className="border-t border-border hover:bg-muted/50">
                <td className="p-4 font-mono font-semibold">{code}</td>
                <td className="p-4 capitalize">{p.type}</td>
                <td className="p-4 text-gold font-semibold">
                  {p.type === 'percent' ? `${p.discount}%` : p.discount}
                </td>
                <td className="p-4 text-muted-foreground">{p.minAmount ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
