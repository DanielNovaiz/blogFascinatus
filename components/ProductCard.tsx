import Link from 'next/link';
import { ProductCard as ProductCardType } from '@/types/product';

interface Props {
  product: ProductCardType;
}

export default function ProductCard({ product }: Props) {
  const imageUrl = product.images[0] || '/placeholder.jpg';

  return (
    <Link href={`/produtos/${product.id}`} className="group">
      <div className="bg-ivory-50 border border-beige-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-beige-200/50 hover:border-peach-200 transition-all duration-300 cursor-pointer">
        {/* Imagem com overlay sutil no hover */}
        <div className="w-full h-56 bg-beige-100 overflow-hidden relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-earth-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-earth-800 group-hover:text-peach-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-mint-700 mb-3 uppercase tracking-wide text-xs font-medium">
            {product.category}
          </p>
          <p className="text-xl font-bold text-peach-600">
            R$ {product.price.toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}
