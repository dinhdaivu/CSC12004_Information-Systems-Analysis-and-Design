import { AuthService } from '@services/auth.service';
import { TokenUtils } from '@utils/token';
import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@utils/errors';

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

let mockSupabase: unknown;
let mockSupabaseServiceRole: unknown;

jest.mock('@config/supabase', () => ({
  get supabase() {
    return mockSupabase;
  },
  get supabaseServiceRole() {
    return mockSupabaseServiceRole;
  },
}));

jest.mock('@utils/token', () => ({
  TokenUtils: {
    generateToken: jest.fn(() => 'signed-jwt'),
  },
}));

const createServiceRoleMock = () => ({
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
});

describe('AuthService', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        signInWithPassword,
        signUp,
        verifyOtp,
        resend,
        resetPasswordForEmail,
      },
    };

    mockSupabaseServiceRole = createServiceRoleMock();
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should validate required register fields', async () => {
    await expect(AuthService.register({
      email: '',
      password: '',
      confirm_password: '',
    })).rejects.toThrow(ValidationError);
  });

  it('should validate register password length', async () => {
    await expect(AuthService.register({
      email: 'user@example.com',
      password: '12345',
      confirm_password: '12345',
    })).rejects.toThrow('Password must be at least 6 characters');
  });

  it('should validate register password confirmation', async () => {
    await expect(AuthService.register({
      email: 'user@example.com',
      password: 'secret123',
      confirm_password: 'secret456',
    })).rejects.toThrow('Passwords do not match');
  });

  it('should reject duplicate registration errors returned by auth provider', async () => {
    signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    });

    await expect(AuthService.register({
      email: 'user@example.com',
      password: 'secret123',
      confirm_password: 'secret123',
    })).rejects.toThrow(ConflictError);
  });

  it('should wrap unexpected registration provider errors', async () => {
    signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Supabase is unavailable' },
    });

    await expect(AuthService.register({
      email: 'user@example.com',
      password: 'secret123',
      confirm_password: 'secret123',
    })).rejects.toThrow(InternalServerError);
  });

  it('should log register diagnostics outside test mode and fail when auth user is missing', async () => {
    process.env.NODE_ENV = 'development';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    await expect(AuthService.register({
      email: 'user@example.com',
      password: 'secret123',
      confirm_password: 'secret123',
    })).rejects.toThrow('Failed to register account');

    expect(warnSpy).toHaveBeenCalledWith('[AuthService.register] Attempting signup', {
      email: 'us**@example.com',
    });
    expect(errorSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should log successful register diagnostics outside test mode', async () => {
    process.env.NODE_ENV = 'development';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    signUp.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          identities: [{ identity_id: 'identity-1' }],
        },
      },
      error: null,
    });

    await expect(AuthService.register({
      email: 'user@example.com',
      password: 'secret123',
      confirm_password: 'secret123',
    })).resolves.toEqual({ email: 'user@example.com' });

    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });

  it('should validate required login fields', async () => {
    await expect(AuthService.login({
      email: '',
      password: '',
    })).rejects.toThrow('Email and password are required');
  });

  it('should reject login for inactive users', async () => {
    signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'inactive@example.com',
        },
      },
      error: null,
    });
    fromSelectMaybeSingle.mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'inactive@example.com',
        full_name: 'Inactive User',
        role: 'customer',
        status: 'inactive',
        created_at: '2026-04-09T00:00:00.000Z',
        updated_at: '2026-04-09T00:00:00.000Z',
      },
      error: null,
    });

    await expect(AuthService.login({
      email: 'inactive@example.com',
      password: 'secret123',
    })).rejects.toThrow(ForbiddenError);
  });

  it('should create a profile on first successful login', async () => {
    signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-2',
          email: 'new@example.com',
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

    const result = await AuthService.login({
      email: 'new@example.com',
      password: 'secret123',
    });

    expect(result.token).toBe('signed-jwt');
    expect(result.user.email).toBe('new@example.com');
    expect(TokenUtils.generateToken).toHaveBeenCalledWith({
      id: 'user-2',
      email: 'new@example.com',
      role: 'customer',
    });
  });

  it('should fail login when loading the profile errors', async () => {
    signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-3',
          email: 'broken@example.com',
        },
      },
      error: null,
    });
    fromSelectMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'profile lookup failed' },
    });

    await expect(AuthService.login({
      email: 'broken@example.com',
      password: 'secret123',
    })).rejects.toThrow('profile lookup failed');
  });

  it('should fail login when creating the profile errors', async () => {
    signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-4',
          email: 'broken-create@example.com',
        },
      },
      error: null,
    });
    fromSelectMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });
    fromInsertSingle.mockResolvedValue({
      data: null,
      error: { message: 'insert failed' },
    });

    await expect(AuthService.login({
      email: 'broken-create@example.com',
      password: 'secret123',
    })).rejects.toThrow('insert failed');
  });

  it('should validate forgot password input', async () => {
    await expect(AuthService.forgotPassword({ email: '' })).rejects.toThrow('Email is required');
  });

  it('should surface forgot password provider errors', async () => {
    resetPasswordForEmail.mockResolvedValue({
      error: { message: 'Reset failed' },
    });

    await expect(AuthService.forgotPassword({ email: 'user@example.com' })).rejects.toThrow('Reset failed');
  });

  it('should validate verify email input', async () => {
    await expect(AuthService.verifyEmail({
      email: '',
      code: '',
    })).rejects.toThrow('Email and verification code are required');
  });

  it('should reject invalid verification codes', async () => {
    verifyOtp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Bad code' },
    });

    await expect(AuthService.verifyEmail({
      email: 'user@example.com',
      code: '123456',
    })).rejects.toThrow(UnauthorizedError);
  });

  it('should reject verification for inactive users', async () => {
    verifyOtp.mockResolvedValue({
      data: {
        user: {
          id: 'user-6',
          email: 'inactive@example.com',
        },
      },
      error: null,
    });
    fromSelectMaybeSingle.mockResolvedValue({
      data: {
        id: 'user-6',
        email: 'inactive@example.com',
        full_name: 'Inactive User',
        role: 'customer',
        status: 'inactive',
        created_at: '2026-04-09T00:00:00.000Z',
        updated_at: '2026-04-09T00:00:00.000Z',
      },
      error: null,
    });

    await expect(AuthService.verifyEmail({
      email: 'inactive@example.com',
      code: '123456',
    })).rejects.toThrow(ForbiddenError);
  });

  it('should validate resend verification input', async () => {
    await expect(AuthService.resendVerification({ email: '' })).rejects.toThrow('Email is required');
  });

  it('should surface resend verification provider errors', async () => {
    resend.mockResolvedValue({
      error: { message: 'Resend failed' },
    });

    await expect(AuthService.resendVerification({ email: 'user@example.com' })).rejects.toThrow('Resend failed');
  });

  it('should validate reset password input', async () => {
    await expect(AuthService.resetPasswordWithCode({
      email: '',
      code: '',
      password: '',
      confirm_password: '',
    })).rejects.toThrow('Email, verification code, and password are required');
  });

  it('should validate reset password length and confirmation', async () => {
    await expect(AuthService.resetPasswordWithCode({
      email: 'user@example.com',
      code: '123456',
      password: '12345',
      confirm_password: '12345',
    })).rejects.toThrow('Password must be at least 6 characters');

    await expect(AuthService.resetPasswordWithCode({
      email: 'user@example.com',
      code: '123456',
      password: 'secret123',
      confirm_password: 'secret456',
    })).rejects.toThrow('Passwords do not match');
  });

  it('should reject invalid recovery codes', async () => {
    verifyOtp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Bad recovery code' },
    });

    await expect(AuthService.resetPasswordWithCode({
      email: 'user@example.com',
      code: '123456',
      password: 'secret123',
      confirm_password: 'secret123',
    })).rejects.toThrow(UnauthorizedError);
  });

  it('should surface password update provider errors', async () => {
    verifyOtp.mockResolvedValue({
      data: {
        user: {
          id: 'user-5',
          email: 'user@example.com',
        },
      },
      error: null,
    });
    updateUserById.mockResolvedValue({
      data: null,
      error: { message: 'Update failed' },
    });

    await expect(AuthService.resetPasswordWithCode({
      email: 'user@example.com',
      code: '123456',
      password: 'secret123',
      confirm_password: 'secret123',
    })).rejects.toThrow('Update failed');
  });

  it('should reject getCurrentUser when the profile is missing', async () => {
    fromSelectSingle.mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    });

    await expect(AuthService.getCurrentUser('missing-user')).rejects.toThrow(NotFoundError);
  });

  it('should validate updateCurrentUser input', async () => {
    await expect(AuthService.updateCurrentUser('user-1', {})).rejects.toThrow(
      'At least one profile field must be provided'
    );
  });

  it('should surface updateCurrentUser persistence errors', async () => {
    fromUpdateSingle.mockResolvedValue({
      data: null,
      error: { message: 'Update profile failed' },
    });

    await expect(AuthService.updateCurrentUser('user-1', {
      full_name: 'Updated Name',
    })).rejects.toThrow('Update profile failed');
  });

  it('should update the current user profile', async () => {
    fromUpdateSingle.mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'user@example.com',
        full_name: 'Updated Name',
        phone_number: '0123456789',
        avatar_url: null,
        gender: 'male',
        nationality: 'VN',
        role: 'customer',
        status: 'active',
        created_at: '2026-04-09T00:00:00.000Z',
        updated_at: '2026-04-10T00:00:00.000Z',
      },
      error: null,
    });

    const result = await AuthService.updateCurrentUser('user-1', {
      full_name: 'Updated Name',
      phone_number: '0123456789',
      gender: 'male',
      nationality: 'VN',
    });

    expect(result.full_name).toBe('Updated Name');
    expect(result.phone_number).toBe('0123456789');
    expect(result.gender).toBe('male');
    expect(result.nationality).toBe('VN');
  });

  it('should fail when the Supabase client is not configured', async () => {
    mockSupabase = undefined;

    await expect(AuthService.forgotPassword({ email: 'user@example.com' })).rejects.toThrow(
      'Supabase client is not configured'
    );
  });

  it('should fail when the Supabase service role client is not configured', async () => {
    mockSupabaseServiceRole = undefined;

    await expect(AuthService.getCurrentUser('user-1')).rejects.toThrow(
      'Supabase service role client is not configured'
    );
  });
});
