'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/use-cart';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';

interface CartProduct extends Product {
  qty: number;
}

export function CartDrawer() {
  const { items, removeItem, updateQty, clearCart, itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!open || items.length === 0) return;

    setLoading(true);
    const productIds = items.map((item) => item.productId);

    supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .then(({ data, error }) => {
        if (!error && data) {
          const withQty = data.map((product) => ({
            ...product,
            qty: items.find((item) => item.productId === product.id)?.qty || 0,
          }));
          setProducts(withQty);

          const totalPrice = withQty.reduce((sum, product) => sum + product.price * product.qty, 0);
          setTotal(totalPrice);
        }
        setLoading(false);
      });
  }, [open, items]);

  return (
    <>
      {/* Botão para abrir drawer */}
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 text-earth-700 hover:text-peach-600 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0l2-9m0 0h2.71c.897 0 1.72-.447 2.211-1.007a1.007 1.007 0 001.146-1.455L19.754 5H9"
          />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-peach-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-earth-900/30 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-ivory-100 shadow-2xl shadow-earth-900/20 transform transition-transform duration-300 z-50 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-beige-200 bg-beige-100/50">
          <h2 className="text-xl font-semibold text-earth-800">Carrinho</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-beige-600 hover:text-earth-700 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Itens */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-earth-500">Carregando...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-earth-500 mb-4">Seu carrinho está vazio</p>
              <p className="text-sm text-mint-700">Explore nossos produtos artesanais</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex gap-4 border-b border-beige-200 pb-4">
                  {/* Imagem */}
                  <div className="w-20 h-20 bg-beige-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-beige-200" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2 text-earth-800">{product.name}</h3>
                    <p className="text-sm text-peach-600 mt-1 font-medium">
                      R$ {product.price.toFixed(2)}
                    </p>

                    {/* Qty Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(product.id, product.qty - 1)}
                        className="px-2 py-1 border border-beige-300 rounded hover:bg-beige-100 transition-colors text-earth-600"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-earth-800">{product.qty}</span>
                      <button
                        onClick={() => updateQty(product.id, product.qty + 1)}
                        className="px-2 py-1 border border-beige-300 rounded hover:bg-beige-100 transition-colors text-earth-600"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="ml-auto text-peach-600 text-xs hover:text-peach-800 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-beige-200 p-6 space-y-4 bg-beige-100/30">
            <div className="flex justify-between items-center text-lg font-semibold text-earth-800">
              <span>Total:</span>
              <span className="text-peach-700">R$ {total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-full bg-peach-600 text-white py-3 rounded-xl font-semibold hover:bg-peach-700 transition-colors shadow-md shadow-peach-200"
            >
              <Link href="/checkout">Finalizar Compra</Link>
            </button>

            <button
              onClick={() => {
                clearCart();
                setOpen(false);
              }}
              className="w-full text-earth-600 hover:text-earth-800 text-sm transition-colors"
            >
              Limpar Carrinho
            </button>
          </div>
        )}
      </div>
    </>
  );
}
