import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { ChatService, ChatMessage, mergeChatMessages } from './chat.service';
import { SupabaseService } from './supabase.service';

type ChannelStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CHANNEL_ERROR' | 'CLOSED';

function buildMessage(id: string, createdAt: string, overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id,
    conversation_id: 'conv-1',
    sender_id: 'user-1',
    content: `message-${id}`,
    read_at: null,
    created_at: createdAt,
    sender: {
      id: 'user-1',
      full_name: 'Test User',
      role: 'customer',
    },
    ...overrides,
  };
}

function createRealtimeChannelMock() {
  let statusCallback: ((status: ChannelStatus) => void) | null = null;
  let eventCallback: ((payload: { eventType: 'INSERT' | 'UPDATE'; new: ChatMessage }) => void) | null = null;

  const channel: {
    on: jest.Mock;
    subscribe: jest.Mock;
  } = {
    on: jest.fn((_event: string, _config: Record<string, unknown>, callback: (payload: { eventType: 'INSERT' | 'UPDATE'; new: ChatMessage }) => void) => {
      eventCallback = callback;
      return channel;
    }),
    subscribe: jest.fn((callback: (status: ChannelStatus) => void) => {
      statusCallback = callback;
      return channel;
    }),
  };

  return {
    channel,
    emitStatus(status: ChannelStatus) {
      statusCallback?.(status);
    },
    emitInsert(message: ChatMessage) {
      eventCallback?.({ eventType: 'INSERT', new: message });
    },
    emitUpdate(message: ChatMessage) {
      eventCallback?.({ eventType: 'UPDATE', new: message });
    },
  };
}

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;
  let supabaseClientMock: {
    channel: jest.Mock;
    removeChannel: jest.Mock;
  };

  beforeEach(() => {
    supabaseClientMock = {
      channel: jest.fn(),
      removeChannel: jest.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ChatService,
        {
          provide: SupabaseService,
          useValue: {
            client: supabaseClientMock,
          },
        },
      ],
    });

    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should dedupe messages by id and keep chronological order', () => {
    const merged = mergeChatMessages(
      [buildMessage('2', '2026-05-01T09:01:00.000Z')],
      [
        buildMessage('1', '2026-05-01T09:00:00.000Z', { content: 'earlier' }),
        buildMessage('2', '2026-05-01T09:01:00.000Z', { content: 'replacement' }),
      ]
    );

    expect(merged.map(message => message.id)).toEqual(['1', '2']);
    expect(merged[1].content).toBe('replacement');
  });

  it('should keep sender metadata when a realtime payload arrives without it', () => {
    const merged = mergeChatMessages(
      [buildMessage('1', '2026-05-01T09:00:00.000Z')],
      buildMessage('1', '2026-05-01T09:00:00.000Z', {
        content: 'placeholder',
        sender: null,
      })
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].sender?.full_name).toBe('Test User');
    expect(merged[0].content).toBe('placeholder');
  });

  it('should merge realtime message inserts directly without extra refetches', () => {
    const realtime = createRealtimeChannelMock();
    supabaseClientMock.channel.mockReturnValue(realtime.channel);
    const emissions: ChatMessage[][] = [];

    service.pollMessages('conv-1').subscribe(messages => {
      emissions.push(messages);
    });

    realtime.emitStatus('SUBSCRIBED');

    const request = httpMock.expectOne(`${environment.apiUrl}/chat/conversations/conv-1/messages`);
    expect(request.request.method).toBe('GET');
    request.flush({
      success: true,
      data: [buildMessage('msg-1', '2026-05-01T09:00:00.000Z')],
    });

    expect(emissions.at(-1)?.map(message => message.id)).toEqual(['msg-1']);

    realtime.emitInsert(buildMessage('msg-2', '2026-05-01T09:01:00.000Z', { content: 'Fresh payload' }));

    expect(emissions.at(-1)?.map(message => message.id)).toEqual(['msg-1', 'msg-2']);
    httpMock.expectNone(`${environment.apiUrl}/chat/conversations/conv-1/messages`);
  });

  it('should merge realtime updates that set read receipts without extra refetches', () => {
    const realtime = createRealtimeChannelMock();
    supabaseClientMock.channel.mockReturnValue(realtime.channel);
    const emissions: ChatMessage[][] = [];

    service.pollMessages('conv-1').subscribe(messages => {
      emissions.push(messages);
    });

    realtime.emitStatus('SUBSCRIBED');

    const request = httpMock.expectOne(`${environment.apiUrl}/chat/conversations/conv-1/messages`);
    request.flush({
      success: true,
      data: [buildMessage('msg-1', '2026-05-01T09:00:00.000Z')],
    });

    expect(emissions.at(-1)?.[0].read_at).toBeNull();

    realtime.emitUpdate(buildMessage('msg-1', '2026-05-01T09:00:00.000Z', {
      read_at: '2026-05-01T09:02:00.000Z',
    }));

    expect(emissions.at(-1)?.[0].read_at).toBe('2026-05-01T09:02:00.000Z');
    httpMock.expectNone(`${environment.apiUrl}/chat/conversations/conv-1/messages`);
  });

  it('should refetch after a timeout and resubscribe cleanly', () => {
    jest.useFakeTimers();

    const firstRealtime = createRealtimeChannelMock();
    const secondRealtime = createRealtimeChannelMock();
    supabaseClientMock.channel
      .mockReturnValueOnce(firstRealtime.channel)
      .mockReturnValueOnce(secondRealtime.channel);

    service.pollMessages('conv-1').subscribe();

    firstRealtime.emitStatus('SUBSCRIBED');
    httpMock.expectOne(`${environment.apiUrl}/chat/conversations/conv-1/messages`).flush({
      success: true,
      data: [],
    });

    firstRealtime.emitStatus('TIMED_OUT');
    expect(supabaseClientMock.removeChannel).toHaveBeenCalledWith(firstRealtime.channel);

    jest.advanceTimersByTime(1000);

    secondRealtime.emitStatus('SUBSCRIBED');
    httpMock.expectOne(`${environment.apiUrl}/chat/conversations/conv-1/messages`).flush({
      success: true,
      data: [],
    });

    expect(supabaseClientMock.channel).toHaveBeenCalledTimes(2);
  });

  it('should only subscribe the inbox list to conversation updates', () => {
    const realtime = createRealtimeChannelMock();
    supabaseClientMock.channel.mockReturnValue(realtime.channel);
    const emissions: unknown[] = [];

    service.pollConversations().subscribe(list => {
      emissions.push(list);
    });

    realtime.emitStatus('SUBSCRIBED');

    const request = httpMock.expectOne(`${environment.apiUrl}/chat/conversations`);
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: [] });

    expect(realtime.channel.on).toHaveBeenCalledWith(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversations' },
      expect.any(Function)
    );
    expect(realtime.channel.on).not.toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ table: 'messages' }),
      expect.any(Function)
    );

    expect(emissions.at(-1)).toEqual([]);
  });
});