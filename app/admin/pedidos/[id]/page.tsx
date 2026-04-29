'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderById, updateOrderStatus } from '@/lib/actions/orders';

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_email: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'done';
  created_at: string;
  shipping_address?: string;
}

const STATUS_ORDER = ['pending', 'paid', 'shipped', 'done'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  done: 'Entregue',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-peach-100 text-peach-700',
  paid: 'bg-forest-100 text-forest-700',
  shipped: 'bg-sky-100 text-sky-700',
  done: 'bg-mint-100 text-mint-700',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      getOrderById(params.id as string).then((result: { data: Order | null; error: string | null }) => {
        if (result.data) {
          setOrder(result.data);
        }
        setLoading(false);
      });
    }
  }, [params.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    
    const result = await updateOrderStatus(order.id, newStatus);
    if (!result.error) {
      setOrder({ ...order, status: newStatus as any });
    } else {
      alert('Erro: ' + result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-earth-600">Carregando...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-earth-600">Pedido não encontrado</div>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => router.back()}
            className="text-earth-600 hover:text-earth-800 mb-4 text-sm font-medium transition-colors"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-semibold text-earth-800">Detalhes do Pedido</h1>
          <p className="text-earth-600 mt-2">ID: {order.id}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-earth-800 mb-4">Informações do Cliente</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-earth-600">Email:</span>
              <p className="text-earth-900 font-medium">{order.customer_email}</p>
            </div>
            {order.shipping_address && (
              <div>
                <span className="text-sm text-earth-600">Endereço de Entrega:</span>
                <p className="text-earth-900 font-medium">{order.shipping_address}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-earth-600">Data do Pedido:</span>
              <p className="text-earth-900 font-medium">
                {new Date(order.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-earth-800 mb-4">Alterar Status</h2>
          <div className="space-y-2">
            {STATUS_ORDER.map((status, index) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={index > currentIndex + 1}
                className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                  order.status === status
                    ? 'bg-peach-600 text-white'
                    : index <= currentIndex
                    ? 'bg-forest-100 text-forest-700'
                    : 'bg-beige-200 text-earth-400 cursor-not-allowed'
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-earth-800 mb-4">Itens do Pedido</h2>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white border border-beige-200 rounded-xl p-4"
            >
              <div>
                <p className="text-earth-900 font-medium">{item.product_name}</p>
                <p className="text-sm text-earth-600">Qtd: {item.quantity}</p>
              </div>
              <p className="text-peach-600 font-semibold">
                R$ {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-beige-300 mt-4 pt-4 flex justify-between items-center">
          <span className="text-lg font-semibold text-earth-800">Total</span>
          <span className="text-2xl font-bold text-peach-600">R$ {order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
