import { Request, Response } from 'express';
import { MyBookingService } from '../services/my-booking.service';
import { MyBookingController } from '../controllers/my-booking.controller';
import { supabase } from '../config/supabase';
import { ConflictError, NotFoundError } from '../utils/errors';

const mockRequest = (body: any = {}, params: any = {}, query: any = {}, user: any = undefined) => {
  return { body, params, query, user } as unknown as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

const mockNext = jest.fn();

const mockSupabaseQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
  then: jest.fn()
};

jest.mock('../config/supabase', () => ({
  supabase: { from: jest.fn(() => mockSupabaseQuery) }
}));

describe('MyBookings Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('MyBookingService', () => {
    
    describe('getMyBookings', () => {
      it('should fetch bookings with no filter', async () => {
        const mockData = [{ id: '1', status: 'requested' }];
        mockSupabaseQuery.then.mockImplementationOnce((resolve) => resolve({ data: mockData, error: null }));
        mockSupabaseQuery.order.mockResolvedValueOnce({ data: mockData, error: null } as never);

        const result = await MyBookingService.getMyBookings('cust-123', {});
        
        expect(supabase!.from).toHaveBeenCalledWith('rental_requests');
        expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('customer_id', 'cust-123');
        expect(result).toEqual(mockData);
      });

      it('should fetch bookings with "pending" filter', async () => {
        mockSupabaseQuery.then.mockImplementationOnce((resolve) => resolve({ data: [], error: null }));
        await MyBookingService.getMyBookings('cust-123', { status: 'pending' });
        expect(mockSupabaseQuery.in).toHaveBeenCalledWith('status', ['requested', 'reviewing']);
      });

      it('should fetch bookings with "confirmed" filter', async () => {
        mockSupabaseQuery.then.mockImplementationOnce((resolve) => resolve({ data: [], error: null }));
        await MyBookingService.getMyBookings('cust-123', { status: 'confirmed' });
        expect(mockSupabaseQuery.in).toHaveBeenCalledWith('status', ['viewing_scheduled', 'accepted']);
      });

      it('should fetch bookings with "cancelled" filter', async () => {
        mockSupabaseQuery.then.mockImplementationOnce((resolve) => resolve({ data: [], error: null }));
        await MyBookingService.getMyBookings('cust-123', { status: 'cancelled' });
        expect(mockSupabaseQuery.in).toHaveBeenCalledWith('status', ['cancelled', 'rejected']); 
      });

      it('should fallback to default if status filter is unknown', async () => {
        mockSupabaseQuery.then.mockImplementationOnce((resolve) => resolve({ data: [], error: null }));
        await MyBookingService.getMyBookings('cust-123', { status: 'some-random-status' });
        // Đã mock .is() thành công, verify xem code có nhảy vào nhánh gọi .is('id', null) không
        expect(mockSupabaseQuery.is).toHaveBeenCalledWith('id', null);
      });

      it('should return empty array if Supabase fails', async () => {
        mockSupabaseQuery.then.mockImplementationOnce((resolve) => resolve({ data: null, error: { message: 'DB Error' } }));
        const result = await MyBookingService.getMyBookings('cust-123', {});
        expect(result).toEqual([]); 
      });
    });

    describe('getBookingById', () => {
      it('should throw NotFoundError if booking does not exist', async () => {
        mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null } as never);
        await expect(MyBookingService.getBookingById('cust-123', 'invalid-id')).rejects.toThrow(NotFoundError);
      });

      it('should return data if booking exists', async () => {
        const mockData = { id: '1', status: 'requested' };
        mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: mockData, error: null } as never);
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

      // FIX LỖI 1: Đã xóa đi các test checkout thừa thãi
      it('should throw Error for unsupported action', async () => {
        jest.spyOn(MyBookingService, 'getBookingById').mockResolvedValue({ id: '1', status: 'requested' } as any);
        await expect(MyBookingService.handleAction('cust-123', '1', 'unknown-action' as any))
          .rejects.toThrow('Hành động không được hỗ trợ.');
      });
    });
  });

  describe('MyBookingController', () => {
    describe('getList', () => {
      it('should return 200 with bookings data', async () => {
        const req = mockRequest({}, {}, { status: 'pending' }, { id: 'cust-123' });
        const res = mockResponse();
        jest.spyOn(MyBookingService, 'getMyBookings').mockResolvedValue([{ id: '1' }] as any);
        
        await MyBookingController.getList(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
          success: true, 
          data: [{ id: '1' }], 
          count: 1 
        }));
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
      it('should return 200 with booking detail', async () => {
        const req = mockRequest({}, { id: '1' }, {}, { id: 'cust-123' });
        const res = mockResponse();
        jest.spyOn(MyBookingService, 'getBookingById').mockResolvedValue({ id: '1' } as any);
        
        await MyBookingController.getDetail(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { id: '1' } }));
      });
    });

    describe('performAction', () => {
      it('should call next(error) on exception', async () => {
        const req = mockRequest({ action: 'cancel' }, { id: '1' }, {}, { id: 'cust-123' }); 
        const res = mockResponse();
        jest.spyOn(MyBookingService, 'handleAction').mockRejectedValue(new Error('Service Exception'));
        
        await MyBookingController.performAction(req, res, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      });

      it('should return 200 when action is successful', async () => {
        const req = mockRequest({ action: 'cancel' }, { id: '1' }, {}, { id: 'cust-123' });
        const res = mockResponse();
        jest.spyOn(MyBookingService, 'handleAction').mockResolvedValue({ id: '1', status: 'cancelled' } as any);
        
        await MyBookingController.performAction(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
          success: true, 
          message: "Đã thực hiện hành động 'cancel' thành công.", 
          data: expect.any(Object) 
        }));
      });
    });
  });
});