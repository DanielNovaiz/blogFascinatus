'use server';

import { getAdminSupabaseClient } from '@/lib/admin/auth';
import type { OrderMetrics } from '@/types/order';

export async function getOrderMetrics(): Promise<OrderMetrics> {
  const supabase = await getAdminSupabaseClient();

  // Total de pedidos
  const { count: total_orders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // Total de receita (apenas pedidos pagos/completed)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .in('status', ['paid', 'completed']);

  const total_revenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

  // Average Order Value
  const average_order_value = total_orders && total_orders > 0 
    ? total_revenue / total_orders 
    : 0;

  // Breakdown por status
  const { data: statusData } = await supabase
    .from('orders')
    .select('status');

  const status_breakdown = statusData?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    total_orders: total_orders || 0,
    total_revenue,
    average_order_value,
    status_breakdown: status_breakdown as any,
  };
}

export async function getRecentOrders(limit = 10) {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getRevenueByPeriod(days = 30) {
  const supabase = await getAdminSupabaseClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', startDate.toISOString())
    .in('status', ['paid', 'completed'])
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Agrupar por dia
  const revenueByDay = data?.reduce((acc, order) => {
    const date = new Date(order.created_at).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + order.total_amount;
    return acc;
  }, {} as Record<string, number>) || {};

  return revenueByDay;
}
