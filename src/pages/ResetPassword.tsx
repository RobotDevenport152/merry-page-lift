import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const { locale } = useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error(locale === 'zh' ? '两次密码不一致' : 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error(locale === 'zh' ? '密码至少6位' : 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    // TODO: supabase.auth.updateUser({ password })
    setTimeout(() => {
      toast.success(locale === 'zh' ? '密码已重置！' : 'Password has been reset!');
      setLoading(false);
      navigate('/login');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title={locale === 'zh' ? '重置密码' : 'Reset Password'} description="Reset your password" />
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border p-8">
            <h1 className="font-display text-3xl font-semibold mb-6 text-center">
              {locale === 'zh' ? '设置新密码' : 'Set New Password'}
            </h1>
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '新密码' : 'New Password'}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '确认新密码' : 'Confirm Password'}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm tracking-wider hover:bg-accent/90 transition disabled:opacity-50">
                {loading ? '...' : (locale === 'zh' ? '重置密码' : 'Reset Password')}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
