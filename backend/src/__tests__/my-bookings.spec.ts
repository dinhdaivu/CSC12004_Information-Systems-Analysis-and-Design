import { Request, Response } from 'express';
import { MyBookingService } from '../services/my-booking.service';
import { MyBookingController } from '../controllers/my-booking.controller';
import { supabase } from '../config/supabase';
import { ConflictError, NotFoundError } from '../utils/errors';

// 1. MOCK EXPRESS REQUEST & RESPONSE
const mockRequest = (body = {}, params = {}, query = {}, user = {}) => {
  return {
    body,
    params,
    query,
    user
  } as unknown as Request;
};

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = jest.fn();

// 2. MOCK SUPABASE CLIENT CHAIN
const mockSupabaseQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  single: jest.fn(),
  then: jest.fn()
};

jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockSupabaseQuery)
  }
}));

describe('MyBookings Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==============================================================
  // TDD CHO MY-BOOKING.SERVICE.TS
  // ==============================================================
  describe('MyBookingService', () => {
    
    describe('getMyBookings', () => {
      it('should fetch bookings with no filter', async () => {
        const mockData = [{ id: '1', status: 'requested' }];
        mockSupabaseQuery.then.mockImplementationOnce((cb) => cb({ data: mockData, error: null }));
        mockSupabaseQuery.order.mockResolvedValueOnce({ data: mockData, error: null } as never);

        const result = await MyBookingService.getMyBookings('cust-123', {});
        
        expect(supabase!.from).toHaveBeenCalledWith('rental_requests');
        expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('customer_id', 'cust-123');
        expect(result).toEqual(mockData);
      });

      it('should fetch bookings with "pending" filter', async () => {
        mockSupabaseQuery.then.mockImplementationOnce((cb) => cb({ data: [], error: null }));
        await MyBookingService.getMyBookings('cust-123', { status: 'pending' });
        expect(mockSupabaseQuery.in).toHaveBeenCalledWith('status', ['requested', 'reviewing']);
      });

      it('should fetch bookings with "confirmed" filter', async () => {
        mockSupabaseQuery.then.mockImplementationOnce((cb) => cb({ data: [], error: null }));
        await MyBookingService.getMyBookings('cust-123', { status: 'confirmed' });
        expect(mockSupabaseQuery.in).toHaveBeenCalledWith('status', ['viewing_scheduled', 'accepted']);
      });

      it('should fetch bookings with "cancelled" filter', async () => {
        mockSupabaseQuery.then.mockImplementationOnce((cb) => cb({ data: [], error: null }));
        await MyBookingService.getMyBookings('cust-123', { status: 'cancelled' });
        expect(mockSupabaseQuery.in).toHaveBeenCalledWith('status', ['rejected', 'cancelled']);
      });

      it('should throw error if Supabase fails', async () => {
        mockSupabaseQuery.then.mockImplementationOnce((cb) => cb({ data: null, error: { message: 'DB Error' } }));
        await expect(MyBookingService.getMyBookings('cust-123', {})).rejects.toThrow('DB Error');
      });
    });

    describe('getBookingById', () => {
      it('should throw NotFoundError if booking does not exist', async () => {
        mockSupabaseQuery.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } } as never);
        await expect(MyBookingService.getBookingById('cust-123', 'invalid-id')).rejects.toThrow(NotFoundError);
      });

      it('should return data if booking exists', async () => {
        const mockData = { id: '1', status: 'requested' };
        mockSupabaseQuery.single.mockResolvedValueOnce({ data: mockData, error: null } as never);
        const result = await MyBookingService.getBookingById('cust-123', '1');
        expect(result).toEqual(mockData);
      });
    });

    describe('handleAction', () => {
      it('should throw ConflictError if state is not allowed to be cancelled', async () => {
        jest.spyOn(MyBookingService, 'getBookingById').mockResolvedValue({ id: '1', status: 'accepted' } as any);
        await expect(MyBookingService.handleAction('cust-123', '1', 'cancel')).rejects.toThrow(ConflictError);
      });

      it('should update status to cancelled if state is valid', async () => {
        jest.spyOn(MyBookingService, 'getBookingById').mockResolvedValue({ id: '1', status: 'requested' } as any);
        const mockUpdatedData = { id: '1', status: 'cancelled' };
        mockSupabaseQuery.single.mockResolvedValueOnce({ data: mockUpdatedData, error: null } as never);

        const result = await MyBookingService.handleAction('cust-123', '1', 'cancel');
        expect(mockSupabaseQuery.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'cancelled' }));
        expect(result).toEqual(mockUpdatedData);
      });

      it('should throw Error for unsupported action', async () => {
        jest.spyOn(MyBookingService, 'getBookingById').mockResolvedValue({ id: '1', status: 'requested' } as any);
        await expect(MyBookingService.handleAction('cust-123', '1', 'unknown-action' as any)).rejects.toThrow('Unsupported action');
      });
    });
  });

  // ==============================================================
  // TDD CHO MY-BOOKING.CONTROLLER.TS
  // ==============================================================
  describe('MyBookingController', () => {

    describe('getList', () => {
      it('should return 401 if user is not authenticated', async () => {
        const req = mockRequest({}, {}, {}, null); // Không có req.user
        const res = mockResponse();
        await MyBookingController.getList(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(401);
      });

      it('should return 200 with bookings data', async () => {
        const req = mockRequest({}, {}, { status: 'pending' }, { id: 'cust-123' });
        const res = mockResponse();
        jest.spyOn(MyBookingService, 'getMyBookings').mockResolvedValue([{ id: '1' }] as any);
        
        await MyBookingController.getList(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: [{ id: '1' }] });
      });

      it('should call next(error) on exception', async () => {
        const req = mockRequest({}, {}, {}, { id: 'cust-123' });
        const res = mockResponse();
        jest.spyOn(MyBookingService, 'getMyBookings').mockRejectedValue(new Error('DB error'));
        
        await MyBookingController.getList(req, res, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    describe('getDetail', () => {
      it('should return 401 if user is not authenticated', async () => {
        const req = mockRequest({}, { id: '1' }, {}, null);
        const res = mockResponse();
        await MyBookingController.getDetail(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(401);
      });

      it('should return 400 if id is missing', async () => {
        const req = mockRequest({}, {}, {}, { id: 'cust-123' }); // Thiếu req.params.id
        const res = mockResponse();
        await MyBookingController.getDetail(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 200 with booking detail', async () => {
        const req = mockRequest({}, { id: '1' }, {}, { id: 'cust-123' });
        const res = mockResponse();
        jest.spyOn(MyBookingService, 'getBookingById').mockResolvedValue({ id: '1' } as any);
        
        await MyBookingController.getDetail(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: { id: '1' } });
      });
    });

    describe('performAction', () => {
      it('should return 400 if id or action is missing', async () => {
        const req = mockRequest({ action: 'cancel' }, {}, {}, { id: 'cust-123' }); // Thiếu param.id
        const res = mockResponse();
        await MyBookingController.performAction(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 200 when action is successful', async () => {
        const req = mockRequest({ action: 'cancel' }, { id: '1' }, {}, { id: 'cust-123' });
        const res = mockResponse();
        jest.spyOn(MyBookingService, 'handleAction').mockResolvedValue({ id: '1', status: 'cancelled' } as any);
        
        await MyBookingController.performAction(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Action cancel performed successfully', data: expect.any(Object) });
      });
    });
    
  });
});