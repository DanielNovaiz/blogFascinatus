import { supabase } from '@/lib/supabase';
import { AddToCartButton } from '@/components/AddToCartButton';
import RelatedProducts from '@/components/RelatedProducts';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('active', true);

  return (products || []).map((product) => ({
    slug: product.id,
  }));
}

export const revalidate = 60;

export default async function ProdutoDetalhePage({ params }: Props) {
  const slug = await params.then(p => p.slug);
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', slug)
    .eq('active', true)
    .single();

  if (error || !product) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
        <a href="/produtos" className="text-blue-600 hover:underline">
          Voltar para produtos
        </a>
      </div>
    );
  }

  return (
    <div>
      <a href="/produtos" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Voltar
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galeria de Imagens */}
        <div>
          {product.images && product.images.length > 0 ? (
            <div>
              <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden h-96">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img: string, i: number) => (
                    <div key={i} className="bg-gray-100 rounded-lg overflow-hidden h-20">
                      <img
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center text-gray-400">
              Sem imagem
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.category}</p>

          <div className="mb-6">
            <p className="text-4xl font-bold text-green-600 mb-2">
              R$ {product.price.toFixed(2)}
            </p>
            <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
            </p>
          </div>

          {product.description && (
            <div className="mb-8">
              <h2 className="font-semibold mb-3">Descrição</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          <AddToCartButton productId={product.id} stock={product.stock} />
        </div>
      </div>

      <RelatedProducts productId={product.id} />
    </div>
  );
}
