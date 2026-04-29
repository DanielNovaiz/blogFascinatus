'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSupabaseClient } from '@/lib/admin/auth';
import type { OrderStatus } from '@/types/order';

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await getAdminSupabaseClient();

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;

  revalidatePath('/admin/pedidos');
  revalidatePath('/admin/pedidos/[id]');
}

export async function getAllOrders() {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getOrder(orderId: string) {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
}

export async function getOrdersByStatus(status: OrderStatus) {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
