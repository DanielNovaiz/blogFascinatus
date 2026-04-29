'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AdminPage() {
  return (
    <ErrorBoundary>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Bem-vindo ao Admin</h2>
        <p className="mt-2 text-sm text-slate-600">
          Estrutura inicial pronta. Adicione novas rotas em /app/admin para expandir o painel.
        </p>
      </section>
    </ErrorBoundary>
  );
}
