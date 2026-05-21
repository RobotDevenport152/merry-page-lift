import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import { Layers, DollarSign, User as UserIcon } from 'lucide-react';

export default function GrowerDashboard() {
  const { locale } = useApp();
  const { user } = useAuth();

  const cards = [
    {
      to: '/grower/batches',
      icon: Layers,
      title: locale === 'zh' ? '我的纤维批次' : 'My Fiber Batches',
      desc: locale === 'zh' ? '查看批次状态、等级和重量' : 'View batch status, grade and weight',
    },
    {
      to: '/grower/credits',
      icon: DollarSign,
      title: locale === 'zh' ? '付款与积分' : 'Payments & Credits',
      desc: locale === 'zh' ? '查看付款记录和合作积分' : 'View payment history and credits',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={locale === 'zh' ? '牧场主面板' : 'Grower Dashboard'}
        description={locale === 'zh' ? '管理您的牧场和纤维批次' : 'Manage your farm and fiber batches'}
      />
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold mb-2">
              {locale === 'zh' ? '牧场主面板' : 'Grower Dashboard'}
            </h1>
            <p className="text-sm text-muted-foreground font-body">
              {locale === 'zh' ? '欢迎回来，' : 'Welcome back, '}
              <span className="text-foreground">{user?.email}</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {cards.map(c => (
              <Link
                key={c.to}
                to={c.to}
                className="block bg-card rounded-lg border border-border p-6 hover:border-gold transition-colors"
              >
                <c.icon className="w-6 h-6 text-gold mb-3" />
                <h3 className="font-display text-lg mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{c.desc}</p>
              </Link>
            ))}
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="w-5 h-5 text-gold" />
              <h3 className="font-display text-lg">
                {locale === 'zh' ? '牧场资料' : 'Farm Profile'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground font-body mb-4">
              {locale === 'zh'
                ? '更新您的牧场名称、地点和联系方式。'
                : 'Update your farm name, location and contact information.'}
            </p>
            <button
              className="px-5 py-2.5 bg-accent text-accent-foreground text-sm font-body tracking-wider rounded-sm hover:bg-accent/90 transition"
            >
              {locale === 'zh' ? '编辑资料' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
