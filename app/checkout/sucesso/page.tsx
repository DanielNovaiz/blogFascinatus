 'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/use-cart';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Pagamento confirmado</h1>
        <p className="text-gray-600">Recebemos sua compra e estamos processando o pedido.</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-green-800 mb-4">Tudo certo</h2>
        <p className="text-sm text-gray-600 mb-3">
          O pedido será registrado em instantes após a confirmação do webhook.
        </p>
        {sessionId && (
          <p className="text-xs text-gray-500">
            Session ID: <span className="font-mono">{sessionId}</span>
          </p>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <p className="text-gray-600 text-center">
          Você receberá um email de confirmação assim que o pagamento for processado.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/produtos"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Continuar Comprando
          </Link>
          <Link
            href="/blog"
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Ler Blog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto text-center py-8">Carregando...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
