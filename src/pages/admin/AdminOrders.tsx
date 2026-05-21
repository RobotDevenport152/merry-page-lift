import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Download, CheckSquare } from 'lucide-react';

const mockOrders = [
  { id: 'ORD-001', customer: 'Li Wei', email: 'li@test.com', total: 5880, status: 'pending', date: '2025-03-28', items: '轻奢款羊驼被 ×1' },
  { id: 'ORD-002', customer: 'Sarah Chen', email: 'sarah@test.com', total: 2880, status: 'processing', date: '2025-03-27', items: '经典款羊驼被 ×1' },
  { id: 'ORD-003', customer: 'John Smith', email: 'john@test.com', total: 1980, status: 'shipped', date: '2025-03-26', items: 'X6羊驼马甲 ×1' },
  { id: 'ORD-004', customer: 'Wang Fang', email: 'wang@test.com', total: 12800, status: 'delivered', date: '2025-03-25', items: '高奢款羊驼被 ×1' },
  { id: 'ORD-005', customer: 'Emma Brown', email: 'emma@test.com', total: 680, status: 'pending', date: '2025-03-28', items: '羊驼围巾 ×1' },
  { id: 'ORD-006', customer: 'Zhang Wei', email: 'zhang@test.com', total: 1280, status: 'paid', date: '2025-03-27', items: '羊驼毛衣 ×1' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminOrders() {
  const { locale, fp } = useApp();
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const filteredOrders = orderStatusFilter === 'all' ? mockOrders : mockOrders.filter(o => o.status === orderStatusFilter);

  const toggleOrderSelection = (id: string) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const exportCSV = () => {
    const rows = filteredOrders.map(o => `${o.id},${o.date},${o.customer},${o.email},${o.items},${o.total},${o.status}`);
    const csv = `订单号,日期,客户,邮箱,商品,金额,状态\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {['all', 'pending', 'paid', 'processing', 'shipped', 'delivered'].map(status => (
          <button key={status} onClick={() => setOrderStatusFilter(status)}
            className={`bg-background rounded-lg border p-4 text-left transition-colors ${orderStatusFilter === status ? 'border-gold' : 'border-border'}`}>
            <span className="text-xs text-muted-foreground font-body capitalize">{status === 'all' ? (locale === 'zh' ? '全部' : 'All') : status}</span>
            <p className="font-display text-xl font-semibold">{status === 'all' ? mockOrders.length : mockOrders.filter(o => o.status === status).length}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <span className="text-xs font-body text-muted-foreground">
              {locale === 'zh' ? `已选 ${selectedOrders.length} 个` : `${selectedOrders.length} selected`}
            </span>
          )}
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-sm font-body rounded hover:opacity-90 transition">
          <Download className="w-4 h-4" />
          {locale === 'zh' ? '导出CSV' : 'Export CSV'}
        </button>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 w-8"><CheckSquare className="w-4 h-4 text-muted-foreground" /></th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '订单号' : 'Order'}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '客户' : 'Customer'}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '商品' : 'Items'}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '金额' : 'Amount'}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '状态' : 'Status'}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '日期' : 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <input type="checkbox" checked={selectedOrders.includes(o.id)} onChange={() => toggleOrderSelection(o.id)}
                      className="w-4 h-4 rounded border-border cursor-pointer" />
                  </td>
                  <td className="p-4 font-mono text-xs">{o.id}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-semibold">{o.customer}</p>
                      <p className="text-[10px] text-muted-foreground">{o.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-xs">{o.items}</td>
                  <td className="p-4 text-gold font-semibold">{fp(o.total)}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase ${statusColors[o.status]}`}>{o.status}</span></td>
                  <td className="p-4 text-muted-foreground">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
