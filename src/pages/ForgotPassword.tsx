import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { locale } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success(locale === 'zh' ? '重置链接已发送到您的邮箱' : 'Reset link sent to your email');
    } catch (err: any) {
      toast.error(err.message || (locale === 'zh' ? '发送失败' : 'Failed to send'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={locale === 'zh' ? '忘记密码' : 'Forgot Password'}
        description={locale === 'zh' ? '重置您的密码' : 'Reset your password'}
      />
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border p-8">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-body mb-6">
              <ArrowLeft className="w-4 h-4" />
              {locale === 'zh' ? '返回登录' : 'Back to Login'}
            </Link>

            <h1 className="font-display text-3xl font-semibold mb-2">
              {locale === 'zh' ? '忘记密码' : 'Forgot Password'}
            </h1>
            <p className="text-sm text-muted-foreground font-body mb-8">
              {locale === 'zh' ? '输入您的邮箱地址，我们将发送重置链接。' : "Enter your email and we'll send you a reset link."}
            </p>

            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  {locale === 'zh' ? '请检查您的邮箱并点击重置链接。' : 'Please check your email and click the reset link.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1">{locale === 'zh' ? '邮箱地址' : 'Email'}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm tracking-wider hover:bg-accent/90 transition disabled:opacity-50">
                  {loading ? '...' : (locale === 'zh' ? '发送重置链接' : 'Send Reset Link')}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
