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
    id: string;
    email: string;
    token: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
}
