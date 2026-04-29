'use client';

import { useState } from 'react';
import { useCart } from '@/lib/use-cart';

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  className?: string;
}

export function AddToCartButton({ productId, stock, className = '' }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(productId, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center border border-beige-300 rounded-lg bg-ivory-50 shadow-sm">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="px-3 py-2 hover:bg-beige-100 text-earth-600 transition-colors rounded-l-lg"
          >
            −
          </button>
          <span className="px-4 py-2 border-l border-r border-beige-200 text-center min-w-12 font-medium text-earth-800">
            {qty}
          </span>
          <button
            onClick={() => setQty(Math.min(stock, qty + 1))}
            className="px-3 py-2 hover:bg-beige-100 text-earth-600 transition-colors rounded-r-lg disabled:opacity-50"
            disabled={qty >= stock}
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={stock === 0}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm ${
          added
            ? 'bg-forest-600 text-white shadow-forest-200'
            : stock === 0
              ? 'bg-beige-300 text-earth-500 cursor-not-allowed'
              : 'bg-peach-600 text-white hover:bg-peach-700 shadow-peach-200 hover:shadow-md'
        }`}
      >
        {added ? '✓ Adicionado ao carrinho' : stock === 0 ? 'Fora de estoque' : 'Adicionar ao Carrinho'}
      </button>
    </div>
  );
}
