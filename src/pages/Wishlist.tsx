import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { Heart, ShoppingBag } from 'lucide-react';
import { dbToLegacyProduct, type DbProduct } from '@/hooks/useProducts';

export default function WishlistPage() {
  const { locale, currency, fp, addToCart } = useApp();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('wishlist')
        .select('product_id, products(*)')
        .eq('user_id', user.id);
      if (data) {
        setProducts(data.map((w: any) => dbToLegacyProduct(w.products as DbProduct)));
      }
      setLoading(false);
    })();
  }, [user]);

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <CartDrawer />
      <div className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-6">
          <h1 className="font-display text-3xl mb-8 text-center">
            {locale === 'zh' ? '我的收藏' : 'My Wishlist'}
          </h1>

          {!user ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body mb-4">
                {locale === 'zh' ? '请登录以查看收藏' : 'Please log in to view your wishlist'}
              </p>
              <Link to="/login" className="text-gold hover:underline font-body">
                {locale === 'zh' ? '去登录' : 'Log In'}
              </Link>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-body mb-4">
                {locale === 'zh' ? '收藏夹为空' : 'Your wishlist is empty'}
              </p>
              <Link to="/shop" className="text-gold hover:underline font-body">
                {locale === 'zh' ? '去选购' : 'Browse Products'}
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="group bg-card rounded-lg overflow-hidden border border-border hover:border-gold/30 transition-all">
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden">
                      <img src={product.image} alt={locale === 'zh' ? product.nameZh : product.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold mb-1">{locale === 'zh' ? product.nameZh : product.nameEn}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gold font-display text-xl font-semibold">{fp(product.prices[currency])}</span>
                      <div className="flex gap-2">
                        <button onClick={() => removeFromWishlist(product.id)} className="w-9 h-9 rounded-full border border-destructive/30 text-destructive flex items-center justify-center hover:bg-destructive/10">
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                        <button onClick={() => addToCart(product)} className="w-9 h-9 rounded-full bg-primary text-primary-foreground hover:bg-gold flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
