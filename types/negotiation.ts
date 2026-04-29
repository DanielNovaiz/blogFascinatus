export type NegotiationStatus = 'pending' | 'counter_offered' | 'accepted' | 'rejected' | 'expired';

export interface PriceNegotiation {
  id: string;
  product_id: string;
  customer_email: string;
  original_price: number;
  proposed_price: number;
  status: NegotiationStatus;
  admin_response?: string;
  counter_price?: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NegotiationTransition {
  from: NegotiationStatus;
  to: NegotiationStatus;
  action: string;
}

// State Machine para negociação
export const NEGOTIATION_STATE_MACHINE: Record<NegotiationStatus, NegotiationTransition[]> = {
  pending: [
    { from: 'pending', to: 'counter_offered', action: 'admin_counter' },
    { from: 'pending', to: 'accepted', action: 'admin_accept' },
    { from: 'pending', to: 'rejected', action: 'admin_reject' },
    { from: 'pending', to: 'expired', action: 'auto_expire' },
  ],
  counter_offered: [
    { from: 'counter_offered', to: 'accepted', action: 'customer_accept' },
    { from: 'counter_offered', to: 'rejected', action: 'customer_reject' },
    { from: 'counter_offered', to: 'expired', action: 'auto_expire' },
  ],
  accepted: [], // Terminal state
  rejected: [], // Terminal state
  expired: [],  // Terminal state
};

export function canTransition(from: NegotiationStatus, to: NegotiationStatus): boolean {
  const transitions = NEGOTIATION_STATE_MACHINE[from];
  return transitions.some(t => t.to === to);
}
