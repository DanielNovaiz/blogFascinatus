import { supabase } from '@/lib/supabase';

type FeaturedProductRow = {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
};

export async function getFeaturedProducts(limit: number = 4) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, images')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return ((data ?? []) as FeaturedProductRow[]).map((product) => ({
    ...product,
    image_url: product.images?.[0] ?? null,
  }));
}
