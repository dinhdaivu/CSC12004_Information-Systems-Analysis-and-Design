import request from 'supertest';
import express from 'express';
import branchRoutes from '../routes/branch.routes';
import { supabase } from '../config/supabase';

// Khởi tạo Mock cho Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/api/branches', branchRoutes);

describe('Branch Routes (Task 01-01)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET /api/branches ---
  it('GET /api/branches should return 200', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{ id: '1', name: 'CN 1', address: 'Q1', description: 'Desc', hero_image_url: 'img.png', rooms: [{id: 1}] }],
        error: null
      })
    });

    const res = await request(app).get('/api/branches');
    expect(res.status).toBe(200);
  });

  it('GET /api/branches should return 500 on db error', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: null, error: new Error('DB Error') })
    });

    const res = await request(app).get('/api/branches');
    expect(res.status).toBe(500);
  });

  // --- GET /api/branches/:id ---
  it('GET /api/branches/:id should return 200', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: { id: 'branch-1', name: 'CN 1', address: 'Q1', description: 'Desc', hero_image_url: 'img.png', rooms: [] },
      error: null
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({ single: mockSingle })
      })
    });

    const res = await request(app).get('/api/branches/branch-1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('branch-1');
  });

  it('GET /api/branches/:id should return 404 when not found', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' }
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({ single: mockSingle })
      })
    });

    const res = await request(app).get('/api/branches/invalid');
    expect(res.status).toBe(404);
  });

  it('GET /api/branches/:id should return 500 on db error', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: new Error('DB Error')
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({ single: mockSingle })
      })
    });

    const res = await request(app).get('/api/branches/error');
    expect(res.status).toBe(500);
  });
});