'use server';

import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

const OPENAI_MODEL = 'text-embedding-3-small';
const DEFAULT_LIMIT = 8;

export interface SemanticProductResult {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  similarity?: number;
}

type MatchDocumentRow = {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  similarity: number;
};

async function createEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI embeddings falhou: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };

  const embedding = payload.data?.[0]?.embedding;

  if (!embedding || embedding.length !== 1536) {
    throw new Error('Embedding inválido retornado pela OpenAI');
  }

  return embedding;
}

// Custo estimado: cerca de US$0,00002 por produto quando o texto tem até ~1k tokens;
// o valor real varia conforme o tamanho de name + description enviados ao modelo.
export async function generateEmbeddings(input: {
  productId: string;
  name: string;
  description: string;
}): Promise<{ error: string | null }> {
  try {
    const text = `${input.name}\n\n${input.description}`.trim();
    const embedding = await createEmbedding(text);

    const { error } = await supabaseAdmin
      .from('products')
      .update({ embedding })
      .eq('id', input.productId);

    if (error) {
      return { error: `Erro ao salvar embedding do produto: ${error.message}` };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Erro ao gerar embedding do produto',
    };
  }
}

// Custo estimado: cerca de US$0,000001 por consulta curta, já que a query vira um único embedding.
export async function searchProducts(query: string): Promise<SemanticProductResult[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const embedding = await createEmbedding(trimmedQuery);

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_count: DEFAULT_LIMIT,
  });

  if (error) {
    throw new Error(`Erro na busca semântica: ${error.message}`);
  }

  return ((data ?? []) as MatchDocumentRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price),
    images: row.images ?? [],
    category: row.category,
    similarity: row.similarity,
  }));
}

export async function getRelatedProducts(
  productId: string,
  limit = 4
): Promise<SemanticProductResult[]> {
  const { data: product, error } = await supabase
    .from('products')
    .select('id, embedding')
    .eq('id', productId)
    .eq('active', true)
    .single();

  if (error || !product?.embedding) {
    return [];
  }

  const { data, error: matchError } = await supabase.rpc('match_documents', {
    query_embedding: product.embedding,
    match_count: limit + 1,
  });

  if (matchError) {
    throw new Error(`Erro ao buscar produtos relacionados: ${matchError.message}`);
  }

  return ((data ?? []) as MatchDocumentRow[])
    .filter((row) => row.id !== productId)
    .slice(0, limit)
    .map((row) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price),
      images: row.images ?? [],
      category: row.category,
      similarity: row.similarity,
    }));
}