'use client';

import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/actions/orders';

interface Order {
  id: string;
  customer_email: string;
  items: any;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'done';
  created_at: string;
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

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    getOrders(filter || undefined).then(setOrders);
  }, [filter]);

  const handleStatusChange = async (orderId: string, currentStatus: string) => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === STATUS_ORDER.length - 1) return;

    const nextStatus = STATUS_ORDER[currentIndex + 1];
    const result = await updateOrderStatus(orderId, nextStatus);

    if (!result.error) {
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o))
      );
    } else {
      alert('Erro: ' + result.error);
    }
  };

  const handleFilterChange = async (newFilter: string) => {
    setFilter(newFilter);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-earth-800 mb-2">Pedidos</h1>
        <p className="text-earth-600">Gerenciar pedidos de clientes</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleFilterChange('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === '' ? 'bg-peach-600 text-white' : 'bg-beige-200 text-earth-700 hover:bg-beige-300'
          }`}
        >
          Todos
        </button>
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === status ? 'bg-peach-600 text-white' : 'bg-beige-200 text-earth-700 hover:bg-beige-300'
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      <div className="bg-ivory-50 border border-beige-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-earth-900 text-ivory-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Itens</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Total</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Data</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Ação</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-beige-200 hover:bg-beige-100 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-earth-600">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm text-earth-800">{order.customer_email}</td>
                <td className="px-6 py-4 text-sm text-earth-600">
                  {Array.isArray(order.items) ? order.items.length : 0} item(ns)
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-peach-600">
                  R$ {order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-earth-600">
                  {new Date(order.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  {order.status !== 'done' && (
                    <button
                      onClick={() => handleStatusChange(order.id, order.status)}
                      className="text-forest-600 hover:text-forest-800 text-sm font-medium transition-colors"
                    >
                      Avançar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="px-6 py-8 text-center text-earth-500">
            Nenhum pedido encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
