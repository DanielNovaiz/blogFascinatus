-- Dashboard SQL Functions for Database-Side Aggregation
-- Run this in Supabase SQL Editor

-- Function to get daily sales metrics (optimized with GROUP BY)
CREATE OR REPLACE FUNCTION get_daily_sales_metrics(days_count INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  total DECIMAL,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    COALESCE(SUM(total_amount), 0) as total,
    COUNT(*) as count
  FROM orders
  WHERE 
    created_at >= NOW() - (days_count || ' days')::INTERVAL
    AND status NOT IN ('cancelled', 'refunded')
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get order status distribution
CREATE OR REPLACE FUNCTION get_order_status_metrics()
RETURNS TABLE (
  status TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    status,
    COUNT(*) as count
  FROM orders
  GROUP BY status
  ORDER BY status;
END;
$$ LANGUAGE plpgsql;

-- Function to get quick stats with caching hint
CREATE OR REPLACE FUNCTION get_quick_stats()
RETURNS TABLE (
  total_orders BIGINT,
  pending_orders BIGINT,
  total_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
    COALESCE(SUM(total_amount) FILTER (WHERE status IN ('paid', 'shipped', 'done')), 0) as total_revenue
  FROM orders;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for dashboard metrics (for caching)
-- Refresh this periodically or trigger-based
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_metrics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as orders_count,
  COALESCE(SUM(total_amount) FILTER (WHERE status IN ('paid', 'shipped', 'done')), 0) as revenue,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'paid') as paid_count,
  COUNT(*) FILTER (WHERE status = 'shipped') as shipped_count,
  COUNT(*) FILTER (WHERE status = 'done') as done_count
FROM orders
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Create index for materialized view refresh performance
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_date ON dashboard_metrics(date DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics;
END;
$$ LANGUAGE plpgsql;
