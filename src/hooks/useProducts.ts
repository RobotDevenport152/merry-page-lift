import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Currency } from '@/lib/store';

export interface DbProduct {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string;
  description_en: string | null;
  description_zh: string | null;
  category: string;
  image: string | null;
  images: string[] | null;
  price_nzd: number;
  price_cny: number;
  price_usd: number;
  variants: any;
  stock: number;
  rating: number | null;
  review_count: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  weight: string | null;
  fill_power: string | null;
  certifications: string[] | null;
}

// Convert DB product to legacy Product format for compatibility
export function dbToLegacyProduct(p: DbProduct) {
  return {
    id: p.id,
    nameEn: p.name_en,
    nameZh: p.name_zh,
    descEn: p.description_en || '',
    descZh: p.description_zh || '',
    category: p.category as any,
    prices: { NZD: Number(p.price_nzd), CNY: Number(p.price_cny), USD: Number(p.price_usd) } as Record<Currency, number>,
    image: p.image || '/placeholder.svg',
    badge: p.is_featured ? 'Featured' : undefined,
    variants: Array.isArray(p.variants)
      ? p.variants.map((v: any) => ({ label: v.name || v.label, value: v.name || v.value }))
      : undefined,
    stock: p.stock,
    featured: p.is_featured ?? false,
    slug: p.slug,
    rating: Number(p.rating) || 0,
    reviewCount: p.review_count || 0,
    weight: p.weight,
    fillPower: p.fill_power,
    certifications: p.certifications || [],
  };
}

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as DbProduct[]).map(dbToLegacyProduct);
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return dbToLegacyProduct(data as DbProduct);
    },
    enabled: !!id,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(6);
      if (error) throw error;
      return (data as DbProduct[]).map(dbToLegacyProduct);
    },
  });
}
