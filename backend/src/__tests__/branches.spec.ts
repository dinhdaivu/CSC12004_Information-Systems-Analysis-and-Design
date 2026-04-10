import request from 'supertest';
import express from 'express';
import branchRoutes from '../routes/branch.routes';

// 1. Bắt buộc phải Mock Supabase trước khi import file khác
jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn()
  }
}));

import { supabase } from '../config/supabase';

const app = express();
app.use(express.json());
app.use('/api/branches', branchRoutes);

describe('Branch Routes (Task 01-01)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/branches should return list of branches', async () => {
    // Giả lập data trả về thành công
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: [
          { id: '1', name: 'CN 1', address: 'Q1', description: 'Desc', hero_image_url: 'img.png', rooms: [{id: 1}] }
        ],
        error: null
      })
    }));

    const res = await request(app).get('/api/branches');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].heroImage).toBe('img.png');
  });

  it('GET /api/branches/:id should return a specific branch', async () => {
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'branch-1', name: 'CN 1', address: 'Q1', description: 'Desc', hero_image_url: 'img.png', rooms: [] },
        error: null
      })
    }));

    const res = await request(app).get('/api/branches/branch-1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('branch-1');
  });

  it('GET /api/branches/:id should handle 404 error from Supabase', async () => {
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      })
    }));

    const res = await request(app).get('/api/branches/invalid-id');
    expect(res.status).toBe(404);
  });

  it('GET /api/branches should handle 500 error gracefully', async () => {
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database connection failed')
      })
    }));

    const res = await request(app).get('/api/branches');
    expect(res.status).toBe(500);
  });
});