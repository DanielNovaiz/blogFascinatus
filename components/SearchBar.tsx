'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { searchProducts, type SemanticProductResult } from '@/lib/actions/semantic-search';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SemanticProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    let cancelled = false;

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = window.setTimeout(() => {
      searchProducts(trimmed)
        .then((items) => {
          if (!cancelled) {
            setResults(items);
            setOpen(true);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setResults([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-full border border-beige-300 bg-ivory-50 px-4 py-2 shadow-sm focus-within:border-lilac-400 focus-within:shadow-lilac-100 transition-all">
        <svg className="h-4 w-4 text-beige-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m1.85-5.15A7.5 7.5 0 1 1 6 6a7.5 7.5 0 0 1 12.5 5.5Z" />
        </svg>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar produtos..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-beige-500 text-earth-700"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-beige-200 bg-ivory-50 shadow-xl shadow-earth-900/10">
          <div className="border-b border-beige-100 px-4 py-3 text-xs uppercase tracking-wide text-mint-700 font-medium">
            {loading ? 'Buscando...' : results.length > 0 ? 'Resultados' : 'Sem resultados'}
          </div>

          {results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/produtos/${product.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-beige-100 transition-colors"
                >
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-beige-100">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-earth-800">{product.name}</p>
                    <p className="text-xs text-mint-700">{product.category}</p>
                  </div>
                  <p className="text-sm font-semibold text-peach-600">R$ {product.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          ) : (
            !loading && <div className="px-4 py-4 text-sm text-earth-500">Tente outro termo de busca.</div>
          )}
        </div>
      )}
    </div>
  );
}