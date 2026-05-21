import { useApp } from '@/contexts/AppContext';
import { Users } from 'lucide-react';

const mockGrowers = [
  { id: '1', farm: 'Cromwell Highlands', owner: 'James Wilson', region: 'Central Otago', herd: 142, status: 'active' },
  { id: '2', farm: 'Wanaka Alpacas', owner: 'Sarah McKenzie', region: 'Otago', herd: 86, status: 'active' },
  { id: '3', farm: 'Tasman Valley Ranch', owner: 'Tom Hughes', region: 'Canterbury', herd: 210, status: 'active' },
];

export default function AdminGrowers() {
  const { locale } = useApp();

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-lg flex items-center gap-2">
          <Users className="w-4 h-4" />
          {locale === 'zh' ? '牧场主管理' : 'Grower Network'}
        </h3>
        <button className="px-4 py-2 bg-accent text-accent-foreground text-sm font-body rounded hover:opacity-90 transition">
          + {locale === 'zh' ? '邀请牧场' : 'Invite Grower'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '牧场' : 'Farm'}</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '负责人' : 'Owner'}</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '区域' : 'Region'}</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '羊驼数' : 'Herd'}</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '状态' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            {mockGrowers.map(g => (
              <tr key={g.id} className="border-t border-border hover:bg-muted/50">
                <td className="p-4 font-semibold">{g.farm}</td>
                <td className="p-4">{g.owner}</td>
                <td className="p-4 text-muted-foreground">{g.region}</td>
                <td className="p-4">{g.herd}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
                    {g.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
