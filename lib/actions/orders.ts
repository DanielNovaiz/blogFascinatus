'use server';

import { createServerClient } from '@/lib/auth-utils';
import { UpdateOrderStatusSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getOrders(status?: string) {
  const supabase = await createServerClient();

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: orders, error } = await query;

  if (error) {
    throw new Error('Erro ao buscar pedidos: ' + error.message);
  }

  return orders || [];
}

export async function getOrderById(id: string) {
  const supabase = await createServerClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: 'Erro ao buscar pedido: ' + error.message };
  }

  return { data: order, error: null };
}

export async function updateOrderStatus(id: string, newStatus: string) {
  const supabase = await createServerClient();

  const validation = UpdateOrderStatusSchema.safeParse({
    id,
    status: newStatus,
  });

  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || 'Status inválido',
    };
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: validation.data.status })
    .eq('id', id);

  if (error) {
    return { error: 'Erro ao atualizar pedido: ' + error.message };
  }

  revalidatePath('/admin/pedidos');

  return { error: null };
}
