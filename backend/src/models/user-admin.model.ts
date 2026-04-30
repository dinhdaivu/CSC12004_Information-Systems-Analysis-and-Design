import type { AppRole, UserStatus } from "./user.model";

export interface UserListItemDTO {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: AppRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDetailDTO extends UserListItemDTO {
  identityNumber?: string;
  gender?: string;
  nationality?: string;
  avatarUrl?: string;
}

export interface UpdateUserDTO {
  role?: AppRole;
  status?: UserStatus;
}

export interface PaginatedUsersResponse {
  data: UserListItemDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type UserQueryFilters = {
  search?: string;
  role?: AppRole;
  status?: UserStatus;
  page: number;
  limit: number;
};

// Database row type
export interface UserRow {
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
