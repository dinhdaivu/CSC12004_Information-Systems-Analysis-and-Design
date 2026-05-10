import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { environment } from '@environments/environment';
import { SupabaseService } from './supabase.service';

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
  sender?: { id: string; full_name: string; role: string } | null;
}

const RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 10000;

function sortMessages(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => {
    const timeDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return timeDiff !== 0 ? timeDiff : a.id.localeCompare(b.id);
  });
}

function mergeChatMessage(existing: ChatMessage | undefined, incoming: ChatMessage): ChatMessage {
  if (!existing) return incoming;

  return {
    ...existing,
    ...incoming,
    sender: incoming.sender ?? existing.sender ?? null,
  };
}

export function mergeChatMessages(
  existing: ChatMessage[],
  incoming: ChatMessage | ChatMessage[]
): ChatMessage[] {
  const next = new Map<string, ChatMessage>();

  for (const message of existing) {
    next.set(message.id, message);
  }

  for (const message of Array.isArray(incoming) ? incoming : [incoming]) {
    next.set(message.id, mergeChatMessage(next.get(message.id), message));
  }

  return sortMessages([...next.values()]);
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService);
  private readonly zone = inject(NgZone);
  private readonly api = `${environment.apiUrl}/chat`;

  // ── REST write methods (unchanged) ──────────────────────────────────

  createOrGetConversation(): Observable<Conversation> {
    return this.http.post<{ data: Conversation }>(`${this.api}/conversations`, {}).pipe(
      map(r => r.data)
    );
  }

  getConversations(): Observable<ConversationWithCustomer[]> {
    return this.http.get<{ data: ConversationWithCustomer[] }>(`${this.api}/conversations`).pipe(
      map(r => r.data)
    );
  }

  getMessages(conversationId: string): Observable<ChatMessage[]> {
    return this.http.get<{ data: ChatMessage[] }>(`${this.api}/conversations/${conversationId}/messages`).pipe(
      map(r => r.data)
    );
  }

  sendMessage(conversationId: string, content: string): Observable<ChatMessage> {
    return this.http.post<{ data: ChatMessage }>(
      `${this.api}/conversations/${conversationId}/messages`,
      { content }
    ).pipe(map(r => r.data));
  }

  closeConversation(conversationId: string): Observable<void> {
    return this.http.patch<{ data: null }>(
      `${this.api}/conversations/${conversationId}/close`,
      {}
    ).pipe(map(() => void 0));
  }

  markConversationAsRead(conversationId: string): Observable<ChatMessage[]> {
    return this.http.patch<{ data: ChatMessage[] }>(
      `${this.api}/conversations/${conversationId}/read`,
      {}
    ).pipe(map(r => r.data));
  }

  // ── WebSocket real-time subscriptions ───────────────────────────────

  /**
   * Emits the current message list, then keeps it fresh by merging new
   * Realtime INSERT payloads directly into local state. The list is re-fetched
   * only when the channel connects/reconnects so we can recover missed rows
   * without introducing a refetch-on-every-event race.
   */
  pollMessages(conversationId: string): Observable<ChatMessage[]> {
    return new Observable<ChatMessage[]>(observer => {
      let active = true;
      let channel: RealtimeChannel | null = null;
      let retryHandle: number | null = null;
      let retryDelay = RETRY_DELAY_MS;
      let messages: ChatMessage[] = [];

      const emit = () => {
        if (active) observer.next(messages);
      };

      const refetch = () => {
        if (!active) return;
        this.getMessages(conversationId).subscribe({
          next: msgs => {
            if (!active) return;
            messages = mergeChatMessages(messages, msgs);
            emit();
          },
          error: err => { if (active) observer.error(err); }
        });
      };

      const cleanupChannel = () => {
        if (channel) {
          void this.supabase.client.removeChannel(channel);
          channel = null;
        }
      };

      const reconnect = () => {
        if (!active) return;
        if (retryHandle !== null) window.clearTimeout(retryHandle);
        retryHandle = window.setTimeout(() => {
          retryHandle = null;
          connect();
        }, retryDelay);
        retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY_MS);
      };

      const connect = () => {
        if (!active) return;

        channel = this.supabase.client
          .channel(`messages:${conversationId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          }, payload => {
            // Supabase Realtime fires outside Angular's NgZone.
            // Run inside zone so change detection picks up the new message.
            this.zone.run(() => {
              if (!active || !payload.new) return;
              messages = mergeChatMessages(messages, payload.new as ChatMessage);
              emit();
            });
          })
          .subscribe(status => {
            this.zone.run(() => {
              if (!active) return;

              if (status === 'SUBSCRIBED') {
                retryDelay = RETRY_DELAY_MS;
                refetch();
                return;
              }

              if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                cleanupChannel();
                reconnect();
              }
            });
          });
      };

      connect();

      return () => {
        active = false;
        if (retryHandle !== null) window.clearTimeout(retryHandle);
        cleanupChannel();
      };
    });
  }

  /**
   * Emits the conversations list immediately, then re-emits whenever a
   * conversation row changes. Message inserts already update the conversation's
   * `updated_at`, so we do not need a separate whole-table messages listener.
   * That keeps the staff channel much narrower and avoids noisy fan-out.
   */
  pollConversations(): Observable<ConversationWithCustomer[]> {
    return new Observable<ConversationWithCustomer[]>(observer => {
      let active = true;
      let channel: RealtimeChannel | null = null;
      let retryHandle: number | null = null;
      let retryDelay = RETRY_DELAY_MS;

      const refetch = () => {
        if (!active) return;
        this.getConversations().subscribe({
          next: list => { if (active) observer.next(list); },
          error: err => { if (active) observer.error(err); }
        });
      };

      const cleanupChannel = () => {
        if (channel) {
          void this.supabase.client.removeChannel(channel);
          channel = null;
        }
      };

      const reconnect = () => {
        if (!active) return;
        if (retryHandle !== null) window.clearTimeout(retryHandle);
        retryHandle = window.setTimeout(() => {
          retryHandle = null;
          connect();
        }, retryDelay);
        retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY_MS);
      };

      const connect = () => {
        if (!active) return;

        channel = this.supabase.client
          .channel('conversations:all')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
            // Supabase Realtime fires outside Angular's NgZone.
            this.zone.run(() => refetch());
          })
          .subscribe(status => {
            this.zone.run(() => {
              if (!active) return;

              if (status === 'SUBSCRIBED') {
                retryDelay = RETRY_DELAY_MS;
                refetch();
                return;
              }

              if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                cleanupChannel();
                reconnect();
              }
            });
          });
      };

      connect();

      return () => {
        active = false;
        if (retryHandle !== null) window.clearTimeout(retryHandle);
        cleanupChannel();
      };
    });
  }
}
