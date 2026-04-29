'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen bg-beige-100">
            <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-8 max-w-md text-center">
              <h2 className="text-xl font-semibold text-earth-800 mb-2">Algo deu errado</h2>
              <p className="text-earth-600 mb-4">
                Ocorreu um erro ao carregar esta página. Por favor, tente novamente.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-peach-600 text-white px-6 py-2 rounded-xl hover:bg-peach-700 transition-colors"
              >
                Recarregar
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
