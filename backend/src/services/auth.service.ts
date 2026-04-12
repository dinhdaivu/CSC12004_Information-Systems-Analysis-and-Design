import { supabase, supabaseServiceRole } from '@config/supabase';
import { ConflictError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError, ValidationError } from '@utils/errors';
import { TokenUtils } from '@utils/token';
import type { AppRole, UpdateUserDTO, User, UserStatus } from '@models/user.model';

type AuthenticatedProfile = {
  token: string;
  user: User;
};

type LoginInput = {
  email: string;
  password: string;
};

type ForgotPasswordInput = {
  email: string;
};

type RegisterInput = {
  email: string;
  password: string;
  confirm_password: string;
};

type VerifyEmailInput = {
  email: string;
  code: string;
};

type ResetPasswordInput = {
  email: string;
  code: string;
  password: string;
  confirm_password: string;
};

type UserRow = {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string | null;
  identity_number?: string | null;
  gender?: string | null;
  nationality?: string | null;
  avatar_url?: string | null;
  role: AppRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
};

export class AuthService {
  static async register(input: RegisterInput): Promise<{ email: string }> {
    const email = input.email.trim().toLowerCase();
    const password = input.password.trim();
    const confirmPassword = input.confirm_password.trim();

    if (!email || !password || !confirmPassword) {
      throw new ValidationError('Email, password, and password confirmation are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    this.ensureSupabaseClients();

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (this.isDuplicateEmailError(error.message)) {
        throw new ConflictError('An account with this email already exists');
      }

      throw new InternalServerError(error.message || 'Failed to register account');
    }

    if (!data.user) {
      throw new InternalServerError('Failed to register account');
    }

    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new ConflictError('An account with this email already exists');
    }

    await this.getOrCreateProfile(data.user.id, data.user.email ?? email);

    return { email };
  }

  static async login(input: LoginInput): Promise<AuthenticatedProfile> {
    const email = input.email.trim().toLowerCase();
    const password = input.password.trim();

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    this.ensureSupabaseClients();

    const { data, error } = await supabase!.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = await this.getOrCreateProfile(data.user.id, data.user.email ?? email);

    if (user.status !== 'active') {
      throw new ForbiddenError('Account is not active');
    }

    const token = TokenUtils.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user };
  }

  static async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const email = input.email.trim().toLowerCase();

    if (!email) {
      throw new ValidationError('Email is required');
    }

    this.ensureSupabaseClient();

    const { error } = await supabase!.auth.resetPasswordForEmail(email);

    if (error) {
      throw new InternalServerError(error.message || 'Failed to request password reset');
    }
  }

  static async verifyEmail(input: VerifyEmailInput): Promise<void> {
    const email = input.email.trim().toLowerCase();
    const code = input.code.trim();

    if (!email || !code) {
      throw new ValidationError('Email and verification code are required');
    }

    this.ensureSupabaseClients();

    const { data, error } = await supabase!.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    if (error || !data.user) {
      throw new UnauthorizedError('Invalid or expired verification code');
    }

    await this.getOrCreateProfile(data.user.id, data.user.email ?? email);
  }

  static async resendVerification(input: ForgotPasswordInput): Promise<void> {
    const email = input.email.trim().toLowerCase();

    if (!email) {
      throw new ValidationError('Email is required');
    }

    this.ensureSupabaseClient();

    const { error } = await supabase!.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      throw new InternalServerError(error.message || 'Failed to resend verification code');
    }
  }

  static async resetPasswordWithCode(input: ResetPasswordInput): Promise<void> {
    const email = input.email.trim().toLowerCase();
    const code = input.code.trim();
    const password = input.password.trim();
    const confirmPassword = input.confirm_password.trim();

    if (!email || !code || !password || !confirmPassword) {
      throw new ValidationError('Email, verification code, and password are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    this.ensureSupabaseClients();

    const { data, error } = await supabase!.auth.verifyOtp({
      email,
      token: code,
      type: 'recovery',
    });

    if (error || !data.user) {
      throw new UnauthorizedError('Invalid or expired recovery code');
    }

    const { error: updateError } = await supabaseServiceRole!.auth.admin.updateUserById(data.user.id, {
      password,
    });

    if (updateError) {
      throw new InternalServerError(updateError.message || 'Failed to update password');
    }

    await this.getOrCreateProfile(data.user.id, data.user.email ?? email);
  }

  static async getCurrentUser(userId: string): Promise<User> {
    this.ensureSupabaseServiceRole();
    return this.fetchProfile(userId);
  }

  static async updateCurrentUser(userId: string, input: UpdateUserDTO): Promise<User> {
    this.ensureSupabaseServiceRole();

    const updates: Partial<UserRow> = {};
    const allowedFields: Array<keyof UpdateUserDTO> = [
      'full_name',
      'phone_number',
      'avatar_url',
      'gender',
      'nationality',
    ];

    for (const field of allowedFields) {
      const value = input[field];
      if (value !== undefined) {
        (updates[field as keyof UserRow] as unknown) = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ValidationError('At least one profile field must be provided');
    }

    const { data, error } = await supabaseServiceRole!
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error || !data) {
      throw new InternalServerError(error?.message || 'Failed to update profile');
    }

    return this.mapUser(data as UserRow);
  }

  private static ensureSupabaseClient(): void {
    if (!supabase) {
      throw new InternalServerError('Supabase client is not configured');
    }
  }

  private static ensureSupabaseServiceRole(): void {
    if (!supabaseServiceRole) {
      throw new InternalServerError('Supabase service role client is not configured');
    }
  }

  private static ensureSupabaseClients(): void {
    this.ensureSupabaseClient();
    this.ensureSupabaseServiceRole();
  }

  private static async fetchProfile(userId: string): Promise<User> {
    const { data, error } = await supabaseServiceRole!
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundError('User profile not found');
    }

    return this.mapUser(data as UserRow);
  }

  private static async getOrCreateProfile(userId: string, email: string): Promise<User> {
    const { data, error } = await supabaseServiceRole!
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new InternalServerError(error.message || 'Failed to load user profile');
    }

    if (data) {
      return this.mapUser(data as UserRow);
    }

    const defaultFullName = email.split('@')[0] || 'User';

    const { data: created, error: createError } = await supabaseServiceRole!
      .from('users')
      .insert({
        id: userId,
        email,
        full_name: defaultFullName,
        role: 'customer',
        status: 'active',
      })
      .select('*')
      .single();

    if (createError || !created) {
      throw new InternalServerError(createError?.message || 'Failed to create user profile');
    }

    return this.mapUser(created as UserRow);
  }

  private static mapUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      phone_number: row.phone_number ?? undefined,
      identity_number: row.identity_number ?? undefined,
      gender: row.gender ?? undefined,
      nationality: row.nationality ?? undefined,
      avatar_url: row.avatar_url ?? undefined,
      role: row.role,
      status: row.status,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  private static isDuplicateEmailError(message: string | undefined): boolean {
    const normalized = (message || '').toLowerCase();
    return normalized.includes('already registered') || normalized.includes('already exists');
  }
}
