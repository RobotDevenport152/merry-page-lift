import { useApp } from '@/contexts/AppContext';
import { products } from '@/lib/store';

export default function AdminProducts() {
  const { locale, fp, currency } = useApp();

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-lg">{locale === 'zh' ? '产品列表' : 'Product List'}</h3>
        <button className="px-4 py-2 bg-accent text-accent-foreground text-sm font-body rounded hover:opacity-90 transition">
          + {locale === 'zh' ? '新增产品' : 'Add Product'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '产品' : 'Product'}</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '分类' : 'Category'}</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '价格' : 'Price'}</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '库存' : 'Stock'}</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">{locale === 'zh' ? '操作' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={p.image} className="w-10 h-10 rounded object-cover" alt="" />
                  <span className="font-semibold">{locale === 'zh' ? p.nameZh : p.nameEn}</span>
                </td>
                <td className="p-4 capitalize">{p.category}</td>
                <td className="p-4 text-gold font-semibold">{fp(p.prices[currency])}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${p.stock < 5 ? 'bg-red-100 text-red-700' : p.stock < 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {p.stock < 5 && '⚠ '}{p.stock}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-xs text-gold hover:underline mr-3">{locale === 'zh' ? '编辑' : 'Edit'}</button>
                  <button className="text-xs text-destructive hover:underline">{locale === 'zh' ? '删除' : 'Delete'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
