import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';

interface Props {
  searchParams: Promise<{ cat?: string }>;
}

async function ProductsList({ category }: { category?: string }) {
  let query = supabase
    .from('products')
    .select('id, name, price, images, category')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return (
      <div className="text-center text-peach-700 bg-peach-50 rounded-xl p-8">
        Erro ao carregar produtos. Tente novamente mais tarde.
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center text-earth-600 bg-beige-100/50 rounded-xl p-12">
        {category
          ? `Nenhum produto encontrado na categoria "${category}".`
          : 'Nenhum produto disponível no momento.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

async function CategoriesList() {
  const { data: products } = await supabase
    .from('products')
    .select('category')
    .eq('active', true);

  const categories = [...new Set(products?.map((p) => p.category) || [])].sort();

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <a
        href="/produtos"
        className="px-4 py-2 border border-beige-300 rounded-xl hover:bg-beige-100 text-sm font-medium text-earth-700 transition-colors"
      >
        Todos
      </a>
      {categories.map((cat) => (
        <a
          key={cat}
          href={`/produtos?cat=${encodeURIComponent(cat)}`}
          className="px-4 py-2 border border-beige-300 rounded-xl hover:bg-beige-100 hover:border-lilac-300 text-sm font-medium text-earth-700 transition-colors"
        >
          {cat}
        </a>
      ))}
    </div>
  );
}

export const revalidate = 60; // ISR: revalidar a cada 60 segundos

export default async function ProdutosPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.cat;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <p className="text-mint-700 uppercase tracking-widest text-sm font-medium mb-2">
          Loja
        </p>
        <h1 className="text-4xl font-semibold text-earth-800 mb-4">Nossos Produtos</h1>
        <p className="text-earth-600 max-w-2xl">
          Cada item é cuidadosamente selecionado, priorizando ingredientes naturais 
          e processos artesanais sustentáveis.
        </p>
      </div>

      <Suspense fallback={<div className="text-earth-500">Carregando categorias...</div>}>
        <CategoriesList />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ProductsList category={category} />
      </Suspense>
    </div>
  );
}
