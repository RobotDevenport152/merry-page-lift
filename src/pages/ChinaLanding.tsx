import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Trophy, Tv, Leaf, PawPrint, Thermometer, Feather, Droplets, Bug, Zap, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const AUTHORITY = [
  { icon: Trophy, title: '胡润至尚优品2023金奖', desc: '第十九届"软装家居"新秀奖' },
  { icon: Tv, title: '央视CCTV13专题报道', desc: '30+主流媒体关注' },
  { icon: Leaf, title: '新西兰政府银蕨认证', desc: 'NZFM101008' },
  { icon: PawPrint, title: '国际羊驼协会唯一企业成员', desc: 'Cert. 02-041' },
];

const WHY_ALPACA = [
  { icon: Thermometer, title: '保暖', value: '3倍于羊毛' },
  { icon: Feather, title: '轻盈', value: '仅羊毛被重量30%' },
  { icon: Droplets, title: '排潮', value: '可吸收35%水蒸气' },
  { icon: Bug, title: '抑螨', value: '趋避率64.37%（实验数据）' },
  { icon: Zap, title: '阻电', value: '天然抗静电，不吸灰尘' },
];

export default function ChinaLandingPage() {
  const copyWechat = () => {
    navigator.clipboard.writeText('pacificalpacas');
    toast.success('微信号已复制！');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <CartDrawer />

      {/* Hero */}
      <section className="pt-24 pb-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl mb-4 leading-tight">
              新西兰顶级羊驼被 · 官方旗舰
            </h1>
            <p className="font-body text-primary-foreground/70 text-lg mb-8">
              太平洋羊驼 — 新西兰最大羊驼纤维供应商，23年品牌积淀
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop" className="px-10 py-4 bg-accent text-accent-foreground font-body font-semibold rounded-sm tracking-wider hover:bg-accent/90 transition">
                立即选购
              </Link>
              <button onClick={copyWechat} className="px-10 py-4 border border-gold/40 text-gold font-body rounded-sm tracking-wider hover:bg-gold/10 transition">
                联系微信客服
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Authority Signals */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {AUTHORITY.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-lg border border-border p-6 text-center hover:border-gold/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground font-body">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Alpaca */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-center mb-10">为什么选择羊驼纤维</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {WHY_ALPACA.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="text-center">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-display text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-primary-foreground/60 font-body">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Traceability */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ShieldCheck className="w-12 h-12 text-gold mx-auto mb-4" />
            <h2 className="font-display text-3xl mb-4">每一床被子都有溯源码</h2>
            <p className="font-body text-muted-foreground text-sm leading-relaxed mb-6">
              扫描产品上的溯源码，即可查看您的羊驼被来自哪个牧场、哪批次纤维、经过怎样的加工流程。透明可追溯，是我们对品质的承诺。
            </p>
            <Link to="/traceability" className="inline-block px-8 py-3 bg-accent text-accent-foreground font-body rounded-sm hover:bg-accent/90 transition">
              查看溯源示例
            </Link>
          </motion.div>
        </div>
      </section>

      {/* WeChat Contact */}
      <section className="py-16 bg-cream-dark">
        <div className="container mx-auto px-6 text-center max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MessageCircle className="w-16 h-16 text-gold mx-auto mb-4" />
            <h2 className="font-display text-2xl mb-2">微信客服</h2>
            <p className="font-body text-lg font-semibold mb-2">pacificalpacas</p>
            <p className="font-body text-sm text-muted-foreground mb-6">
              添加微信，享专属中文服务、报价咨询及优先发货
            </p>
            <button onClick={copyWechat}
              className="px-10 py-4 bg-accent text-accent-foreground font-body font-semibold rounded-sm tracking-wider hover:bg-accent/90 transition">
              复制微信号
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
