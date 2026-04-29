import { getOrderMetrics, getRecentOrders } from '@/lib/actions/admin/metrics';
import MetricsCard from '@/components/admin/MetricsCard';

export default async function AdminDashboard() {
  const [metrics, recentOrders] = await Promise.all([
    getOrderMetrics(),
    getRecentOrders(5),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-earth-800">Dashboard</h1>
        <p className="text-earth-600 mt-2">Visão geral das vendas e métricas</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total de Pedidos"
          value={metrics.total_orders}
          icon="📦"
          color="peach"
        />
        <MetricsCard
          title="Receita Total"
          value={`R$ ${metrics.total_revenue.toFixed(2)}`}
          icon="💰"
          color="mint"
        />
        <MetricsCard
          title="Ticket Médio"
          value={`R$ ${metrics.average_order_value.toFixed(2)}`}
          icon="📊"
          color="lilac"
        />
        <MetricsCard
          title="Pedidos Pendentes"
          value={metrics.status_breakdown?.pending || 0}
          icon="⏳"
          color="straw"
        />
      </div>

      {/* Status Breakdown */}
      <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-earth-800 mb-4">Status dos Pedidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics.status_breakdown || {}).map(([status, count]) => (
            <div key={status} className="bg-white border border-beige-200 rounded-xl p-4">
              <p className="text-sm text-earth-600 capitalize">{status}</p>
              <p className="text-2xl font-semibold text-earth-800">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-ivory-50 border border-beige-200 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-earth-800 mb-4">Pedidos Recentes</h2>
        <div className="space-y-3">
          {recentOrders?.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-beige-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-earth-800">{order.customer_email}</p>
                <p className="text-sm text-earth-600">
                  {new Date(order.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-peach-600">
                  R$ {order.total_amount.toFixed(2)}
                </p>
                <p className="text-sm text-earth-600 capitalize">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
