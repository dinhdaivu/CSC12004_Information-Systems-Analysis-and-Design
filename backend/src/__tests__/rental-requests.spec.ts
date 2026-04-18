import request from 'supertest';
import express from 'express';
import rentalRequestRoutes from '../routes/rental-request.routes';
import { supabase } from '../config/supabase';
import { TokenUtils } from '../utils/token';

jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

jest.mock('../utils/token', () => ({
  TokenUtils: {
    verifyToken: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/api/rental-requests', rentalRequestRoutes);

describe('Rental Request Routes (Task 01-03)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/rental-requests', () => {
    it('should create a new rental request and return 201', async () => {
      (TokenUtils.verifyToken as jest.Mock).mockReturnValue({
        id: 'customer-123',
        email: 'customer@example.com',
        role: 'customer'
      });

      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'req-1', customer_id: 'customer-123', room_id: 'room-1', status: 'requested' },
        error: null
      });

      // SỬ DỤNG DẤU ! ĐỂ FIX LỖI TYPE
      (supabase!.from as jest.Mock).mockImplementation(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockSingle
          })
        })
      }));

      const res = await request(app)
        .post('/api/rental-requests')
        .set('Authorization', 'Bearer valid-token')
        .send({
          room_id: 'room-1',
          expected_move_in_date: '2026-05-01',
          rental_duration_months: 6,
          people_count: 2,
          budget_max: 5000000,
          note: 'Test request'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(supabase!.from).toHaveBeenCalledWith('rental_requests');
    });

    it('should return 401 if user is not authenticated', async () => {
      (TokenUtils.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = await request(app)
        .post('/api/rental-requests')
        .set('Authorization', 'Bearer invalid-token')
        .send({ room_id: 'room-1' });

      expect(res.status).toBe(401);
    });

    it('should return 500 on database error during insert', async () => {
      (TokenUtils.verifyToken as jest.Mock).mockReturnValue({
        id: 'customer-123',
        role: 'customer'
      });

      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('DB Insert Error')
      });

      (supabase!.from as jest.Mock).mockImplementation(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockSingle
          })
        })
      }));

      const res = await request(app)
        .post('/api/rental-requests')
        .set('Authorization', 'Bearer valid-token')
        .send({ room_id: 'room-1', expected_move_in_date: '2026-05-01', rental_duration_months: 6, people_count: 1 });

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/rental-requests/my-requests', () => {
    it('should return a list of rental requests', async () => {
      (TokenUtils.verifyToken as jest.Mock).mockReturnValue({
        id: 'customer-123',
        role: 'customer'
      });

      const mockOrder = jest.fn().mockResolvedValue({
        data: [{ id: 'req-1', room_id: 'room-1', status: 'requested' }],
        error: null
      });

      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });

      (supabase!.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: mockEq
        })
      }));

      const res = await request(app)
        .get('/api/rental-requests/my-requests')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(mockEq).toHaveBeenCalledWith('customer_id', 'customer-123');
    });
  });
});