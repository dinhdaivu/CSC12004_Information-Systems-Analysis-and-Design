import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ChatWidgetComponent } from './chat-widget.component';
import { ChatMessage, Conversation, ChatService } from '@core/services/chat.service';
import { AuthService } from '@core/services/auth.service';

const mockConversation: Conversation = {
  id: 'conv-1',
  customer_id: 'cust-1',
  status: 'open',
  created_at: '2026-05-01T09:00:00.000Z',
  updated_at: '2026-05-01T09:00:00.000Z',
};

const mockMessage: ChatMessage = {
  id: 'msg-1',
  conversation_id: 'conv-1',
  sender_id: 'cust-1',
  content: 'Hello there',
  read_at: null,
  created_at: '2026-05-01T09:00:00.000Z',
  sender: {
    id: 'cust-1',
    full_name: 'Jane Customer',
    role: 'customer',
  },
};

const chatServiceMock = {
  pollMessages: jest.fn(() => of([])),
  createOrGetConversation: jest.fn(() => of(mockConversation)),
  sendMessage: jest.fn(() => of(mockMessage)),
  markConversationAsRead: jest.fn(() => of([mockMessage])),
};

const authServiceMock = {
  isAuthenticated: jest.fn(() => true),
  getCurrentUser: jest.fn(() => ({
    id: 'cust-1',
    full_name: 'Jane Customer',
    role: 'customer',
  })),
};

describe('ChatWidgetComponent', () => {
  let component: ChatWidgetComponent;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ChatWidgetComponent],
      providers: [
        { provide: ChatService, useValue: chatServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    component = TestBed.createComponent(ChatWidgetComponent).componentInstance;
  });

  it('should merge send responses without duplicating an existing message', () => {
    component.conversation = mockConversation;
    component.currentUserId = 'cust-1';
    component.currentUserName = 'Jane Customer';
    component.messages = [mockMessage];
    component.draft = 'Hello there';

    component.send();

    expect(chatServiceMock.sendMessage).toHaveBeenCalledWith('conv-1', 'Hello there');
    expect(component.messages).toHaveLength(1);
    expect(component.messages[0]).toEqual(mockMessage);
  });

  it('should fall back to a safe sender initial when realtime payloads omit sender data', () => {
    component.currentUserId = 'cust-1';
    component.currentUserName = 'Jane Customer';

    const initial = component.getSenderInitial({
      id: 'msg-2',
      conversation_id: 'conv-1',
      sender_id: 'staff-1',
      content: 'Reply',
      read_at: null,
      created_at: '2026-05-01T09:01:00.000Z',
      sender: null,
    });

    expect(initial).toBe('S');
  });

  it('should label outgoing messages with sent/read receipt status', () => {
    component.currentUserId = 'cust-1';

    expect(component.getReceiptStatus({
      ...mockMessage,
      sender_id: 'cust-1',
      read_at: null,
    })).toBe('Sent');

    expect(component.getReceiptStatus({
      ...mockMessage,
      sender_id: 'cust-1',
      read_at: '2026-05-01T09:02:00.000Z',
    })).toBe('Read');

    expect(component.getReceiptStatus({
      ...mockMessage,
      sender_id: 'staff-1',
      read_at: null,
    })).toBe('');
  });
});