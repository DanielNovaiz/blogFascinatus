import Link from 'next/link';

export default function CheckoutCanceledPage() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="text-6xl mb-4">↩</div>
      <h1 className="text-3xl font-bold mb-3">Pagamento cancelado</h1>
      <p className="text-gray-600 mb-8">
        Nenhum valor foi cobrado. Você pode voltar ao carrinho e tentar novamente quando quiser.
      </p>

      <div className="flex gap-4 justify-center">
        <Link
          href="/checkout"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Voltar ao Checkout
        </Link>
        <Link
          href="/produtos"
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          Continuar Comprando
        </Link>
      </div>
    </div>
  );
}