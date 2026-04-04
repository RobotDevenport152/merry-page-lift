import { useState, useEffect } from 'react';
import { ShoppingBag, Globe, Menu, X, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Link, useLocation } from 'react-router-dom';
import type { Currency } from '@/lib/store';

export default function Navbar() {
  const { locale, setLocale, t, currency, setCurrency, cartCount, setCartOpen } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: isHome ? '#about' : '/#about', label: t.nav.about },
    { href: isHome ? '#fiber' : '/#fiber', label: t.nav.whyAlpaca },
    { href: '/shop', label: t.nav.products },
    { href: '/growers-info', label: locale === 'zh' ? '牧场合作' : 'Growers' },
    { href: '/contact', label: locale === 'zh' ? '联系我们' : 'Contact' },
    { href: isHome ? '#credentials' : '/#credentials', label: t.nav.credentials },
  ];

  const mobileLinks = [
    ...navLinks,
    { href: '/wholesale', label: locale === 'zh' ? '批发询价' : 'Wholesale' },
    { href: '/traceability', label: locale === 'zh' ? '溯源' : 'Trace' },
    { href: '/my-orders', label: locale === 'zh' ? '我的订单' : 'My Orders' },
    { href: '/login', label: locale === 'zh' ? '登录' : 'Login' },
    { href: '/admin', label: t.nav.admin },
  ];

  const currencies: Currency[] = ['CNY', 'NZD', 'USD'];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled || !isHome ? 'bg-primary/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl tracking-[0.3em] text-primary-foreground font-semibold">
          PACIFIC ALPACAS
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            link.href.startsWith('#') || link.href.startsWith('/#') ? (
              <a key={link.href} href={link.href}
                className="text-primary-foreground/80 hover:text-primary-foreground text-sm tracking-wider transition-colors font-body uppercase">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} to={link.href}
                className={`text-sm tracking-wider transition-colors font-body uppercase ${
                  location.pathname === link.href ? 'text-gold' : 'text-primary-foreground/80 hover:text-primary-foreground'
                }`}>
                {link.label}
              </Link>
            )
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* China flag link */}
          <Link to="/china" className="hidden lg:block text-lg hover:opacity-80 transition-opacity" title="中国专区">
            🇨🇳
          </Link>

          <select
            value={currency}
            onChange={e => setCurrency(e.target.value as Currency)}
            className="bg-transparent text-primary-foreground/80 text-xs border border-primary-foreground/20 rounded px-2 py-1 font-body cursor-pointer"
          >
            {currencies.map(c => (
              <option key={c} value={c} className="bg-primary text-primary-foreground">{c}</option>
            ))}
          </select>

          <button
            onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center gap-1 text-xs font-body"
          >
            <Globe className="w-4 h-4" />
            {locale === 'en' ? '中文' : 'EN'}
          </button>

          {/* User menu */}
          <Link to="/login" className="hidden lg:flex text-primary-foreground/80 hover:text-primary-foreground transition-colors" title={locale === 'zh' ? '登录/注册' : 'Login'}>
            <User className="w-5 h-5" />
          </Link>

          <button onClick={() => setCartOpen(true)} className="relative text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-body font-semibold">
                {cartCount}
              </span>
            )}
          </button>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-primary-foreground">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden bg-primary/95 backdrop-blur-md border-t border-primary-foreground/10 px-6 py-6 space-y-4">
          {mobileLinks.map(link => (
            link.href.startsWith('#') || link.href.startsWith('/#') ? (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block text-primary-foreground/80 hover:text-primary-foreground text-sm tracking-wider font-body uppercase">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
                className="block text-primary-foreground/80 hover:text-primary-foreground text-sm tracking-wider font-body uppercase">
                {link.label}
              </Link>
            )
          ))}
        </div>
      )}
    </header>
  );
}
