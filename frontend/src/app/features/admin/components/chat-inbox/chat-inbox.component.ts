import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef, Component, DestroyRef, ElementRef,
  NgZone, OnInit, ViewChild, inject,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { EMPTY, Subject, switchMap } from "rxjs";
import { finalize } from "rxjs/operators";
import { AuthService } from "@core/services/auth.service";
import { ChatService, ChatMessage, ConversationWithCustomer, mergeChatMessages } from "@core/services/chat.service";

@Component({
  selector: "app-chat-inbox",
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  styles: [`
    .hover-effect { transition: all 0.2s ease-in-out; cursor: pointer; }
    .hover-effect:hover { opacity: 0.9; }
    .conv-btn { width:100%;text-align:left;border:none;border-bottom:1px solid #f1f5f9;padding:12px 16px;cursor:pointer;display:flex;flex-direction:column;gap:3px;transition:background .15s;background:white; }
    .conv-btn:hover { background:#f8fafc; }
    .conv-btn.active { background:#264893;color:white; }
  `],
  template: `
    <!-- Card background -->
    <div style="width:1317px;height:730px;left:500px;top:252px;position:absolute;background:rgba(246,246,246,0.70);box-shadow:5px 5px 50px 5px rgba(0,0,0,.25);border-radius:25px"></div>

          <!-- Title -->
          <div style="width:684px;height:30px;left:593px;top:275px;position:absolute;display:flex;flex-direction:column;justify-content:center;color:#264893;font-size:48px;font-family:'Big Shoulders Text';font-weight:900">
            {{ "ADMIN_RENTAL.SIDEBAR.CHAT" | translate }}
          </div>

          <!-- Chat UI: conv list + messages -->
          <div style="position:absolute;left:510px;top:340px;width:1295px;height:625px;display:flex;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">

            <!-- Conversation list -->
            <div style="width:320px;flex-shrink:0;background:white;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;overflow-y:auto">
              <div *ngIf="loadingConversations" style="padding:40px;text-align:center;color:#94a3b8;font-size:18px;font-family:Afacad">{{ "COMMON.LOADING" | translate }}</div>
              <div *ngIf="!loadingConversations && conversations.length===0" style="padding:40px;text-align:center;color:#94a3b8;font-size:18px;font-family:Afacad">{{ "ADMIN_CHAT.NO_CONVERSATIONS" | translate }}</div>
              <button *ngFor="let conv of conversations" class="conv-btn" [class.active]="selectedId===conv.id" (click)="selectConversation(conv)">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="font-size:18px;font-weight:600;font-family:Afacad;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px">{{conv.customer.full_name}}</span>
                  <span style="font-size:12px;border-radius:999px;padding:2px 8px;font-family:Afacad" [style.background]="selectedId===conv.id?'rgba(255,255,255,.2)':(conv.status==='open'?'#dcfce7':'#f1f5f9')" [style.color]="selectedId===conv.id?'white':(conv.status==='open'?'#16a34a':'#64748b')">{{conv.status==='open' ? ('ADMIN_CHAT.OPEN' | translate) : ('ADMIN_CHAT.CLOSED' | translate)}}</span>
                </div>
                <span *ngIf="conv.last_message" style="font-size:14px;opacity:.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:Afacad">{{conv.last_message.content}}</span>
                <span style="font-size:12px;opacity:.5;font-family:Afacad">{{conv.customer.email}}</span>
              </button>
            </div>

            <!-- Message area -->
            <div style="flex:1;display:flex;flex-direction:column;background:#f8fafc;overflow:hidden">
              <!-- Empty state -->
              <div *ngIf="!selectedConversation" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#94a3b8">
                <svg style="width:56px;height:56px;opacity:.3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>
                <p style="font-size:18px;font-family:Afacad">{{ "ADMIN_CHAT.SELECT_CONVERSATION" | translate }}</p>
              </div>

              <ng-container *ngIf="selectedConversation">
                <!-- Thread header -->
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e2e8f0;background:white;padding:14px 20px;flex-shrink:0">
                  <div>
                    <p style="font-weight:600;color:#264893;font-size:20px;font-family:Afacad">{{selectedConversation.customer.full_name}}</p>
                    <p style="color:#94a3b8;font-size:14px;font-family:Afacad">{{selectedConversation.customer.email}}</p>
                  </div>
                  <button *ngIf="selectedConversation.status==='open'" style="background:#e2e8f0;border:none;border-radius:8px;padding:6px 16px;font-size:16px;cursor:pointer;color:#475569;font-family:Afacad" [disabled]="isClosing" (click)="closeConversation()">{{isClosing ? ('ADMIN_CHAT.CLOSING' | translate) : ('COMMON.CLOSE' | translate)}}</button>
                  <span *ngIf="selectedConversation.status!=='open'" style="background:#f1f5f9;border-radius:8px;padding:6px 16px;font-size:16px;color:#94a3b8;font-family:Afacad">{{ "ADMIN_CHAT.CLOSED" | translate }}</span>
                </div>

                <!-- Messages -->
                <div style="flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:10px" #msgsEl>
                  <div *ngIf="loadingMessages" style="text-align:center;color:#94a3b8;font-size:16px;font-family:Afacad;padding:30px">{{ "COMMON.LOADING" | translate }}</div>
                  <p *ngIf="!loadingMessages && messages.length===0" style="text-align:center;color:#94a3b8;font-size:16px;font-family:Afacad;margin-top:30px">{{ "ADMIN_CHAT.NO_MESSAGES" | translate }}</p>
                  <div *ngFor="let m of messages" style="display:flex;flex-direction:column;max-width:65%" [style.align-self]="m.sender_id===currentUserId?'flex-end':'flex-start'" [style.align-items]="m.sender_id===currentUserId?'flex-end':'flex-start'">
                    <span style="font-size:12px;color:#94a3b8;margin-bottom:3px;font-family:Afacad">{{getMessageAuthorLabel(m)}}</span>
                    <span style="border-radius:16px;padding:8px 16px;font-size:16px;line-height:1.5;word-break:break-word;font-family:Afacad" [style.background]="m.sender_id===currentUserId?'#264893':'white'" [style.color]="m.sender_id===currentUserId?'white':'#1e293b'">{{m.content}}</span>
                    <div style="display:flex;gap:4px;font-size:11px;color:#94a3b8;margin-top:2px;font-family:Afacad">
                      <span>{{formatTime(m.created_at)}}</span>
                      <span *ngIf="m.sender_id===currentUserId">· <span [style.color]="m.read_at?'#16a34a':'#94a3b8'">{{getReceiptStatus(m)}}</span></span>
                    </div>
                  </div>
                </div>

                <!-- Input -->
                <div *ngIf="selectedConversation.status==='open'" style="display:flex;align-items:center;gap:10px;border-top:1px solid #e2e8f0;background:white;padding:12px 16px;flex-shrink:0">
                  <input style="flex:1;border-radius:999px;border:1px solid #e2e8f0;background:#f8fafc;padding:8px 18px;font-size:16px;outline:none;font-family:Afacad" [(ngModel)]="draft" [placeholder]="'ADMIN_CHAT.TYPE_REPLY' | translate" (keydown.enter)="send()" autocomplete="off" [disabled]="isSending"/>
                  <button style="width:42px;height:42px;border-radius:50%;background:#264893;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0" (click)="send()" [disabled]="isSending||!draft.trim()">
                    <svg style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </ng-container>
            </div>
          </div>

  `
})
export class ChatInboxComponent implements OnInit {
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  @ViewChild("msgsEl") private msgsEl?: ElementRef<HTMLDivElement>;

  conversations: ConversationWithCustomer[] = [];
  messages: ChatMessage[] = [];
  selectedConversation: ConversationWithCustomer | null = null;
  selectedId: string | null = null;
  currentUserId = "";
  currentUserName = "";
  draft = "";
  isSending = false;
  isClosing = false;
  loadingConversations = true;
  loadingMessages = false;
  private isSyncingReadReceipts = false;
  private readonly msgPoll$ = new Subject<string | null>();

  get openCount(): number { return this.conversations.filter(c => c.status === "open").length; }

  ngOnInit(): void {
    const u = this.authService.getCurrentUser();
    this.currentUserId = u?.id ?? "";
    this.currentUserName = u?.full_name ?? "You";

    this.chatService.pollConversations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => {
      this.zone.run(() => {
        this.loadingConversations = false;
        this.conversations = list;
        if (this.selectedId) {
          const updated = list.find(c => c.id === this.selectedId);
          if (updated) this.selectedConversation = updated;
        }
        this.cdr.detectChanges();
      });
    });

    this.msgPoll$.pipe(
      switchMap(id => id ? this.chatService.pollMessages(id) : EMPTY),
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

  selectConversation(conv: ConversationWithCustomer): void {
    this.selectedId = conv.id;
    this.selectedConversation = conv;
    this.messages = [];
    this.loadingMessages = true;
    this.msgPoll$.next(conv.id);
  }

  send(): void {
    const text = this.draft.trim();
    if (!text || this.isSending || !this.selectedId) return;
    this.isSending = true;
    this.chatService.sendMessage(this.selectedId, text).pipe(
      finalize(() => { this.zone.run(() => { this.isSending = false; this.cdr.detectChanges(); }); })
    ).subscribe({
      next: msg => { this.zone.run(() => { this.draft = ""; this.messages = mergeChatMessages(this.messages, msg); this.scrollToBottom(); this.cdr.detectChanges(); }); },
      error: () => { this.zone.run(() => { this.cdr.detectChanges(); }); }
    });
  }

  closeConversation(): void {
    if (!this.selectedId || this.isClosing) return;
    this.isClosing = true;
    this.chatService.closeConversation(this.selectedId).subscribe({
      next: () => {
        this.zone.run(() => {
          this.isClosing = false;
          if (this.selectedConversation) this.selectedConversation = { ...this.selectedConversation, status: "closed" };
          this.msgPoll$.next(null);
          this.cdr.detectChanges();
        });
      },
      error: () => { this.zone.run(() => { this.isClosing = false; this.cdr.detectChanges(); }); }
    });
  }

  getReceiptStatus(m: ChatMessage): string { return m.sender_id !== this.currentUserId ? "" : m.read_at ? "Read" : "Sent"; }
  formatTime(iso: string): string { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
  getMessageAuthorLabel(m: ChatMessage): string {
    return m.sender_id === this.currentUserId ? this.currentUserName : (m.sender?.full_name?.trim() || this.selectedConversation?.customer.full_name || "Customer");
  }

  private syncReadReceipts(): void {
    if (!this.selectedConversation || this.isSyncingReadReceipts) return;
    const hasUnread = this.messages.some(m => m.sender_id !== this.currentUserId && !m.read_at);
    if (!hasUnread) return;
    this.isSyncingReadReceipts = true;
    this.chatService.markConversationAsRead(this.selectedConversation.id).subscribe({
      next: updated => {
        this.zone.run(() => {
          if (updated.length > 0) { this.messages = mergeChatMessages(this.messages, updated); this.scrollToBottom(); }
          this.isSyncingReadReceipts = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.zone.run(() => { this.isSyncingReadReceipts = false; this.cdr.detectChanges(); }); }
    });
  }

  private scrollToBottom(): void {
    window.setTimeout(() => { if (this.msgsEl) this.msgsEl.nativeElement.scrollTop = this.msgsEl.nativeElement.scrollHeight; }, 0);
  }
}
