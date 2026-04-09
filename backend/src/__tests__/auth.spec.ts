import request from 'supertest';

const signInWithPassword = jest.fn();
const resetPasswordForEmail = jest.fn();
const fromSelectSingle = jest.fn();
const fromSelectMaybeSingle = jest.fn();
const fromInsertSingle = jest.fn();
const fromUpdateSingle = jest.fn();

jest.mock('@config/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword,
      resetPasswordForEmail,
    },
  },
  supabaseServiceRole: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: fromSelectSingle,
          maybeSingle: fromSelectMaybeSingle,
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: fromInsertSingle,
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: fromUpdateSingle,
          })),
        })),
      })),
    })),
  },
}));

jest.mock('@utils/token', () => ({
  TokenUtils: {
    generateToken: jest.fn(() => 'signed-jwt'),
    verifyToken: jest.fn(() => ({
      id: 'user-1',
      email: 'user@example.com',
      role: 'customer',
    })),
  },
}));

import app from '../index';
import { TokenUtils } from '@utils/token';

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully and return a token with profile data', async () => {
    signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'user@example.com',
        },
      },
      error: null,
    });

    fromSelectMaybeSingle.mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'user@example.com',
        full_name: 'Test User',
        role: 'customer',
        status: 'active',
        created_at: '2026-04-09T00:00:00.000Z',
        updated_at: '2026-04-09T00:00:00.000Z',
      },
      error: null,
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'secret123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBe('signed-jwt');
    expect(response.body.data.user.email).toBe('user@example.com');
    expect(TokenUtils.generateToken).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'user@example.com',
      role: 'customer',
    });
  });

  it('should reject invalid login credentials', async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Invalid email or password');
  });

  it('should return current user profile for authenticated requests', async () => {
    fromSelectSingle.mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'user@example.com',
        full_name: 'Test User',
        role: 'customer',
        status: 'active',
        created_at: '2026-04-09T00:00:00.000Z',
        updated_at: '2026-04-09T00:00:00.000Z',
      },
      error: null,
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer signed-jwt');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.full_name).toBe('Test User');
  });

  it('should request a password reset email', async () => {
    resetPasswordForEmail.mockResolvedValue({
      error: null,
    });

    const response = await request(app).post('/api/auth/forgot-password').send({
      email: 'user@example.com',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(resetPasswordForEmail).toHaveBeenCalled();
  });

  it('should clear logout successfully for authenticated users', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer signed-jwt');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
