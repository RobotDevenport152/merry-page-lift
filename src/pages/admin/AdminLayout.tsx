import { Outlet, NavLink } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import CartDrawer from '@/components/cart/CartDrawer';
import SEOHead from '@/components/SEOHead';
import { Package, ShoppingCart, BarChart3, Tag, Layers, Users } from 'lucide-react';

const navItems = [
  { to: '/admin', end: true, key: 'dashboard', en: 'Dashboard', zh: '数据看板', icon: BarChart3 },
  { to: '/admin/products', key: 'products', en: 'Products', zh: '产品管理', icon: Package },
  { to: '/admin/orders', key: 'orders', en: 'Orders', zh: '订单看板', icon: ShoppingCart },
  { to: '/admin/promos', key: 'promos', en: 'Promotions', zh: '优惠管理', icon: Tag },
  { to: '/admin/fiber-batches', key: 'fiber', en: 'Fiber Batches', zh: '纤维批次', icon: Layers },
  { to: '/admin/growers', key: 'growers', en: 'Growers', zh: '牧场主', icon: Users },
];

export default function AdminLayout() {
  const { locale } = useApp();

  return (
    <div className="min-h-screen bg-muted">
      <SEOHead title={locale === 'zh' ? '管理后台' : 'Admin Panel'} description="Pacific Alpacas admin" />
      <Navbar />
      <CartDrawer />

      <div className="pt-20 flex">
        <aside className="hidden md:flex flex-col w-64 bg-primary min-h-[calc(100vh-5rem)] p-6 gap-2">
          <h2 className="font-display text-lg text-primary-foreground tracking-wider mb-6">
            {locale === 'zh' ? '管理后台' : 'Admin Panel'}
          </h2>
          {navItems.map(item => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded text-sm font-body transition-colors text-left ${
                  isActive
                    ? 'bg-gold/20 text-gold'
                    : 'text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {locale === 'zh' ? item.zh : item.en}
            </NavLink>
          ))}
        </aside>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-primary z-40 flex border-t border-primary-foreground/10 overflow-x-auto">
          {navItems.map(item => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex-1 min-w-[64px] flex flex-col items-center gap-1 py-3 text-[10px] font-body ${
                  isActive ? 'text-gold' : 'text-primary-foreground/50'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {locale === 'zh' ? item.zh : item.en}
            </NavLink>
          ))}
        </div>

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
