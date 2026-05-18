import { CheckoutService } from '../services/checkout.service';
import { supabaseServiceRole } from '../config/supabase';
import { ConflictError, InternalServerError, NotFoundError, ValidationError } from '../utils/errors';

jest.mock('../config/supabase', () => ({
  supabaseServiceRole: { from: jest.fn() }
}));

const mockedSupabase = supabaseServiceRole as jest.Mocked<typeof supabaseServiceRole> & { from: jest.Mock };

const mockCheckoutRow = {
  id: 'chk-1',
  contract_id: 'ctr-1',
  customer_id: 'cus-1',
  requested_checkout_date: '2026-06-01T00:00:00.000Z',
  reason: 'moving',
  status: 'requested',
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: '2026-05-01T00:00:00.000Z',
  customer: { id: 'cus-1', full_name: 'John', email: 'j@j.com' },
  contract: {
    id: 'ctr-1',
    start_date: '2026-01-01T00:00:00.000Z',
    end_date: '2026-12-31T00:00:00.000Z',
    monthly_price: 2000000,
    status: 'active',
    room_id: 'rm-1',
    bed_id: 'bd-1',
    deposit_request_id: 'dep-1'
  },
  room: { room: { id: 'rm-1', room_number: '101', room_type: 'twin' } },
  bed: { bed: { id: 'bd-1', bed_number: 'B1' } }
};

describe('CheckoutService', () => {
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn(),
      single: jest.fn(),
      maybeSingle: jest.fn()
    };
    mockChain.then = jest.fn((resolve: any) => resolve({ data: null, error: null }));
    mockedSupabase.from.mockReturnValue(mockChain);
  });

  describe('listCheckoutRequests', () => {
    it('should list checkout requests with filters', async () => {
      mockChain.range.mockResolvedValueOnce({ data: [mockCheckoutRow], count: 1, error: null });
      mockChain.maybeSingle.mockResolvedValue({ data: null, error: null });

      const res = await CheckoutService.listCheckoutRequests({ page: 1, limit: 10, status: 'requested', customerId: 'cus-1' });
      expect(res.data).toHaveLength(1);
      expect(res.meta.total).toBe(1);
      expect(mockChain.eq).toHaveBeenCalledWith('status', 'requested');
      expect(mockChain.eq).toHaveBeenCalledWith('customer_id', 'cus-1');
    });

    it('should throw InternalServerError on db error', async () => {
      mockChain.range.mockResolvedValueOnce({ data: null, error: { message: 'db error' } });
      await expect(CheckoutService.listCheckoutRequests({ page: 1, limit: 10 })).rejects.toThrow(InternalServerError);
    });
  });

  describe('getCheckoutRequestById', () => {
    it('should return a checkout request', async () => {
      mockChain.maybeSingle
        .mockResolvedValueOnce({ data: mockCheckoutRow, error: null })
        .mockResolvedValueOnce({ data: { id: 'set-1', checkout_request_id: 'chk-1', final_amount: 100 }, error: null });

      const res = await CheckoutService.getCheckoutRequestById('chk-1');
      expect(res.id).toBe('chk-1');
      expect(res.settlement?.id).toBe('set-1');
    });

    it('should throw NotFoundError if not found', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      await expect(CheckoutService.getCheckoutRequestById('chk-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw InternalServerError on db error', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'err' } });
      await expect(CheckoutService.getCheckoutRequestById('chk-1')).rejects.toThrow(InternalServerError);
    });
  });

  describe('createCheckoutRequest', () => {
    const payload = { contract_id: 'ctr-1', customer_id: 'cus-1', requested_checkout_date: '2026-06-01', reason: 'moving' };

    it('should create a checkout request', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'ctr-1', status: 'active', customer_id: 'cus-1' }, error: null });
      mockChain.limit.mockResolvedValueOnce({ data: [], error: null });
      mockChain.single.mockResolvedValueOnce({ data: { id: 'chk-new' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: mockCheckoutRow, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const res = await CheckoutService.createCheckoutRequest(payload);
      expect(res.id).toBe('chk-1');
      expect(mockChain.insert).toHaveBeenCalledWith(expect.objectContaining({ contract_id: 'ctr-1' }));
    });

    it('should throw InternalServerError if contract fetch fails', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'err' } });
      await expect(CheckoutService.createCheckoutRequest(payload)).rejects.toThrow(InternalServerError);
    });

    it('should throw NotFoundError if contract not found', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      await expect(CheckoutService.createCheckoutRequest(payload)).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if contract terminated', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'ctr-1', status: 'terminated', customer_id: 'cus-1' }, error: null });
      await expect(CheckoutService.createCheckoutRequest(payload)).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if customer mismatch', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'ctr-1', status: 'active', customer_id: 'cus-other' }, error: null });
      await expect(CheckoutService.createCheckoutRequest(payload)).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if active checkout exists', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'ctr-1', status: 'active', customer_id: 'cus-1' }, error: null });
      mockChain.limit.mockResolvedValueOnce({ data: [{ id: 'chk-existing' }], error: null });
      await expect(CheckoutService.createCheckoutRequest(payload)).rejects.toThrow(ConflictError);
    });

    it('should throw ValidationError if date invalid', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'ctr-1', status: 'active', customer_id: 'cus-1' }, error: null });
      mockChain.limit.mockResolvedValueOnce({ data: [], error: null });
      await expect(CheckoutService.createCheckoutRequest({ ...payload, requested_checkout_date: 'invalid' })).rejects.toThrow(ValidationError);
    });

    it('should throw InternalServerError on insert error', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'ctr-1', status: 'active', customer_id: 'cus-1' }, error: null });
      mockChain.limit.mockResolvedValueOnce({ data: [], error: null });
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'err' } });
      await expect(CheckoutService.createCheckoutRequest(payload)).rejects.toThrow(InternalServerError);
    });
  });

  describe('confirmCheckoutRequest', () => {
    it('should confirm checkout request', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: mockCheckoutRow, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: null }));
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { ...mockCheckoutRow, status: 'confirmed' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const res = await CheckoutService.confirmCheckoutRequest('chk-1');
      expect(res.status).toBe('confirmed');
    });

    it('should throw ConflictError if not requested', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { ...mockCheckoutRow, status: 'confirmed' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      await expect(CheckoutService.confirmCheckoutRequest('chk-1')).rejects.toThrow(ConflictError);
    });

    it('should throw InternalServerError on update error', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: mockCheckoutRow, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: { message: 'update error' } }));
      await expect(CheckoutService.confirmCheckoutRequest('chk-1')).rejects.toThrow(InternalServerError);
    });
  });

  describe('getSettlementByCheckoutId', () => {
    it('should return null if no settlement', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      const res = await CheckoutService.getSettlementByCheckoutId('chk-1');
      expect(res).toBeNull();
    });

    it('should throw InternalServerError on db error', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'err' } });
      await expect(CheckoutService.getSettlementByCheckoutId('chk-1')).rejects.toThrow(InternalServerError);
    });
  });

  describe('createSettlement', () => {
    const payload = { deduction: 100, payment_method: 'cash' as any, notes: 'n' };

    beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2026-06-01T00:00:00Z')));
    afterAll(() => jest.useRealTimers());

    it('should throw ConflictError if checkout not confirmed', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: mockCheckoutRow, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      await expect(CheckoutService.createSettlement('chk-1', payload)).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if settlement exists', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { ...mockCheckoutRow, status: 'confirmed' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'set-1', status: 'draft' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'set-1', status: 'draft' }, error: null });
      await expect(CheckoutService.createSettlement('chk-1', payload)).rejects.toThrow(ConflictError);
    });

    it('should create settlement with proper refund rate calculations', async () => {
      // test rate < 6 months (0.5)
      const currentContract = { ...mockCheckoutRow.contract, start_date: '2026-04-01T00:00:00.000Z', end_date: '2026-12-31T00:00:00.000Z' };
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { ...mockCheckoutRow, status: 'confirmed', contract: currentContract }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'dep-1', amount: 2000000, status: 'paid' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // aggregateInspectionDeduction
      mockChain.single.mockResolvedValueOnce({ data: { id: 'set-1' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'set-1', status: 'draft' }, error: null });

      const res = await CheckoutService.createSettlement('chk-1', payload);
      expect(res.id).toBe('set-1');
      expect(mockChain.insert).toHaveBeenCalledWith(expect.objectContaining({ refund_rate: 0.5, final_amount: 999900 })); // (2m * 0.5) - 100
    });

    it('should calculate 1.0 refund rate if contract ended', async () => {
      const endedContract = { ...mockCheckoutRow.contract, start_date: '2026-01-01T00:00:00.000Z', end_date: '2026-05-01T00:00:00.000Z' };
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { ...mockCheckoutRow, status: 'confirmed', contract: endedContract }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'dep-1', amount: 2000000, status: 'paid' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // aggregateInspectionDeduction
      mockChain.single.mockResolvedValueOnce({ data: { id: 'set-1' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'set-1', status: 'draft' }, error: null });

      await CheckoutService.createSettlement('chk-1', payload);
      expect(mockChain.insert).toHaveBeenCalledWith(expect.objectContaining({ refund_rate: 1.0 }));
    });

    it('should throw InternalServerError if retrieve fails after insert', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { ...mockCheckoutRow, status: 'confirmed' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'dep-1', amount: 2000000, status: 'paid' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // aggregateInspectionDeduction
      mockChain.single.mockResolvedValueOnce({ data: { id: 'set-1' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // fails retrieve

      await expect(CheckoutService.createSettlement('chk-1', payload)).rejects.toThrow(InternalServerError);
    });

    it('should throw ConflictError if checkout has no contract', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { ...mockCheckoutRow, status: 'confirmed', contract: null }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      await expect(CheckoutService.createSettlement('chk-1', payload)).rejects.toThrow(ConflictError);
    });
  });

  describe('updateSettlementDeduction', () => {
    it('should update deduction', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'set-1', status: 'draft', deposit_total: 2000000, refund_rate: 1 }, error: null });
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: null }));
      mockChain.single.mockResolvedValueOnce({ data: { id: 'set-1', deduction: 500, final_amount: 1999500 }, error: null });

      const res = await CheckoutService.updateSettlementDeduction('set-1', { deduction: 500 });
      expect(res.id).toBe('set-1');
    });

    it('should throw NotFoundError if not found', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      await expect(CheckoutService.updateSettlementDeduction('set-1', { deduction: 500 })).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if not draft', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'set-1', status: 'confirmed' }, error: null });
      await expect(CheckoutService.updateSettlementDeduction('set-1', { deduction: 500 })).rejects.toThrow(ConflictError);
    });

    it('should throw InternalServerError on update error', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'set-1', status: 'draft', deposit_total: 2000000, refund_rate: 1 }, error: null });
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: { message: 'err' } }));
      await expect(CheckoutService.updateSettlementDeduction('set-1', { deduction: 500 })).rejects.toThrow(InternalServerError);
    });
  });

  describe('confirmSettlement', () => {
    it('should confirm settlement', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'set-1', status: 'draft' }, error: null });
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: null }));
      mockChain.single.mockResolvedValueOnce({ data: { id: 'set-1', status: 'confirmed' }, error: null });

      const res = await CheckoutService.confirmSettlement('set-1');
      expect(res.status).toBe('confirmed');
    });

    it('should throw ConflictError if not draft', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'set-1', status: 'confirmed' }, error: null });
      await expect(CheckoutService.confirmSettlement('set-1')).rejects.toThrow(ConflictError);
    });
  });

  describe('completeSettlement', () => {
    it('should complete settlement as refunded', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({
        data: { id: 'set-1', status: 'confirmed', final_amount: 1000000, deposit_request_id: 'dep-1', customer_signature_url: 'http://sig/cust.jpg', checkout_request: { customer_id: 'cus-1' }, contract_id: 'ctr-1' },
        error: null
      });
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: null })); // update settlement
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: null })); // insert payment
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: null })); // update deposit
      mockChain.single.mockResolvedValueOnce({ data: { id: 'set-1', status: 'refunded' }, error: null });

      const res = await CheckoutService.completeSettlement('set-1', { payment_method: 'transfer' });
      expect(res.status).toBe('refunded');
    });

    it('should complete settlement as paid if negative final amount', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({
        data: { id: 'set-1', status: 'confirmed', final_amount: -500000, deposit_request_id: 'dep-1', customer_signature_url: 'http://sig/cust.jpg', checkout_request: { customer_id: 'cus-1' }, contract_id: 'ctr-1' },
        error: null
      });
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: null })); // update settlement
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: null })); // insert payment
      mockChain.single.mockResolvedValueOnce({ data: { id: 'set-1', status: 'paid' }, error: null });

      const res = await CheckoutService.completeSettlement('set-1', { payment_method: 'transfer' });
      expect(res.status).toBe('paid');
    });

    it('should throw ConflictError if not confirmed', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'set-1', status: 'draft' }, error: null });
      await expect(CheckoutService.completeSettlement('set-1', { payment_method: 'cash' })).rejects.toThrow(ConflictError);
    });
  });

  describe('completeCheckout & cancelCheckoutRequest', () => {
    it('should complete checkout and update room/bed', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { ...mockCheckoutRow, status: 'confirmed' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { status: 'refunded' }, error: null });
      
      mockChain.then.mockImplementation((resolve: any) => resolve({ error: null })); // handles multiple updates
      
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { ...mockCheckoutRow, status: 'completed' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { status: 'refunded' }, error: null });

      const res = await CheckoutService.completeCheckout('chk-1');
      expect(res.status).toBe('completed');
    });

    it('should throw ConflictError if settlement is not fully processed', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { ...mockCheckoutRow, status: 'confirmed' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { status: 'draft' }, error: null });
      await expect(CheckoutService.completeCheckout('chk-1')).rejects.toThrow(ConflictError);
    });

    it('should cancel checkout request', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: mockCheckoutRow, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: null }));
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { ...mockCheckoutRow, status: 'cancelled' }, error: null });
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const res = await CheckoutService.cancelCheckoutRequest('chk-1');
      expect(res.status).toBe('cancelled');
    });
  });
});

describe('CheckoutService Config Error', () => {
  it('should throw InternalServerError when supabaseServiceRole is null', async () => {
    jest.resetModules();
    jest.mock('../config/supabase', () => ({ supabaseServiceRole: null }));
    const { CheckoutService } = require('../services/checkout.service');
    await expect(CheckoutService.getCheckoutRequestById('1')).rejects.toThrow('Supabase service role client is not configured');
  });
});