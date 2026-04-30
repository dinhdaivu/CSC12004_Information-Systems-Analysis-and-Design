import { supabaseServiceRole } from "@config/supabase";
import type { AppRole, UserStatus } from "@models/user.model";
import type {
  UserListItemDTO,
  UserDetailDTO,
  UserQueryFilters,
  UserRow,
  PaginatedUsersResponse,
  UpdateUserDTO,
} from "@models/user-admin.model";
import {
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "@utils/errors";

const VALID_ROLES: AppRole[] = [
  "customer",
  "sale",
  "accountant",
  "manager",
  "admin",
];
const VALID_STATUSES: UserStatus[] = ["active", "inactive", "banned"];

const USER_SELECT = `
  id,
  email,
  full_name,
  phone_number,
  identity_number,
  gender,
  nationality,
  avatar_url,
  role,
  status,
  created_at,
  updated_at
`;

function ensureClient() {
  if (!supabaseServiceRole) {
    throw new InternalServerError(
      "Supabase service role client is not configured",
    );
  }
  return supabaseServiceRole;
}

function mapRowToListItem(row: UserRow): UserListItemDTO {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    role: row.role,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapRowToDetail(row: UserRow): UserDetailDTO {
  return {
    ...mapRowToListItem(row),
    identityNumber: row.identity_number,
    gender: row.gender,
    nationality: row.nationality,
    avatarUrl: row.avatar_url,
  };
}

export class UsersService {
  /**
   * List all users with optional filters
   * Returns paginated result ordered by created_at DESC
   */
  static async listUsers(
    filters: UserQueryFilters,
  ): Promise<PaginatedUsersResponse> {
    const client = ensureClient();

    let query = client
      .from("users")
      .select(USER_SELECT, { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply search filter (email or full_name)
    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(
        `email.ilike.${searchTerm},full_name.ilike.${searchTerm}`,
      );
    }

    // Apply role filter
    if (filters.role) {
      if (!VALID_ROLES.includes(filters.role)) {
        throw new ValidationError("Invalid role filter");
      }
      query = query.eq("role", filters.role);
    }

    // Apply status filter
    if (filters.status) {
      if (!VALID_STATUSES.includes(filters.status)) {
        throw new ValidationError("Invalid status filter");
      }
      query = query.eq("status", filters.status);
    }

    // Apply pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new InternalServerError(`Failed to fetch users: ${error.message}`);
    }

    const total = count ?? 0;
    const users = ((data as UserRow[] | null) ?? []).map(mapRowToListItem);

    return {
      data: users,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: total > 0 ? Math.ceil(total / filters.limit) : 0,
      },
    };
  }

  /**
   * Get single user by ID
   */
  static async getUserById(id: string): Promise<UserDetailDTO> {
    const client = ensureClient();

    if (!id.trim()) {
      throw new ValidationError("User ID is required");
    }

    const { data, error } = await client
      .from("users")
      .select(USER_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new InternalServerError(`Failed to fetch user: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundError("User not found");
    }

    return mapRowToDetail(data as UserRow);
  }

  /**
   * Update user role and/or status
   * Only allows updating role and status fields
   */
  static async updateUser(
    id: string,
    updates: UpdateUserDTO,
  ): Promise<UserDetailDTO> {
    const client = ensureClient();

    if (!id.trim()) {
      throw new ValidationError("User ID is required");
    }

    // Validate role if provided
    if (updates.role !== undefined && !VALID_ROLES.includes(updates.role)) {
      throw new ValidationError(
        `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`,
      );
    }

    // Validate status if provided
    if (
      updates.status !== undefined &&
      !VALID_STATUSES.includes(updates.status)
    ) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      );
    }

    // Build payload (only include fields that are provided)
    const payload: Partial<{ role: AppRole; status: UserStatus }> = {};
    if (updates.role !== undefined) {
      payload.role = updates.role;
    }
    if (updates.status !== undefined) {
      payload.status = updates.status;
    }

    if (Object.keys(payload).length === 0) {
      throw new ValidationError(
        "At least one field (role or status) is required",
      );
    }

    const { data, error } = await client
      .from("users")
      .update(payload)
      .eq("id", id)
      .select(USER_SELECT)
      .maybeSingle();

    if (error) {
      throw new InternalServerError(`Failed to update user: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundError("User not found");
    }

    return mapRowToDetail(data as UserRow);
  }

  /**
   * Soft delete: set user status to 'inactive'
   */
  static async deleteUser(id: string): Promise<UserDetailDTO> {
    const client = ensureClient();

    if (!id.trim()) {
      throw new ValidationError("User ID is required");
    }

    // Soft delete: set status to inactive
    const { data, error } = await client
      .from("users")
      .update({ status: "inactive" })
      .eq("id", id)
      .select(USER_SELECT)
      .maybeSingle();

    if (error) {
      throw new InternalServerError(`Failed to delete user: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundError("User not found");
    }

    return mapRowToDetail(data as UserRow);
  }
}
