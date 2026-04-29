'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllNegotiations, getNegotiationsByStatus } from '@/lib/actions/admin/negotiations';

interface PriceNegotiation {
  id: string;
  product_id: string;
  product_name: string;
  customer_email: string;
  original_price: number;
  proposed_price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  created_at: string;
  counter_price?: number;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  rejected: 'Rejeitado',
  countered: 'Contraproposta',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-peach-100 text-peach-700',
  accepted: 'bg-mint-100 text-mint-700',
  rejected: 'bg-red-100 text-red-700',
  countered: 'bg-sky-100 text-sky-700',
};

export default function AdminNegotiationsPage() {
  const router = useRouter();
  const [negotiations, setNegotiations] = useState<PriceNegotiation[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'countered'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNegotiations();
  }, [filter]);

  const loadNegotiations = async () => {
    setLoading(true);
    const data = filter === 'all' 
      ? await getAllNegotiations()
      : await getNegotiationsByStatus(filter as any);
    setNegotiations(data || []);
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateDiscount = (original: number, proposed: number) => {
    return ((original - proposed) / original * 100).toFixed(1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-earth-800 mb-2">Negociações de Preço</h1>
        <p className="text-earth-600">Gerenciar solicitações de negociação de clientes</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'all' ? 'bg-peach-600 text-white' : 'bg-beige-200 text-earth-700 hover:bg-beige-300'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'pending' ? 'bg-peach-600 text-white' : 'bg-beige-200 text-earth-700 hover:bg-beige-300'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'accepted' ? 'bg-peach-600 text-white' : 'bg-beige-200 text-earth-700 hover:bg-beige-300'
          }`}
        >
          Aceitas
        </button>
        <button
          onClick={() => setFilter('countered')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'countered' ? 'bg-peach-600 text-white' : 'bg-beige-200 text-earth-700 hover:bg-beige-300'
          }`}
        >
          Contrapropostas
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'rejected' ? 'bg-peach-600 text-white' : 'bg-beige-200 text-earth-700 hover:bg-beige-300'
          }`}
        >
          Rejeitadas
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-earth-600">Carregando...</div>
        </div>
      ) : negotiations.length === 0 ? (
        <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-8 text-center text-earth-500">
          Nenhuma negociação encontrada.
        </div>
      ) : (
        <div className="grid gap-4">
          {negotiations.map((negotiation) => (
            <div
              key={negotiation.id}
              onClick={() => router.push(`/admin/negociacoes/${negotiation.id}`)}
              className="bg-ivory-50 border border-beige-200 rounded-2xl p-6 hover:border-peach-400 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-earth-800">{negotiation.product_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[negotiation.status]}`}>
                      {STATUS_LABELS[negotiation.status]}
                    </span>
                  </div>
                  <p className="text-sm text-earth-600 mb-3">{negotiation.customer_email}</p>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-earth-500">Preço Original:</span>
                      <span className="text-earth-900 font-medium ml-2">{formatCurrency(negotiation.original_price)}</span>
                    </div>
                    <div>
                      <span className="text-earth-500">Proposta:</span>
                      <span className="text-peach-600 font-semibold ml-2">{formatCurrency(negotiation.proposed_price)}</span>
                    </div>
                    <div>
                      <span className="text-earth-500">Desconto:</span>
                      <span className="text-forest-600 font-semibold ml-2">
                        {calculateDiscount(negotiation.original_price, negotiation.proposed_price)}%
                      </span>
                    </div>
                  </div>
                  {negotiation.counter_price && (
                    <div className="mt-2">
                      <span className="text-earth-500 text-sm">Contraproposta: </span>
                      <span className="text-sky-600 font-semibold">{formatCurrency(negotiation.counter_price)}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-earth-500">
                    {new Date(negotiation.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
