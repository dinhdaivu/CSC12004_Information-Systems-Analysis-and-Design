import {
  ChangeDetectorRef, Component, DestroyRef, ElementRef, NgZone, ViewChild, inject
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ChatService, ChatMessage, Conversation, mergeChatMessages } from '@core/services/chat.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [NgClass, FormsModule],
  styles: [`
    .msg-enter { animation: fadeUp 0.2s ease; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: none; }
    }
    .chat-panel {
      animation: slideUp 0.22s cubic-bezier(.16,1,.3,1);
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to   { opacity: 1; transform: none; }
    }
  `],
  template: `
    @if (isOpen) {
      <div class="chat-panel fixed bottom-24 right-4 z-[9998] flex w-[340px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" style="height: 480px;">

        <!-- ── Header ── -->
        <div class="flex flex-shrink-0 items-center gap-3 bg-[#264893] px-4 py-3">
          <div class="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
            <img class="h-7 w-7 object-contain" src="assets/icons/logo.svg" alt="HomeStay Dorm" />
            <span class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#264893] bg-green-400"></span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-['Big_Shoulders_Text'] text-sm font-bold text-white leading-tight">HomeStay Dorm</p>
            <p class="font-['Afacad'] text-[11px] text-white/70">Support Team &bull; Online</p>
          </div>
          <button
            (click)="close()"
            class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/20 hover:text-white"
            aria-label="Close"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- ── Not authenticated ── -->
        @if (!isAuthenticated) {
          <div class="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <svg class="h-7 w-7 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
              </svg>
            </div>
            <div>
              <p class="font-['Big_Shoulders_Text'] text-base font-bold text-[#264893]">Login Required</p>
              <p class="mt-1 font-['Afacad'] text-sm text-slate-500">Please log in to chat with our support team.</p>
            </div>
          </div>
        }

        <!-- ── Connecting ── -->
        @if (isAuthenticated && isConnecting) {
          <div class="flex flex-1 items-center justify-center gap-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-[#264893] border-t-transparent"></div>
            <span class="font-['Afacad'] text-sm text-slate-400">Connecting…</span>
          </div>
        }

        <!-- ── Connection error ── -->
        @if (isAuthenticated && connectError) {
          <div class="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p class="font-['Afacad'] text-sm text-red-500">Could not connect. Please try again.</p>
            <button
              (click)="retryConnect()"
              class="rounded-full bg-[#264893] px-5 py-2 font-['Afacad'] text-sm font-semibold text-white hover:bg-[#1a3370]"
            >Retry</button>
          </div>
        }

        <!-- ── Messages ── -->
        @if (isAuthenticated && !isConnecting && !connectError) {
          <div class="flex flex-1 flex-col gap-1 overflow-y-auto bg-[#f5f0e8] px-3 py-3" #msgsEl>
            @if (loadingMessages) {
              <div class="flex items-center justify-center py-6">
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-[#264893] border-t-transparent"></div>
              </div>
            }

            @if (!loadingMessages && messages.length === 0) {
              <div class="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <img class="h-8 w-8 object-contain" src="assets/icons/logo.svg" alt="" />
                </div>
                <p class="font-['Big_Shoulders_Text'] text-sm font-bold text-[#264893]">HomeStay Dorm Support</p>
                <p class="font-['Afacad'] text-xs text-slate-500">Hi! How can we help you today?</p>
              </div>
            }

            @for (m of messages; track m.id; let i = $index) {
              @let isMine = m.sender_id === currentUserId;
              @let showAvatar = !isMine && (i === 0 || messages[i - 1].sender_id !== m.sender_id);
              <div
                class="msg-enter flex items-end gap-2"
                [ngClass]="isMine ? 'flex-row-reverse' : 'flex-row'"
              >
                <!-- Staff avatar -->
                @if (!isMine) {
                  <div
                    class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#264893]"
                    [class.invisible]="!showAvatar"
                  >{{ getSenderInitial(m) }}</div>
                }

                <div class="flex max-w-[72%] flex-col gap-0.5" [ngClass]="isMine ? 'items-end' : 'items-start'">
                  <div
                    class="px-3 py-2 font-['Afacad'] text-sm leading-relaxed break-words"
                    [ngClass]="isMine
                      ? 'rounded-2xl rounded-br-sm bg-[#264893] text-white'
                      : 'rounded-2xl rounded-bl-sm bg-white text-slate-800 shadow-sm'"
                  >{{ m.content }}</div>
                  <div class="flex items-center gap-1 px-1 font-['Afacad'] text-[10px]" [ngClass]="isMine ? 'text-slate-500' : 'text-slate-400'">
                    <span>{{ formatTime(m.created_at) }}</span>
                    @if (isMine) {
                      <span aria-hidden="true">·</span>
                      <span [ngClass]="m.read_at ? 'font-semibold text-emerald-600' : 'text-slate-500'">
                        {{ getReceiptStatus(m) }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- ── Input ── -->
          @if (conversation?.status !== 'closed') {
            <div class="flex flex-shrink-0 items-center gap-2 border-t border-slate-200 bg-white px-3 py-2.5">
              <input
                class="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-['Afacad'] text-sm outline-none transition focus:border-[#264893] focus:ring-1 focus:ring-[#264893]/30"
                [(ngModel)]="draft"
                placeholder="Type a message…"
                (keydown.enter)="send()"
                autocomplete="off"
                [disabled]="isSending"
              />
              <button
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition"
                [ngClass]="draft.trim() && !isSending ? 'bg-[#264893] text-white hover:bg-[#1a3370]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
                (click)="send()"
                [disabled]="isSending || !draft.trim()"
                aria-label="Send"
              >
                @if (isSending) {
                  <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                } @else {
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                }
              </button>
            </div>
          } @else {
            <div class="flex-shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 text-center font-['Afacad'] text-sm text-slate-400">
              This conversation has been closed.
            </div>
          }
        }

      </div>
    }

    <!-- ── Toggle button ── -->
    <button
      (click)="toggle()"
      class="fixed bottom-6 right-4 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#264893] transition hover:scale-105 hover:bg-[#1a3370] active:scale-95"
      style="box-shadow: 0 4px 20px rgba(38,72,147,0.45);"
      aria-label="Chat"
    >
      @if (isOpen) {
        <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      } @else {
        <img class="h-8 w-8 object-contain" src="assets/icons/Chat.png" />
      }
    </button>
  `
})
export class ChatWidgetComponent {
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  @ViewChild('msgsEl') private msgsEl?: ElementRef<HTMLDivElement>;

  isOpen = false;
  isAuthenticated = false;
  isConnecting = false;
  connectError = false;
  conversation: Conversation | null = null;
  messages: ChatMessage[] = [];
  draft = '';
  isSending = false;
  loadingMessages = false;
  currentUserId = '';
  currentUserName = '';
  private isSyncingReadReceipts = false;

  private readonly msgPoll$ = new Subject<string>();

  constructor() {
    this.msgPoll$.pipe(
      switchMap((id: string) => this.chatService.pollMessages(id)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(msgs => {
      this.zone.run(() => {
        this.loadingMessages = false;
        this.messages = msgs;
        this.scrollToBottom();
        this.syncReadReceipts();
        this.cdr.detectChanges();
      });
    });
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      if (!this.conversation && !this.isConnecting) {
        this.startConversation();
        return;
      }

      this.syncReadReceipts();
    }
  }

  close(): void {
    this.isOpen = false;
  }

  retryConnect(): void {
    this.connectError = false;
    this.startConversation();
  }

  private startConversation(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (!this.isAuthenticated) return;
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id ?? '';
    this.currentUserName = currentUser?.full_name ?? 'You';
    this.isConnecting = true;
    this.connectError = false;
    this.chatService.createOrGetConversation().subscribe({
      next: conv => {
        this.conversation = conv;
        this.isConnecting = false;
        this.loadingMessages = true;
        this.msgPoll$.next(conv.id);
      },
      error: () => {
        this.isConnecting = false;
        this.connectError = true;
      }
    });
  }

  send(): void {
    const text = this.draft.trim();
    if (!text || this.isSending || !this.conversation) return;

    const timerLabel = `[ChatWidget] send:${this.conversation.id}`;
    console.time(timerLabel);
    console.log('[ChatWidget] send start', {
      conversationId: this.conversation.id,
      contentLength: text.length,
      currentUserId: this.currentUserId,
    });

    this.isSending = true;
    this.chatService.sendMessage(this.conversation.id, text).pipe(
      finalize(() => {
        this.zone.run(() => {
          this.isSending = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: msg => {
        this.zone.run(() => {
          this.draft = '';
          this.messages = mergeChatMessages(this.messages, msg);
          this.scrollToBottom();
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }

  getReceiptStatus(message: ChatMessage): string {
    if (message.sender_id !== this.currentUserId) {
      return '';
    }

    return message.read_at ? 'Read' : 'Sent';
  }

  private syncReadReceipts(): void {
    if (!this.isOpen || !this.conversation || !this.currentUserId || this.isSyncingReadReceipts) return;

    const hasUnreadIncoming = this.messages.some(message => message.sender_id !== this.currentUserId && !message.read_at);
    if (!hasUnreadIncoming) return;

    this.isSyncingReadReceipts = true;
    this.chatService.markConversationAsRead(this.conversation.id).subscribe({
      next: updatedMessages => {
        if (updatedMessages.length > 0) {
          this.messages = mergeChatMessages(this.messages, updatedMessages);
          this.scrollToBottom();
        }
        // Do NOT call syncReadReceipts() here — it creates an infinite loop.
        // pollMessages (Realtime) will re-trigger this naturally when new messages arrive.
        this.isSyncingReadReceipts = false;
      },
      error: () => {
        this.isSyncingReadReceipts = false;
      }
    });
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    window.setTimeout(() => {
      if (this.msgsEl) {
        this.msgsEl.nativeElement.scrollTop = this.msgsEl.nativeElement.scrollHeight;
      }
    }, 0);
  }

  getSenderInitial(message: ChatMessage): string {
    const fallbackName = message.sender_id === this.currentUserId ? this.currentUserName : 'Support Team';
    const name = message.sender?.full_name?.trim() || fallbackName;
    return name.charAt(0).toUpperCase() || '?';
  }
}
