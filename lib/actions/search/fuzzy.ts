'use server';

import { getAdminSupabaseClient } from '@/lib/admin/auth';

// Fuzzy search usando pg_trgm - Complexidade O(n log n)
// pg_trgm usa índices GIN para busca eficiente de substrings
export async function fuzzySearchProducts(query: string, limit = 20) {
  const supabase = await getAdminSupabaseClient();

  if (!query || query.length < 2) {
    return [];
  }

  // Usar %query% para busca de substring com pg_trgm
  // O índice GIN criado no schema otimiza essa operação
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(limit)
    .order('name');

  if (error) throw error;

  // Calcular similaridade (opcional, para ranking)
  const rankedResults = data?.map(product => {
    const similarity = calculateSimilarity(query, product.name);
    return { ...product, similarity };
  }).sort((a, b) => b.similarity - a.similarity) || [];

  return rankedResults;
}

// Algoritmo de similaridade Jaccard - O(n) onde n é tamanho da string
function calculateSimilarity(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  if (t.includes(q)) return 1.0;

  // Trigram similarity (simplificado)
  const qTrigrams = getTrigrams(q);
  const tTrigrams = getTrigrams(t);

  if (qTrigrams.length === 0 || tTrigrams.length === 0) return 0;

  const intersection = qTrigrams.filter(tg => tTrigrams.includes(tg));
  const union = [...new Set([...qTrigrams, ...tTrigrams])];

  return intersection.length / union.length;
}

function getTrigrams(text: string): string[] {
  const trigrams: string[] = [];
  const padded = `  ${text}  `; // Padding para trigrams nas bordas
  
  for (let i = 0; i < padded.length - 2; i++) {
    trigrams.push(padded.slice(i, i + 3));
  }

  return [...new Set(trigrams)]; // Remove duplicatas
}

// Fuzzy search para pedidos
export async function fuzzySearchOrders(query: string, limit = 20) {
  const supabase = await getAdminSupabaseClient();

  if (!query || query.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .or(`customer_email.ilike.%${query}%,customer_name.ilike.%${query}%`)
    .limit(limit)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Fuzzy search para chats
export async function fuzzySearchChats(query: string, limit = 20) {
  const supabase = await getAdminSupabaseClient();

  if (!query || query.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from('support_chats')
    .select('*, admin_users(full_name)')
    .or(`customer_email.ilike.%${query}%,customer_name.ilike.%${query}%`)
    .limit(limit)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}
