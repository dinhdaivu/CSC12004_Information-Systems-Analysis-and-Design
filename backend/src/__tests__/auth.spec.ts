import request from 'supertest';

const signInWithPassword = jest.fn();
const signUp = jest.fn();
const verifyOtp = jest.fn();
const resend = jest.fn();
const resetPasswordForEmail = jest.fn();
const updateUserById = jest.fn();
const fromSelectSingle = jest.fn();
const fromSelectMaybeSingle = jest.fn();
const fromInsertSingle = jest.fn();
const fromUpdateSingle = jest.fn();

jest.mock('@config/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword,
      signUp,
      verifyOtp,
      resend,
      resetPasswordForEmail,
    },
  },
  supabaseServiceRole: {
    auth: {
      admin: {
        updateUserById,
      },
    },
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

  it('should register successfully and return the pending email', async () => {
    signUp.mockResolvedValue({
      data: {
        user: {
          id: 'user-2',
          email: 'new@example.com',
          identities: [{ identity_id: 'identity-1' }],
        },
      },
      error: null,
    });

    fromSelectMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    fromInsertSingle.mockResolvedValue({
      data: {
        id: 'user-2',
        email: 'new@example.com',
        full_name: 'new',
        role: 'customer',
        status: 'active',
        created_at: '2026-04-09T00:00:00.000Z',
        updated_at: '2026-04-09T00:00:00.000Z',
      },
      error: null,
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'new@example.com',
      password: 'secret123',
      confirm_password: 'secret123',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('new@example.com');
    expect(signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'secret123',
    });
  });

  it('should reject duplicate registration emails', async () => {
    signUp.mockResolvedValue({
      data: {
        user: {
          id: 'user-2',
          email: 'new@example.com',
          identities: [],
        },
      },
      error: null,
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'new@example.com',
      password: 'secret123',
      confirm_password: 'secret123',
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('An account with this email already exists');
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

  it('should verify a signup code successfully', async () => {
    verifyOtp.mockResolvedValue({
      data: {
        user: {
          id: 'user-3',
          email: 'verify@example.com',
        },
      },
      error: null,
    });

    fromSelectMaybeSingle.mockResolvedValue({
      data: {
        id: 'user-3',
        email: 'verify@example.com',
        full_name: 'verify',
        role: 'customer',
        status: 'active',
        created_at: '2026-04-09T00:00:00.000Z',
        updated_at: '2026-04-09T00:00:00.000Z',
      },
      error: null,
    });

    const response = await request(app).post('/api/auth/verify-email').send({
      email: 'verify@example.com',
      code: '123456',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(verifyOtp).toHaveBeenCalledWith({
      email: 'verify@example.com',
      token: '123456',
      type: 'email',
    });
  });

  it('should resend signup verification codes', async () => {
    resend.mockResolvedValue({
      error: null,
    });

    const response = await request(app).post('/api/auth/resend-verification').send({
      email: 'verify@example.com',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'verify@example.com',
    });
  });

  it('should verify a recovery code and update the password', async () => {
    verifyOtp.mockResolvedValue({
      data: {
        user: {
          id: 'user-4',
          email: 'recover@example.com',
        },
      },
      error: null,
    });

    updateUserById.mockResolvedValue({
      data: {
        id: 'user-4',
      },
      error: null,
    });

    fromSelectMaybeSingle.mockResolvedValue({
      data: {
        id: 'user-4',
        email: 'recover@example.com',
        full_name: 'recover',
        role: 'customer',
        status: 'active',
        created_at: '2026-04-09T00:00:00.000Z',
        updated_at: '2026-04-09T00:00:00.000Z',
      },
      error: null,
    });

    const response = await request(app).post('/api/auth/reset-password/verify').send({
      email: 'recover@example.com',
      code: '654321',
      password: 'newsecret123',
      confirm_password: 'newsecret123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(verifyOtp).toHaveBeenCalledWith({
      email: 'recover@example.com',
      token: '654321',
      type: 'recovery',
    });
    expect(updateUserById).toHaveBeenCalledWith('user-4', {
      password: 'newsecret123',
    });
  });

  it('should clear logout successfully for authenticated users', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer signed-jwt');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
