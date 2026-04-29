'use server';

import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

// Cached quick stats - 5 minute cache
export const getQuickStats = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('status, total_amount');

    if (error) throw new Error('Failed to fetch stats: ' + error.message);

    const stats = {
      totalOrders: data?.length || 0,
      pendingOrders: data?.filter(o => o.status === 'pending').length || 0,
      revenue: data?.reduce((sum, o) => {
        if (['paid', 'shipped', 'completed'].includes(o.status)) {
          return sum + (o.total_amount || 0);
        }
        return sum;
      }, 0) || 0,
    };

    return stats;
  },
  ['dashboard-quick-stats'],
  { revalidate: 300 }
);

// Cached daily sales metrics - 5 minute cache
export const getDailySalesMetrics = unstable_cache(
  async (days = 30) => {
    const { data, error } = await supabase.rpc('get_daily_sales_metrics', {
      days_count: days,
    });

    if (error) {
      // Fallback to client-side aggregation if RPC not available
      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total_amount, status')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (!orders) return [];

      // Group by date
      const grouped = orders.reduce((acc: any, order: any) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, total: 0, count: 0 };
        }
        if (order.status !== 'cancelled' && order.status !== 'refunded') {
          acc[date].total += order.total_amount || 0;
          acc[date].count += 1;
        }
        return acc;
      }, {});

      return Object.values(grouped);
    }

    return data;
  },
  ['dashboard-daily-sales'],
  { revalidate: 300 }
);

// Cached order status metrics - 5 minute cache
export const getOrderStatusMetrics = unstable_cache(
  async () => {
    const { data, error } = await supabase.rpc('get_order_status_metrics');

    if (error) {
      // Fallback to client-side aggregation
      const { data: orders } = await supabase
        .from('orders')
        .select('status');

      if (!orders) return [];

      const grouped = orders.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(grouped).map(([status, count]) => ({
        status,
        count: count as number,
      }));
    }

    return data;
  },
  ['dashboard-status-metrics'],
  { revalidate: 300 }
);
