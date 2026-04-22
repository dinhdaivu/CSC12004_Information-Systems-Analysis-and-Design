import { MyBookingService } from '../services/my-booking.service';
import { supabase } from '../config/supabase';
import { ConflictError, NotFoundError } from '../utils/errors';

// 1. Khai báo 1 đối tượng mock chain
const mockSupabaseQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  single: jest.fn(),
  then: jest.fn() // Hỗ trợ Promise
};

// 2. Ghi đè module
jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockSupabaseQuery) // Trả về chain ở trên
  }
}));

describe('MyBookingService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyBookings', () => {
    it('should fetch bookings for a specific customer', async () => {
      const mockData = [{ id: '1', status: 'requested' }];
      
      // Giả lập kết quả trả về cuối cùng của chuỗi (hàm .order() hoặc .in() hoặc then())
      mockSupabaseQuery.then.mockImplementationOnce((cb) => cb({ data: mockData, error: null }));
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: mockData, error: null } as never);

      const result = await MyBookingService.getMyBookings('cust-123', {});
      
      expect(supabase!.from).toHaveBeenCalledWith('rental_requests');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('customer_id', 'cust-123');
      expect(result).toEqual(mockData);
    });
  });

  describe('getBookingById', () => {
    it('should throw NotFoundError if booking does not exist or does not belong to customer', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } } as never);

      await expect(MyBookingService.getBookingById('cust-123', 'invalid-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('handleAction (Cancel)', () => {
    it('should throw ConflictError if trying to cancel an un-cancellable booking', async () => {
      // Bỏ qua hàm getBookingById bên trong
      jest.spyOn(MyBookingService, 'getBookingById').mockResolvedValue({ id: '1', status: 'accepted' } as any);

      await expect(MyBookingService.handleAction('cust-123', '1', 'cancel'))
        .rejects
        .toThrow(ConflictError);
    });

    it('should update status to cancelled successfully', async () => {
      jest.spyOn(MyBookingService, 'getBookingById').mockResolvedValue({ id: '1', status: 'requested' } as any);
      
      const mockUpdatedData = { id: '1', status: 'cancelled' };
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: mockUpdatedData, error: null } as never);

      const result = await MyBookingService.handleAction('cust-123', '1', 'cancel');
      
      // Kiểm tra xem hàm update có được gọi đúng tham số không
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'cancelled' }));
      expect(result).toEqual(mockUpdatedData);
    });
  });
});