// User model interfaces
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone_number?: string;
  identity_number?: string;
  gender?: string;
  nationality?: string;
  avatar_url?: string;
  role: 'user' | 'staff' | 'admin';
  status: 'active' | 'inactive' | 'banned';
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
}
