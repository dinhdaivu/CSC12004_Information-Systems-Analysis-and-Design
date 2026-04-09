import { supabase, supabaseServiceRole } from '@config/supabase';
import { ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError, ValidationError } from '@utils/errors';
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

    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/auth/login`,
    });

    if (error) {
      throw new InternalServerError(error.message || 'Failed to request password reset');
    }
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
}
