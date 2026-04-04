import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { locale } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error(locale === 'zh' ? '两次密码不一致' : 'Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error(locale === 'zh' ? '密码至少6位' : 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name, phone: form.phone },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      toast.success(locale === 'zh' ? '注册成功！请检查邮箱验证链接。' : 'Registration successful! Please check your email for verification.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || (locale === 'zh' ? '注册失败' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={locale === 'zh' ? '注册' : 'Register'}
        description={locale === 'zh' ? '创建 Pacific Alpacas 账户' : 'Create your Pacific Alpacas account'}
      />
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-semibold mb-2">
                {locale === 'zh' ? '创建账户' : 'Create Account'}
              </h1>
              <p className="text-sm text-muted-foreground font-body">
                {locale === 'zh' ? '注册享受会员专属优惠' : 'Sign up for exclusive benefits'}
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '姓名 *' : 'Name *'}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" required value={form.name} onChange={e => update('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '邮箱 *' : 'Email *'}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '手机号（可选）' : 'Phone (optional)'}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '密码 *' : 'Password *'}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => update('password', e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '确认密码 *' : 'Confirm Password *'}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPw ? 'text' : 'password'} required value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm tracking-wider hover:bg-accent/90 transition disabled:opacity-50">
                {loading ? '...' : (locale === 'zh' ? '注册' : 'Create Account')}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground font-body mt-6">
              {locale === 'zh' ? '已有账号？' : 'Already have an account? '}
              <Link to="/login" className="text-gold hover:underline font-semibold">
                {locale === 'zh' ? '登录' : 'Sign In'}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
