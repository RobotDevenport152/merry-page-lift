import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import { Mail, Lock, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'login' | 'register';

export default function AuthPage() {
  const { locale } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(locale === 'zh' ? '登录成功！' : 'Logged in!');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success(locale === 'zh' ? '注册成功！请查收验证邮件。' : 'Signed up! Check your email to verify.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(msg || (locale === 'zh' ? '操作失败' : 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={locale === 'zh' ? (tab === 'login' ? '登录' : '注册') : (tab === 'login' ? 'Login' : 'Register')}
        description="Pacific Alpacas account"
      />
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="flex border-b border-border mb-6">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-3 text-sm font-body tracking-wider transition-colors ${
                  tab === 'login' ? 'text-gold border-b-2 border-gold' : 'text-muted-foreground'
                }`}
              >
                {locale === 'zh' ? '登录' : 'Sign In'}
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-3 text-sm font-body tracking-wider transition-colors ${
                  tab === 'register' ? 'text-gold border-b-2 border-gold' : 'text-muted-foreground'
                }`}
              >
                {locale === 'zh' ? '注册' : 'Sign Up'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1">
                    {locale === 'zh' ? '姓名' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">
                  {locale === 'zh' ? '邮箱地址' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">
                  {locale === 'zh' ? '密码' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {tab === 'login' && (
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-gold hover:underline font-body">
                    {locale === 'zh' ? '忘记密码？' : 'Forgot password?'}
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm tracking-wider hover:bg-accent/90 transition disabled:opacity-50"
              >
                {loading ? '...' : (tab === 'login' ? (locale === 'zh' ? '登录' : 'Sign In') : (locale === 'zh' ? '注册' : 'Sign Up'))}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
