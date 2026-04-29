'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/lib/use-cart';
import { supabase } from '@/lib/supabase';
import { createCheckoutSession } from '@/lib/actions/stripe';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function CheckoutPage() {
  const { items } = useCart();
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
      setCheckoutItems([]);
      setTotal(0);
      setError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    const productIds = items.map((item) => item.productId);

    supabase
      .from('products')
      .select('id, name, price, stock')
      .in('id', productIds)
      .eq('active', true)
      .then(({ data, error }) => {
        if (cancelled) {
          return;
        }

        if (error || !data) {
          setError('Erro ao carregar produtos');
          setLoading(false);
          return;
        }

        // Mantém apenas o espelho visual; a validação real acontece no server action.
        const validItems: CheckoutItem[] = [];
        let totalPrice = 0;
        let missingItems = 0;
        let nextError = '';

        data.forEach((product) => {
          const cartItem = items.find((item) => item.productId === product.id);
          if (cartItem) {
            if (cartItem.qty > product.stock) {
              nextError =
                `${product.name} tem apenas ${product.stock} em estoque, mas você tem ${cartItem.qty} no carrinho.`
              return;
            }

            validItems.push({
              id: product.id,
              name: product.name,
              price: product.price,
              qty: cartItem.qty,
            });

            totalPrice += product.price * cartItem.qty;
          }
        });

        missingItems = items.length - validItems.length;

        setCheckoutItems(validItems);
        setTotal(totalPrice);
        setLoading(false);

        if (!nextError && missingItems > 0) {
          nextError = 'Alguns itens do carrinho não estão mais disponíveis.';
        }

        if (nextError) {
          setError(nextError);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [items]);

  const cartPayload = useMemo(
    () =>
      checkoutItems.map((item) => ({
        productId: item.id,
        qty: item.qty,
      })),
    [checkoutItems]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email obrigatório');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const checkoutUrl = await createCheckoutSession({
        items: cartPayload,
        customerEmail: email,
      });

      window.location.assign(checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error ? checkoutError.message : 'Erro ao iniciar pagamento'
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Seu carrinho está vazio.</p>
        <a href="/produtos" className="text-blue-600 hover:underline">
          Continuar Comprando
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Resumo do Pedido */}
      <div>
        <h1 className="text-3xl font-bold mb-6">Resumo do Pedido</h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          {checkoutItems.map((item) => (
            <div key={item.id} className="flex justify-between mb-4 pb-4 border-b border-gray-100">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">Qtd: {item.qty}</p>
              </div>
              <p className="font-semibold">R$ {(item.price * item.qty).toFixed(2)}</p>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 text-lg font-bold">
            <span>Total:</span>
            <span className="text-green-600">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <a
          href="/produtos"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Continuar Comprando
        </a>
      </div>

      {/* Formulário de Checkout */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Dados de Entrega</h2>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <p className="text-xs text-gray-500 mb-4">
            💳 Pagamento seguro via Stripe Checkout.
          </p>

          <button
            type="submit"
            disabled={processing || checkoutItems.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {processing ? 'Redirecionando...' : 'Continuar para Pagamento'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Seus dados estão seguros. O cartão é processado diretamente pela Stripe.
          </p>
        </form>
      </div>
    </div>
  );
}
