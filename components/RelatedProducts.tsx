import Link from 'next/link';
import { getRelatedProducts } from '@/lib/actions/semantic-search';

interface Props {
  productId: string;
}

export default async function RelatedProducts({ productId }: Props) {
  const products = await getRelatedProducts(productId, 4);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Você também pode gostar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={`/produtos/${product.id}`} className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gray-100 overflow-hidden">
              {product.images[0] ? (
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
              ) : null}
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-1">{product.category}</p>
              <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
              <p className="mt-2 text-green-600 font-bold">R$ {product.price.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}