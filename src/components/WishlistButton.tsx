import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';

interface Props {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = '' }: Props) {
  const { user } = useAuth();
  const { locale } = useApp();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data));
  }, [user, productId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info(locale === 'zh' ? '请先登录' : 'Please log in first');
      return;
    }
    setLoading(true);
    if (liked) {
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
      setLiked(false);
    } else {
      await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
      setLiked(true);
      toast.success(locale === 'zh' ? '已加入收藏' : 'Added to wishlist');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
        liked ? 'border-destructive/30 text-destructive bg-destructive/5' : 'border-border text-muted-foreground hover:text-destructive hover:border-destructive/30'
      } ${className}`}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
    </button>
  );
}
