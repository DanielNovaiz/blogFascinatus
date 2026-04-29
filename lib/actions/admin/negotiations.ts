'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSupabaseClient } from '@/lib/admin/auth';
import type { NegotiationStatus } from '@/types/negotiation';
import { canTransition } from '@/types/negotiation';

export async function getAllNegotiations() {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('price_negotiations')
    .select('*, products(name, images)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getNegotiation(negotiationId: string) {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('price_negotiations')
    .select('*, products(*)')
    .eq('id', negotiationId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateNegotiationStatus(
  negotiationId: string,
  newStatus: NegotiationStatus,
  adminResponse?: string,
  counterPrice?: number
) {
  const supabase = await getAdminSupabaseClient();

  // Buscar status atual
  const { data: current } = await supabase
    .from('price_negotiations')
    .select('status')
    .eq('id', negotiationId)
    .single();

  if (!current) throw new Error('Negociação não encontrada');

  // Validar transição de estado
  if (!canTransition(current.status, newStatus)) {
    throw new Error(
      `Transição inválida: ${current.status} -> ${newStatus}`
    );
  }

  const updateData: any = { status: newStatus };
  if (adminResponse) updateData.admin_response = adminResponse;
  if (counterPrice !== undefined) updateData.counter_price = counterPrice;

  const { error } = await supabase
    .from('price_negotiations')
    .update(updateData)
    .eq('id', negotiationId);

  if (error) throw error;

  revalidatePath('/admin/negociacoes');
  revalidatePath('/admin/negociacoes/[id]');
}

export async function getNegotiationsByStatus(status: NegotiationStatus) {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('price_negotiations')
    .select('*, products(name, images)')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createNegotiation(
  productId: string,
  customerEmail: string,
  proposedPrice: number
) {
  const supabase = await getAdminSupabaseClient();

  // Buscar preço original
  const { data: product } = await supabase
    .from('products')
    .select('price')
    .eq('id', productId)
    .single();

  if (!product) throw new Error('Produto não encontrado');

  // Definir expiração em 24h
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const { error } = await supabase
    .from('price_negotiations')
    .insert({
      product_id: productId,
      customer_email: customerEmail,
      original_price: product.price,
      proposed_price: proposedPrice,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    });

  if (error) throw error;

  revalidatePath('/admin/negociacoes');
}
