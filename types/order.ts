export type OrderStatus = 'pending' | 'processing' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunded';

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface Order {
  id: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  status: OrderStatus;
  total_amount: number;
  payment_intent_id?: string;
  shipping_address?: ShippingAddress;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface OrderMetrics {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  status_breakdown: Record<OrderStatus, number>;
}
