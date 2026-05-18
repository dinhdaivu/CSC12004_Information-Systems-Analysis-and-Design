import { supabaseServiceRole } from '@config/supabase';
import { ForbiddenError, InternalServerError, NotFoundError, ValidationError } from '@utils/errors';
import type { ChatMessage, Conversation, ConversationWithCustomer } from '@models/chat.model';

const STAFF_ROLES = new Set(['sale', 'accountant', 'manager', 'admin']);

export class ChatService {
  static async createOrGetConversation(customerId: string): Promise<Conversation> {
    this.ensureClient();

    const { data: existing } = await supabaseServiceRole!
      .from('conversations')
      .select('*')
      .eq('customer_id', customerId)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) return existing as Conversation;

    const { data, error } = await supabaseServiceRole!
      .from('conversations')
      .insert({ customer_id: customerId, status: 'open' })
      .select('*')
      .single();

    if (error || !data) throw new InternalServerError('Failed to create conversation');
    return data as Conversation;
  }

  static async getConversations(): Promise<ConversationWithCustomer[]> {
    this.ensureClient();

    const { data, error } = await supabaseServiceRole!
      .from('conversations')
      .select(`
        *,
        customer:users!customer_id(id, full_name, email),
        messages(content, created_at)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw new InternalServerError('Failed to fetch conversations');

    return ((data ?? []) as (Conversation & {
      customer: { id: string; full_name: string; email: string };
      messages: { content: string; created_at: string }[];
    })[]).map(row => {
      const sorted = (row.messages ?? []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const { messages: _, ...rest } = row;
      void _;
      return { ...rest, last_message: sorted[0] ?? null } as ConversationWithCustomer;
    });
  }

  static async getConversation(conversationId: string): Promise<Conversation> {
    this.ensureClient();

    const { data, error } = await supabaseServiceRole!
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error || !data) throw new NotFoundError('Conversation not found');
    return data as Conversation;
  }

  static async getMessages(conversationId: string, viewerId: string, viewerRole: string): Promise<ChatMessage[]> {
    this.ensureClient();
    await this.assertConversationAccess(conversationId, viewerId, viewerRole);

    const { data, error } = await supabaseServiceRole!
      .from('messages')
      .select('*, sender:users!sender_id(id, full_name, role)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw new InternalServerError('Failed to fetch messages');
    return (data ?? []) as ChatMessage[];
  }

  static async sendMessage(
    conversationId: string,
    senderId: string,
    senderRole: string,
    content: string
  ): Promise<ChatMessage> {
    this.ensureClient();

    if (!content?.trim()) throw new ValidationError('Message content cannot be empty');

    try {
      const conv = await this.assertConversationAccess(conversationId, senderId, senderRole);
      if (conv.status === 'closed') throw new ValidationError('Cannot send message to a closed conversation');

      const { data, error } = await supabaseServiceRole!
        .from('messages')
        .insert({ conversation_id: conversationId, sender_id: senderId, content: content.trim() })
        .select('*, sender:users!sender_id(id, full_name, role)')
        .single();

      if (error || !data) throw new InternalServerError('Failed to send message');

      await supabaseServiceRole!
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data as ChatMessage;
    } catch (error) {
      console.error('[ChatService] sendMessage error', {
        conversationId,
        senderId,
        error,
      });
      throw error;
    }
  }

  static async markConversationAsRead(
    conversationId: string,
    readerId: string,
    readerRole: string
  ): Promise<ChatMessage[]> {
    this.ensureClient();

    await this.assertConversationAccess(conversationId, readerId, readerRole);

    const { data, error } = await supabaseServiceRole!
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', readerId)
      .is('read_at', null)
      .select('*, sender:users!sender_id(id, full_name, role)');

    if (error) throw new InternalServerError('Failed to update read receipts');

    return (data ?? []) as ChatMessage[];
  }

  static async closeConversation(conversationId: string): Promise<void> {
    this.ensureClient();

    const { error } = await supabaseServiceRole!
      .from('conversations')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) throw new InternalServerError('Failed to close conversation');
  }

  private static async assertConversationAccess(
    conversationId: string,
    userId: string,
    userRole: string
  ): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);

    if (userRole === 'customer') {
      if (conversation.customer_id !== userId) {
        throw new ForbiddenError('Access denied');
      }

      return conversation;
    }

    if (!STAFF_ROLES.has(userRole)) {
      throw new ForbiddenError('Access denied');
    }

    return conversation;
  }

  private static ensureClient(): void {
    if (!supabaseServiceRole) throw new InternalServerError('Supabase service role client not configured');
  }
}
