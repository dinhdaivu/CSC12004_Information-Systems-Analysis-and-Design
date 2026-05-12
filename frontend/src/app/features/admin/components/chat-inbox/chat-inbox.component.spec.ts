import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChatInboxComponent } from './chat-inbox.component';
import { ChatService } from '@core/services/chat.service';
import { AuthService } from '@core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, Subject } from 'rxjs';

describe('ChatInboxComponent', () => {
  let component: ChatInboxComponent;
  let fixture: any;
  let mockChatSvc: any;
  let mockAuthSvc: any;
  let pollConvSubj: Subject<any>;
  let pollMsgSubj: Subject<any>;

  beforeEach(async () => {
    pollConvSubj = new Subject();
    pollMsgSubj = new Subject();

    mockChatSvc = {
      pollConversations: jest.fn().mockReturnValue(pollConvSubj.asObservable()),
      pollMessages: jest.fn().mockReturnValue(pollMsgSubj.asObservable()),
      sendMessage: jest.fn().mockReturnValue(of([{ id: 'm2', content: 'hello', sender_id: '1' }])),
      closeConversation: jest.fn().mockReturnValue(of({})),
      markConversationAsRead: jest.fn().mockReturnValue(of([]))
    };

    mockAuthSvc = {
      getCurrentUser: jest.fn().mockReturnValue({ id: '1', full_name: 'Admin' }),
      logout: jest.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [ChatInboxComponent, TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ChatService, useValue: mockChatSvc },
        { provide: AuthService, useValue: mockAuthSvc }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ChatInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load user and handle UI toggles', () => {
    expect(component.currentUserId).toBe('1');
    component.toggleLangMenu();
    component.toggleUserMenu();
    component.changeLang('vi');
    component.navigate('/test');
    component.logout();
    expect(component).toBeTruthy();
  });

  it('should receive conversations and messages', fakeAsync(() => {
    pollConvSubj.next([{ id: 'c1', status: 'open', customer: { full_name: 'John' }, last_message: { content: 'hi' } }]);
    tick();
    expect(component.conversations.length).toBe(1);
    expect(component.openCount).toBe(1);

    component.selectConversation(component.conversations[0]);
    expect(mockChatSvc.pollMessages).toHaveBeenCalledWith('c1');

    pollMsgSubj.next([{ id: 'm1', content: 'hi', sender_id: '2', read_at: null }]);
    tick();
    expect(component.messages.length).toBe(1);
    // It should mark as read since sender is not current user and read_at is null
    expect(mockChatSvc.markConversationAsRead).toHaveBeenCalledWith('c1');
  }));

  it('should format message labels and times', () => {
    component.currentUserId = '1';
    expect(component.getReceiptStatus({ sender_id: '2' } as any)).toBe('');
    expect(component.getReceiptStatus({ sender_id: '1', read_at: 'yes' } as any)).toBe('Read');
    expect(component.getReceiptStatus({ sender_id: '1', read_at: null } as any)).toBe('Sent');

    expect(component.getMessageAuthorLabel({ sender_id: '1' } as any)).toBe('Admin');
    expect(component.getMessageAuthorLabel({ sender_id: '2', sender: { full_name: 'User' } } as any)).toBe('User');

    const date = new Date('2026-01-01T12:30:00Z');
    expect(component.formatTime(date.toISOString())).toContain(':');
  });

  it('should send a message', fakeAsync(() => {
    component.selectedId = 'c1';
    component.draft = 'hello';
    component.send();
    tick();
    expect(mockChatSvc.sendMessage).toHaveBeenCalledWith('c1', 'hello');
    expect(component.draft).toBe('');
  }));

  it('should not send if empty', () => {
    component.selectedId = 'c1';
    component.draft = '   ';
    component.send();
    expect(mockChatSvc.sendMessage).not.toHaveBeenCalled();
  });

  it('should close a conversation', fakeAsync(() => {
    component.selectedId = 'c1';
    component.selectedConversation = { id: 'c1', status: 'open', customer: { full_name: 'John', email: 'j@j.com' } } as any;
    component.closeConversation();
    tick();
    expect(mockChatSvc.closeConversation).toHaveBeenCalledWith('c1');
    expect(component.selectedConversation?.status).toBe('closed');
  }));
});