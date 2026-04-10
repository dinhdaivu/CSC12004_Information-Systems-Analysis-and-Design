import request from 'supertest';
import express from 'express';
import branchRoutes from '../routes/branch.routes';

const app = express();
app.use(express.json());
app.use('/api/branches', branchRoutes);

describe('Branch Routes (Task 01-01)', () => {
  let firstBranchId: string; // Biến lưu UUID thật lấy từ DB

  it('GET /api/branches should return list of branches', async () => {
    const res = await request(app).get('/api/branches');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
    
    // Lưu lại ID của chi nhánh đầu tiên để dùng cho test tiếp theo
    firstBranchId = res.body[0].id; 
  });

  it('GET /api/branches/:id should return a specific branch', async () => {
    // Gọi API với UUID thật
    const res = await request(app).get(`/api/branches/${firstBranchId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(firstBranchId);
    expect(res.body.name).toBeDefined();
  });

  it('GET /api/branches/:id should return 404 for invalid id', async () => {
    const res = await request(app).get('/api/branches/invalid-id');
    expect(res.status).toBe(404);
  });
});