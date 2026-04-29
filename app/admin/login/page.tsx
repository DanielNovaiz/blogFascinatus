'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Credenciais inválidas');
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch (err) {
      setError('Erro ao conectar. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-100">
      <div className="w-full max-w-md">
        <div className="bg-ivory-50 rounded-2xl shadow-lg border border-beige-200 p-8">
          <h1 className="text-2xl font-semibold mb-2 text-center text-earth-800">Admin</h1>
          <p className="text-earth-600 text-center mb-6 text-sm">
            Faça login para gerenciar o blogFascinatus
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-earth-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-beige-300 rounded-xl bg-ivory-50 text-earth-900 focus:outline-none focus:ring-2 focus:ring-peach-200 focus:border-peach-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-earth-700">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-beige-300 rounded-xl bg-ivory-50 text-earth-900 focus:outline-none focus:ring-2 focus:ring-peach-200 focus:border-peach-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-peach-50 border border-peach-200 text-peach-700 px-3 py-2 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-peach-600 text-white py-3 rounded-xl font-semibold hover:bg-peach-700 disabled:bg-beige-400 transition-all duration-300"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
