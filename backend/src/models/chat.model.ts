export interface Conversation {
  id: string;
  customer_id: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface ConversationWithCustomer extends Conversation {
  customer: { id: string; full_name: string; email: string };
  last_message?: { content: string; created_at: string } | null;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  sender: { id: string; full_name: string; role: string };
}
