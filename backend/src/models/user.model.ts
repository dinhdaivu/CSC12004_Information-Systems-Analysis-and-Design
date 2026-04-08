// User model interfaces
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
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  identity_number?: string;
  gender?: string;
  nationality?: string;
}

export interface UpdateUserDTO {
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  gender?: string;
  nationality?: string;
  role?: AppRole;
  status?: UserStatus;
}
