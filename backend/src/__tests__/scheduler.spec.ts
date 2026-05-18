import { startScheduler } from '../scheduler';
import { supabaseServiceRole } from '../config/supabase';

jest.mock('../config/supabase', () => ({
  supabaseServiceRole: { from: jest.fn() }
}));

describe('Scheduler', () => {
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.useFakeTimers();

    mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis()
    };
    (supabaseServiceRole!.from as jest.Mock).mockReturnValue(mockChain);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should expire overdue deposits and update room if no active deposits remain', async () => {
    // expired query
    mockChain.lt.mockResolvedValueOnce({
      data: [{ id: 'dep-1', room_id: 'room-1' }],
      error: null
    });
    // active deposits query check
    mockChain.limit.mockResolvedValueOnce({
      data: [], // no active
      error: null
    });

    startScheduler();

    // Fast-forward promises
    for (let i = 0; i < 5; i++) {
      await Promise.resolve();
    }

    expect(mockChain.update).toHaveBeenCalledWith({ status: 'expired' });
    expect(mockChain.update).toHaveBeenCalledWith({ status: 'available' });
  });

  it('should not set room available if active deposits still exist', async () => {
    mockChain.lt.mockResolvedValueOnce({
      data: [{ id: 'dep-1', room_id: 'room-1' }],
      error: null
    });
    mockChain.limit.mockResolvedValueOnce({
      data: [{ id: 'dep-2' }], // existing active deposit
      error: null
    });

    startScheduler();

    for (let i = 0; i < 5; i++) {
      await Promise.resolve();
    }

    expect(mockChain.update).toHaveBeenCalledWith({ status: 'expired' });
    expect(mockChain.update).not.toHaveBeenCalledWith({ status: 'available' });
  });

  it('should do nothing if no expired deposits found', async () => {
    mockChain.lt.mockResolvedValueOnce({ data: [], error: null });

    startScheduler();
    await Promise.resolve();

    expect(mockChain.update).not.toHaveBeenCalled();
  });

  it('should run correctly on interval', async () => {
    mockChain.lt.mockResolvedValue({ data: [], error: null });

    startScheduler();
    expect(mockChain.lt).toHaveBeenCalledTimes(1); // called on startup

    jest.advanceTimersByTime(60 * 60 * 1000);
    expect(mockChain.lt).toHaveBeenCalledTimes(2); // called again after 1 hour
  });

  it('should cancel associated rental requests when expired deposits have rental_request_id', async () => {
    // expired deposits include one with a rental_request_id
    mockChain.lt.mockResolvedValueOnce({
      data: [{ id: 'dep-1', room_id: 'room-1', rental_request_id: 'req-1' }],
      error: null
    });
    // active deposits check
    mockChain.limit.mockResolvedValueOnce({
      data: [],
      error: null
    });

    startScheduler();

    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }

    // update expired
    expect(mockChain.update).toHaveBeenCalledWith({ status: 'expired' });
    // cancel rental request (line 32 branch)
    expect(mockChain.update).toHaveBeenCalledWith({ status: 'cancelled' });
    // room made available
    expect(mockChain.update).toHaveBeenCalledWith({ status: 'available' });
  });

  it('should return early when supabaseServiceRole is null', async () => {
    // Test early return at the top of expireOverdueDeposits when no client
    mockChain.lt.mockResolvedValueOnce({ data: null, error: { message: 'fetch error' } });

    startScheduler();
    await Promise.resolve();

    expect(mockChain.update).not.toHaveBeenCalled();
  });
});