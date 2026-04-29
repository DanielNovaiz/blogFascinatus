'use client';

import { useState, useEffect } from 'react';
import { getAllChats } from '@/lib/actions/admin/chat';
import { useRouter } from 'next/navigation';

interface SupportChat {
  id: string;
  customer_email: string;
  customer_name?: string;
  status: 'open' | 'closed';
  created_at: string;
  last_message?: string;
  last_message_at?: string;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  closed: 'Fechado',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-peach-100 text-peach-700',
  closed: 'bg-mint-100 text-mint-700',
};

export default function AdminChatPage() {
  const router = useRouter();
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, [filter]);

  const loadChats = async () => {
    setLoading(true);
    const data = await getAllChats();
    const filtered = filter === 'all' 
      ? data 
      : data.filter((chat: SupportChat) => chat.status === filter);
    setChats(filtered);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-earth-800 mb-2">Chat de Suporte</h1>
        <p className="text-earth-600">Gerenciar conversas com clientes</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'all' ? 'bg-peach-600 text-white' : 'bg-beige-200 text-earth-700 hover:bg-beige-300'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'open' ? 'bg-peach-600 text-white' : 'bg-beige-200 text-earth-700 hover:bg-beige-300'
          }`}
        >
          Abertos
        </button>
        <button
          onClick={() => setFilter('closed')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'closed' ? 'bg-peach-600 text-white' : 'bg-beige-200 text-earth-700 hover:bg-beige-300'
          }`}
        >
          Fechados
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-earth-600">Carregando...</div>
        </div>
      ) : chats.length === 0 ? (
        <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-8 text-center text-earth-500">
          Nenhum chat encontrado.
        </div>
      ) : (
        <div className="grid gap-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => router.push(`/admin/chat/${chat.id}`)}
              className="bg-ivory-50 border border-beige-200 rounded-2xl p-6 hover:border-peach-400 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-earth-800">
                      {chat.customer_name || chat.customer_email}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[chat.status]}`}>
                      {STATUS_LABELS[chat.status]}
                    </span>
                  </div>
                  <p className="text-sm text-earth-600 mb-1">{chat.customer_email}</p>
                  {chat.last_message && (
                    <p className="text-sm text-earth-700 line-clamp-1">{chat.last_message}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-earth-500">
                    {chat.last_message_at
                      ? new Date(chat.last_message_at).toLocaleString('pt-BR')
                      : new Date(chat.created_at).toLocaleString('pt-BR')}
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
