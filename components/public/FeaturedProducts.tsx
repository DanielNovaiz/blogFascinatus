import { getFeaturedProducts } from '@/lib/actions/public/products';
import Link from 'next/link';

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(4);

  if (!products || products.length === 0) {
    return null; // Don't render the section if there are no products
  }

  return (
    <section className="py-16 border-t border-beige-200">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-semibold text-earth-800">Produtos em Destaque</h2>
        <p className="text-lg text-earth-600 mt-2">
          Novidades e produtos selecionados especialmente para você.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link
            href={`/produtos/${product.id}`}
            key={product.id}
            className="group bg-ivory-50 rounded-2xl border border-beige-200 p-4 transition-all duration-300 hover:shadow-lg hover:border-peach-300"
          >
            <div className="relative w-full h-56 rounded-xl overflow-hidden mb-4">
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h3 className="text-lg font-semibold text-earth-800 mb-1 truncate">{product.name}</h3>
            <p className="text-peach-600 font-bold text-xl">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </p>
          </Link>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link
          href="/produtos"
          className="inline-flex items-center bg-peach-600 text-white px-8 py-4 rounded-xl hover:bg-peach-700 transition-all duration-300 shadow-lg shadow-peach-200 font-medium"
        >
          Ver Todos os Produtos
        </Link>
      </div>
    </section>
  );
}