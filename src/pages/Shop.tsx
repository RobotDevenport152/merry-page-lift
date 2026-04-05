import { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { type Product } from '@/lib/store';
import { useProducts } from '@/hooks/useProducts';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

type Category = 'all' | 'newborn' | 'duvet' | 'apparel' | 'vest' | 'scarf' | 'sweater';
type SortKey = 'featured' | 'priceLow' | 'priceHigh' | 'name';

export default function ShopPage() {
  const { t, locale, currency, fp, addToCart } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [category, setCategory] = useState<Category>((searchParams.get('cat') as Category) || 'all');
  const [sort, setSort] = useState<SortKey>('featured');

  const { data: dbProducts, isLoading } = useProducts();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      const params: Record<string, string> = {};
      if (search) params.q = search;
      if (category !== 'all') params.cat = category;
      setSearchParams(params, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, setSearchParams]);

  const filtered = useMemo(() => {
    if (!dbProducts) return [];
    let list = [...dbProducts].filter(p => {
      const name = locale === 'zh' ? p.nameZh : p.nameEn;
      const desc = locale === 'zh' ? p.descZh : p.descEn;
      const q = debouncedSearch.toLowerCase();
      const matchSearch = !q || name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      const matchCat = category === 'all' || p.category === category;
      return matchSearch && matchCat;
    });

    switch (sort) {
      case 'priceLow': list.sort((a, b) => a.prices[currency] - b.prices[currency]); break;
      case 'priceHigh': list.sort((a, b) => b.prices[currency] - a.prices[currency]); break;
      case 'name': list.sort((a, b) => (locale === 'zh' ? a.nameZh : a.nameEn).localeCompare(locale === 'zh' ? b.nameZh : b.nameEn)); break;
      default: list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }

    list.sort((a, b) => (a.stock <= 0 ? 1 : 0) - (b.stock <= 0 ? 1 : 0));
    return list;
  }, [dbProducts, debouncedSearch, category, sort, locale, currency]);

  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: t.products.filter.all },
    { key: 'newborn', label: locale === 'zh' ? '初生系列' : 'Newborn' },
    { key: 'duvet', label: locale === 'zh' ? '羊驼被' : 'Duvets' },
    { key: 'apparel', label: locale === 'zh' ? '大衣' : 'Coats' },
    { key: 'vest', label: locale === 'zh' ? '马甲' : 'Vests' },
    { key: 'scarf', label: locale === 'zh' ? '围巾' : 'Scarves' },
    { key: 'sweater', label: locale === 'zh' ? '毛衣' : 'Sweaters' },
  ];

  const sorts: { key: SortKey; label: string }[] = [
    { key: 'featured', label: t.products.sort.featured },
    { key: 'priceLow', label: t.products.sort.priceLow },
    { key: 'priceHigh', label: t.products.sort.priceHigh },
    { key: 'name', label: t.products.sort.name },
  ];

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.info(locale === 'zh' ? '该产品暂时缺货' : 'This product is out of stock.');
      return;
    }
    addToCart(product);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={locale === 'zh' ? '产品展示 — 太平洋羊驼' : 'Shop — Pacific Alpacas'}
        description={locale === 'zh' ? '探索我们的羊驼纤维奢华产品系列' : 'Explore our luxury alpaca fiber collections'}
      />
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-body">{t.products.badge}</span>
            <h1 className="font-display text-4xl md:text-5xl mt-4">{t.products.title}</h1>
          </div>

          {/* Gift Recommendation Banner */}
          <div className="mb-8 bg-gold/5 border border-gold/20 rounded-lg p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-display text-lg font-semibold">{locale === 'zh' ? '🎁 为亲友挑选礼物？' : '🎁 Shopping for a gift?'}</p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  {locale === 'zh' ? '礼品购买客单价通常更高，退货率更低。我们来帮你选。' : 'Let us help you find the perfect gift.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  { labelZh: '送父母长辈', labelEn: 'For Parents', cat: 'duvet-premium' },
                  { labelZh: '送伴侣', labelEn: 'For Partner', cat: 'duvet-luxury' },
                  { labelZh: '送商务客户', labelEn: 'For Clients', cat: 'duvet-classic' },
                  { labelZh: '送新生儿家庭', labelEn: 'For Newborn', cat: 'duvet-newborn' },
                ] as const).map(opt => (
                  <Link
                    key={opt.cat}
                    to={`/product/${opt.cat}`}
                    className="px-3 py-1.5 bg-background border border-border rounded-sm text-xs font-body hover:border-gold hover:text-gold transition-colors whitespace-nowrap"
                  >
                    {locale === 'zh' ? opt.labelZh : opt.labelEn}
                  </Link>
                ))}
              </div>
              <Link to="/compare" className="text-xs font-body text-gold hover:underline whitespace-nowrap flex-shrink-0">
                {locale === 'zh' ? '查看系列对比 →' : 'Compare tiers →'}
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.nav.search}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-border rounded bg-background font-body text-sm focus:outline-none focus:border-gold transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-body">✕</button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(c => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`px-4 py-2 rounded text-sm font-body transition-colors ${
                    category === c.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)} className="px-4 py-2 border border-border rounded font-body text-sm bg-background cursor-pointer">
              {sorts.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden border border-border animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-6 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(product => {
                const outOfStock = product.stock <= 0;
                return (
                  <div key={product.id} className={`group bg-card rounded-lg overflow-hidden border border-border hover:border-gold/30 hover:shadow-lg transition-all ${outOfStock ? 'opacity-70' : ''}`}>
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="relative aspect-square overflow-hidden">
                        <img src={product.image} alt={locale === 'zh' ? product.nameZh : product.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        {product.badge && !outOfStock && (
                          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] px-3 py-1 rounded-full font-body font-semibold tracking-wider uppercase">{product.badge}</span>
                        )}
                        {outOfStock && (
                          <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                            <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-sm text-sm font-body font-semibold">{locale === 'zh' ? '缺货' : 'Out of Stock'}</span>
                          </div>
                        )}
                        {!outOfStock && product.stock < 10 && (
                          <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] px-2 py-1 rounded-full font-body">
                            {locale === 'zh' ? `仅剩${product.stock}件` : `Only ${product.stock} left`}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-5">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-display text-lg font-semibold mb-1 hover:text-gold transition-colors">{locale === 'zh' ? product.nameZh : product.nameEn}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground font-body mb-3 line-clamp-2">{locale === 'zh' ? product.descZh : product.descEn}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gold font-display text-xl font-semibold">{fp(product.prices[currency])}</span>
                        <button
                          onClick={e => { e.stopPropagation(); handleAddToCart(product); }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${outOfStock ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-gold'}`}
                          disabled={outOfStock}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-body mb-4">{locale === 'zh' ? '未找到匹配的产品' : 'No products found'}</p>
              <button onClick={() => { setSearch(''); setCategory('all'); }} className="text-gold hover:underline font-body text-sm">{locale === 'zh' ? '清除搜索' : 'Clear search'}</button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
