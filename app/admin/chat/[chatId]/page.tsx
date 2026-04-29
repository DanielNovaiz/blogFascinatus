'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getChat, sendMessage, markMessagesAsRead, updateChatStatus } from '@/lib/actions/admin/chat';
import { supabase } from '@/lib/supabase';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin';
  sender_id: string;
  message: string;
  created_at: string;
  is_read?: boolean;
}

interface SupportChat {
  id: string;
  customer_email: string;
  customer_name?: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  chat_messages: ChatMessage[];
  assigned_to?: string;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  closed: 'Fechado',
};

export default function ChatDetailPage() {
  const params = useParams();
  const [chat, setChat] = useState<SupportChat | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChat();
    subscribeToMessages();
    markMessagesAsRead(params.chatId as string);
  }, [params.chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.chat_messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = async () => {
    setLoading(true);
    const data = await getChat(params.chatId as string);
    setChat(data);
    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat:${params.chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${params.chatId}`,
        },
        () => loadChat()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chat) return;

    setSending(true);
    await sendMessage(chat.id, message, 'admin-id'); // TODO: Get actual admin ID
    setMessage('');
    setSending(false);
    loadChat();
  };

  const handleStatusChange = async (newStatus: 'open' | 'closed') => {
    if (!chat) return;
    await updateChatStatus(chat.id, newStatus);
    loadChat();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-earth-600">Carregando...</div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-earth-600">Chat não encontrado</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 h-[calc(100vh-200px)] flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold text-earth-800 mb-2">Chat de Suporte</h1>
            <p className="text-earth-600">
              {chat.customer_name || chat.customer_email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              chat.status === 'open' ? 'bg-peach-100 text-peach-700' : 'bg-mint-100 text-mint-700'
            }`}>
              {STATUS_LABELS[chat.status]}
            </span>
            {chat.status === 'open' ? (
              <button
                onClick={() => handleStatusChange('closed')}
                className="px-4 py-2 bg-forest-600 text-white rounded-xl text-sm font-medium hover:bg-forest-700 transition-all"
              >
                Fechar Chat
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('open')}
                className="px-4 py-2 bg-peach-600 text-white rounded-xl text-sm font-medium hover:bg-peach-700 transition-all"
              >
                Reabrir Chat
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 bg-ivory-50 border border-beige-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chat.chat_messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.sender === 'admin'
                      ? 'bg-peach-600 text-white rounded-br-sm'
                      : 'bg-white border border-beige-200 text-earth-900 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === 'admin' ? 'text-peach-200' : 'text-earth-500'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-beige-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={chat.status === 'closed' || sending}
                className="flex-1 px-4 py-3 border border-beige-300 rounded-xl bg-ivory-50 text-earth-900 focus:outline-none focus:border-peach-500 disabled:bg-beige-100 disabled:text-earth-400"
              />
              <button
                type="submit"
                disabled={!message.trim() || chat.status === 'closed' || sending}
                className="px-6 py-3 bg-forest-600 text-white rounded-xl font-semibold hover:bg-forest-700 disabled:bg-beige-400 transition-all"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
}
