export type ChatStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type MessageSender = 'customer' | 'admin';

export interface SupportChat {
  id: string;
  customer_email: string;
  customer_name?: string;
  status: ChatStatus;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender: MessageSender;
  sender_id?: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface ChatWithMessages extends SupportChat {
  messages: ChatMessage[];
  unread_count?: number;
}
