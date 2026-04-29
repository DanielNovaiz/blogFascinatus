'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getNegotiation, updateNegotiationStatus } from '@/lib/actions/admin/negotiations';

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
  admin_response?: string;
  expires_at?: string;
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

const TRANSITIONS: Record<string, string[]> = {
  pending: ['accepted', 'rejected', 'countered'],
  countered: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
};

export default function NegotiationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [negotiation, setNegotiation] = useState<PriceNegotiation | null>(null);
  const [loading, setLoading] = useState(true);
  const [counterPrice, setCounterPrice] = useState('');
  const [adminResponse, setAdminResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadNegotiation();
  }, [params.id]);

  const loadNegotiation = async () => {
    setLoading(true);
    const data = await getNegotiation(params.id as string);
    setNegotiation(data);
    if (data?.counter_price) {
      setCounterPrice(data.counter_price.toString());
    }
    if (data?.admin_response) {
      setAdminResponse(data.admin_response);
    }
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!negotiation) return;

    setSubmitting(true);
    const counterPriceNum = newStatus === 'countered' ? parseFloat(counterPrice) : undefined;
    const response = adminResponse || undefined;

    try {
      await updateNegotiationStatus(
        negotiation.id,
        newStatus as any,
        response,
        counterPriceNum
      );
      loadNegotiation();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }

    setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-earth-600">Carregando...</div>
      </div>
    );
  }

  if (!negotiation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-earth-600">Negociação não encontrada</div>
      </div>
    );
  }

  const availableTransitions = TRANSITIONS[negotiation.status] || [];

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
          <h1 className="text-3xl font-semibold text-earth-800">Detalhes da Negociação</h1>
          <p className="text-earth-600 mt-2">ID: {negotiation.id}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[negotiation.status]}`}>
          {STATUS_LABELS[negotiation.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-earth-800 mb-4">Informações do Produto</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-earth-600">Produto:</span>
              <p className="text-earth-900 font-medium">{negotiation.product_name}</p>
            </div>
            <div>
              <span className="text-sm text-earth-600">Preço Original:</span>
              <p className="text-earth-900 font-medium">{formatCurrency(negotiation.original_price)}</p>
            </div>
          </div>
        </div>

        <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-earth-800 mb-4">Informações do Cliente</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-earth-600">Email:</span>
              <p className="text-earth-900 font-medium">{negotiation.customer_email}</p>
            </div>
            <div>
              <span className="text-sm text-earth-600">Data da Solicitação:</span>
              <p className="text-earth-900 font-medium">
                {new Date(negotiation.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
            {negotiation.expires_at && (
              <div>
                <span className="text-sm text-earth-600">Expira em:</span>
                <p className="text-earth-900 font-medium">
                  {new Date(negotiation.expires_at).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-earth-800 mb-4">Proposta de Preço</h2>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <div>
            <span className="text-sm text-earth-600 block mb-1">Preço Original</span>
            <p className="text-2xl font-bold text-earth-900">{formatCurrency(negotiation.original_price)}</p>
          </div>
          <div>
            <span className="text-sm text-earth-600 block mb-1">Proposta do Cliente</span>
            <p className="text-2xl font-bold text-peach-600">{formatCurrency(negotiation.proposed_price)}</p>
          </div>
          <div>
            <span className="text-sm text-earth-600 block mb-1">Desconto Solicitado</span>
            <p className="text-2xl font-bold text-forest-600">
              {calculateDiscount(negotiation.original_price, negotiation.proposed_price)}%
            </p>
          </div>
        </div>

        {negotiation.counter_price && (
          <div className="border-t border-beige-300 pt-4">
            <span className="text-sm text-earth-600 block mb-1">Sua Contraproposta</span>
            <p className="text-2xl font-bold text-sky-600">{formatCurrency(negotiation.counter_price)}</p>
          </div>
        )}
      </div>

      {negotiation.admin_response && (
        <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-earth-800 mb-4">Sua Resposta</h2>
          <p className="text-earth-700">{negotiation.admin_response}</p>
        </div>
      )}

      {availableTransitions.length > 0 && (
        <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-earth-800 mb-4">Ações</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-earth-700 mb-2">
              Resposta para o cliente (opcional)
            </label>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Adicione uma mensagem para o cliente..."
              rows={3}
              className="w-full px-4 py-3 border border-beige-300 rounded-xl bg-white text-earth-900 focus:outline-none focus:border-peach-500"
            />
          </div>

          {availableTransitions.includes('countered') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Contraproposta (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                placeholder="Digite o preço da contraproposta"
                className="w-full px-4 py-3 border border-beige-300 rounded-xl bg-white text-earth-900 focus:outline-none focus:border-peach-500"
              />
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            {availableTransitions.includes('accepted') && (
              <button
                onClick={() => handleStatusChange('accepted')}
                disabled={submitting}
                className="px-6 py-3 bg-mint-600 text-white rounded-xl font-semibold hover:bg-mint-700 disabled:bg-beige-400 transition-all"
              >
                Aceitar Proposta
              </button>
            )}
            {availableTransitions.includes('rejected') && (
              <button
                onClick={() => handleStatusChange('rejected')}
                disabled={submitting}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:bg-beige-400 transition-all"
              >
                Rejeitar Proposta
              </button>
            )}
            {availableTransitions.includes('countered') && (
              <button
                onClick={() => handleStatusChange('countered')}
                disabled={submitting || !counterPrice}
                className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 disabled:bg-beige-400 transition-all"
              >
                Enviar Contraproposta
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
