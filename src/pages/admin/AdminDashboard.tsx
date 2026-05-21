import { useApp } from '@/contexts/AppContext';
import { products } from '@/lib/store';
import { Package, ShoppingCart, AlertTriangle, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const mockOrders = [
  { id: 'ORD-001', total: 5880, status: 'pending', date: '2025-03-28' },
  { id: 'ORD-002', total: 2880, status: 'processing', date: '2025-03-27' },
  { id: 'ORD-003', total: 1980, status: 'shipped', date: '2025-03-26' },
  { id: 'ORD-004', total: 12800, status: 'delivered', date: '2025-03-25' },
  { id: 'ORD-005', total: 680, status: 'pending', date: '2025-03-28' },
  { id: 'ORD-006', total: 1280, status: 'paid', date: '2025-03-27' },
];

const salesData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 29 + i);
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    sales: Math.floor(Math.random() * 8000) + 2000,
  };
});

const categoryData = [
  { name: '床品系列', value: 65 },
  { name: '大衣系列', value: 22 },
  { name: '配饰系列', value: 13 },
];

const CHART_COLORS = ['hsl(35, 60%, 50%)', 'hsl(220, 25%, 15%)', 'hsl(35, 50%, 75%)'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100',
  paid: 'bg-green-100',
  processing: 'bg-blue-100',
  shipped: 'bg-indigo-100',
  delivered: 'bg-emerald-100',
};

export default function AdminDashboard() {
  const { locale, fp } = useApp();

  const lowStockProducts = products.filter(p => p.stock < 15);
  const todayOrders = mockOrders.filter(o => o.date === '2025-03-28');
  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);
  const monthGMV = mockOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background rounded-lg p-5 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-body">{locale === 'zh' ? '今日订单' : "Today's Orders"}</span>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="font-display text-2xl font-semibold">{todayOrders.length}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-emerald-600 font-body">+25%</span>
          </div>
        </div>
        <div className="bg-background rounded-lg p-5 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-body">{locale === 'zh' ? '今日销售额' : "Today's Sales"}</span>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="font-display text-2xl font-semibold">{fp(todaySales)}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="w-3 h-3 text-destructive" />
            <span className="text-[10px] text-destructive font-body">-12%</span>
          </div>
        </div>
        <div className="bg-background rounded-lg p-5 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-body">{locale === 'zh' ? '本月GMV' : 'Monthly GMV'}</span>
            <Package className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="font-display text-2xl font-semibold">{fp(monthGMV)}</p>
        </div>
        <div className="bg-background rounded-lg p-5 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-body">{locale === 'zh' ? '库存预警' : 'Low Stock'}</span>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <p className="font-display text-2xl font-semibold text-destructive">{lowStockProducts.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-background rounded-lg border border-border p-5">
          <h3 className="font-display text-lg mb-4">{locale === 'zh' ? '30天销售趋势' : '30-Day Sales Trend'}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 85%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip />
              <Line type="monotone" dataKey="sales" stroke="hsl(35, 60%, 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-background rounded-lg border border-border p-5">
          <h3 className="font-display text-lg mb-4">{locale === 'zh' ? '品类销售占比' : 'Category Split'}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border p-5">
        <h3 className="font-display text-lg mb-4">{locale === 'zh' ? '订单状态漏斗' : 'Order Funnel'}</h3>
        <div className="flex items-end gap-4 h-32">
          {['pending', 'paid', 'processing', 'shipped', 'delivered'].map(status => {
            const count = mockOrders.filter(o => o.status === status).length;
            const pct = (count / mockOrders.length) * 100;
            return (
              <div key={status} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-body font-semibold">{count}</span>
                <div className="w-full bg-muted rounded-t" style={{ height: `${Math.max(pct, 10)}%` }}>
                  <div className={`w-full h-full rounded-t ${statusColors[status] || 'bg-muted'}`} />
                </div>
                <span className="text-[10px] text-muted-foreground font-body capitalize">{status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
