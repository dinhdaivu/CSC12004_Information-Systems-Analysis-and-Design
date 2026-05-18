import { HandoverService } from '../services/handover.service';
import { supabaseServiceRole } from '../config/supabase';
import { InternalServerError, NotFoundError, ConflictError } from '../utils/errors';

jest.mock('../config/supabase', () => ({
  supabaseServiceRole: { from: jest.fn() }
}));

describe('HandoverService', () => {
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
      single: jest.fn()
    };
    mockChain.then = jest.fn((resolve: any) => resolve({ data: null, error: null }));
    (supabaseServiceRole!.from as jest.Mock).mockReturnValue(mockChain);
  });

  describe('list', () => {
    it('should list handovers with filters', async () => {
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ data: [{ id: '1' }], error: null }));
      const res = await HandoverService.list({ contractId: 'c1', customerId: 'cu1', status: 'pending' });
      expect(res).toHaveLength(1);
      expect(mockChain.eq).toHaveBeenCalledWith('contract_id', 'c1');
      expect(mockChain.eq).toHaveBeenCalledWith('customer_id', 'cu1');
      expect(mockChain.eq).toHaveBeenCalledWith('status', 'pending');
    });

    it('should throw InternalServerError on db error', async () => {
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ data: null, error: { message: 'err' } }));
      await expect(HandoverService.list({})).rejects.toThrow(InternalServerError);
    });
  });

  describe('getById', () => {
    it('should return handover', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: '1', contract: { start_date: '2026' } }, error: null });
      const res = await HandoverService.getById('1');
      expect(res.id).toBe('1');
    });

    it('should throw NotFoundError if not found', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      await expect(HandoverService.getById('1')).rejects.toThrow(NotFoundError);
    });

    it('should throw InternalServerError on db error', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'err' } });
      await expect(HandoverService.getById('1')).rejects.toThrow(InternalServerError);
    });
  });

  describe('create', () => {
    it('should create handover and items', async () => {
      mockChain.single.mockResolvedValueOnce({ data: { id: 'h1' }, error: null });
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: null }));
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'h1' }, error: null });

      const res = await HandoverService.create({
        contractId: 'c1',
        customerId: 'cu1',
        items: [{ itemName: 'key' }]
      });

      expect(res.id).toBe('h1');
      expect(mockChain.insert).toHaveBeenCalledTimes(2);
    });

    it('should throw InternalServerError if insert handover fails', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'err' } });
      await expect(HandoverService.create({ contractId: 'c1', customerId: 'cu1' })).rejects.toThrow(InternalServerError);
    });

    it('should throw InternalServerError if insert items fails', async () => {
      mockChain.single.mockResolvedValueOnce({ data: { id: 'h1' }, error: null });
      mockChain.then.mockImplementationOnce((resolve: any) => resolve({ error: { message: 'err' } }));
      await expect(HandoverService.create({ contractId: 'c1', customerId: 'cu1', items: [{ itemName: 'k' }] })).rejects.toThrow(InternalServerError);
    });
  });

  describe('complete', () => {
    it('should complete handover and update room/bed', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: '1', status: 'pending', manager_signature_url: 'http://sig/mgr.jpg', customer_signature_url: 'http://sig/cust.jpg', contract: { room_id: 'r1', bed_id: 'b1' } }, error: null });
      mockChain.then.mockImplementationOnce((res: any) => res({ error: null }));
      mockChain.then.mockImplementationOnce((res: any) => res({ error: null }));
      mockChain.then.mockImplementationOnce((res: any) => res({ error: null }));
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: '1', status: 'completed' }, error: null });

      const res = await HandoverService.complete('1', 'm1');
      expect(res.status).toBe('completed');
    });

    it('should throw ConflictError if not pending', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: '1', status: 'completed' }, error: null });
      await expect(HandoverService.complete('1', 'm1')).rejects.toThrow(ConflictError);
    });

    it('should throw InternalServerError if update fails', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: '1', status: 'pending' }, error: null });
      mockChain.then.mockImplementationOnce((res: any) => res({ error: { message: 'err' } }));
      await expect(HandoverService.complete('1', 'm1')).rejects.toThrow(InternalServerError);
    });
  });

  describe('cancel', () => {
    it('should cancel handover', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: '1', status: 'pending' }, error: null });
      mockChain.then.mockImplementationOnce((res: any) => res({ error: null }));
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: '1', status: 'cancelled' }, error: null });

      const res = await HandoverService.cancel('1');
      expect(res.status).toBe('cancelled');
    });

    it('should throw ConflictError if already completed', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: '1', status: 'completed' }, error: null });
      await expect(HandoverService.cancel('1')).rejects.toThrow(ConflictError);
    });

    it('should throw InternalServerError if update fails', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: { id: '1', status: 'pending' }, error: null });
      mockChain.then.mockImplementationOnce((res: any) => res({ error: { message: 'err' } }));
      await expect(HandoverService.cancel('1')).rejects.toThrow(InternalServerError);
    });
  });

  describe('addItem', () => {
    it('should add item', async () => {
      mockChain.single.mockResolvedValueOnce({ data: { id: 'i1', item_name: 'key' }, error: null });
      const res = await HandoverService.addItem('1', { itemName: 'key' });
      expect(res.id).toBe('i1');
    });

    it('should throw InternalServerError if insert fails', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'err' } });
      await expect(HandoverService.addItem('1', { itemName: 'key' })).rejects.toThrow(InternalServerError);
    });
  });

  describe('client config error', () => {
    it('should throw InternalServerError if client is null', async () => {
      jest.resetModules();
      jest.mock('../config/supabase', () => ({ supabaseServiceRole: null }));
      const { HandoverService } = require('../services/handover.service');
      await expect(HandoverService.list({})).rejects.toThrow('Supabase client not configured');
    });
  });
});