export type AppRole = 'customer' | 'sale' | 'accountant' | 'manager' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  identity_number?: string;
  gender?: string;
  nationality?: string;
  avatar_url?: string;
  role: AppRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResult {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResetPasswordWithCodeRequest {
  email: string;
  code: string;
  password: string;
  confirm_password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  gender?: string;
  nationality?: string;
}
