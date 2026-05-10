import { supabaseServiceRole } from "@config/supabase";
import { UsersService } from "@services/users.service";
import { NotFoundError, ValidationError } from "@utils/errors";

// Mock Supabase
jest.mock("@config/supabase", () => ({
  supabaseServiceRole: {
    from: jest.fn(),
  },
}));

describe("UsersService", () => {
  const mockSupabase = supabaseServiceRole as jest.Mocked<
    typeof supabaseServiceRole
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listUsers", () => {
    it("should list users with default pagination", async () => {
      const mockUsers = [
        {
          id: "user-1",
          email: "admin@example.com",
          full_name: "Admin User",
          phone_number: null,
          identity_number: null,
          gender: null,
          nationality: null,
          avatar_url: null,
          role: "admin",
          status: "active",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "user-2",
          email: "customer@example.com",
          full_name: "Customer User",
          phone_number: null,
          identity_number: null,
          gender: null,
          nationality: null,
          avatar_url: null,
          role: "customer",
          status: "active",
          created_at: "2026-01-02T00:00:00Z",
          updated_at: "2026-01-02T00:00:00Z",
        },
      ];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockUsers,
          error: null,
          count: 2,
        }),
      };

      mockSupabase!.from = jest.fn().mockReturnValue(mockChain);

      const result = await UsersService.listUsers({
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it("should filter users by role", async () => {
      const mockUsers = [
        {
          id: "user-1",
          email: "admin@example.com",
          full_name: "Admin User",
          phone_number: null,
          identity_number: null,
          gender: null,
          nationality: null,
          avatar_url: null,
          role: "admin",
          status: "active",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockUsers,
          error: null,
          count: 1,
        }),
      };

      mockSupabase!.from = jest.fn().mockReturnValue(mockChain);

      const result = await UsersService.listUsers({
        role: "admin",
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].role).toBe("admin");
    });

    it("should throw ValidationError for invalid role filter", async () => {
      await expect(
        UsersService.listUsers({
          role: "invalid_role" as any,
          page: 1,
          limit: 20,
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("getUserById", () => {
    it("should return user detail", async () => {
      const mockUser = {
        id: "user-1",
        email: "admin@example.com",
        full_name: "Admin User",
        phone_number: "0123456789",
        identity_number: "ID123456",
        gender: "M",
        nationality: "Vietnamese",
        avatar_url: "https://example.com/avatar.jpg",
        role: "admin",
        status: "active",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: mockUser,
          error: null,
        }),
      };

      mockSupabase!.from = jest.fn().mockReturnValue(mockChain);

      const result = await UsersService.getUserById("user-1");

      expect(result.id).toBe("user-1");
      expect(result.email).toBe("admin@example.com");
      expect(result.avatarUrl).toBe("https://example.com/avatar.jpg");
    });

    it("should throw NotFoundError when user not found", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockSupabase!.from = jest.fn().mockReturnValue(mockChain);

      await expect(UsersService.getUserById("nonexistent")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("updateUser", () => {
    it("should update user role", async () => {
      const mockUpdatedUser = {
        id: "user-1",
        email: "admin@example.com",
        full_name: "Admin User",
        phone_number: null,
        identity_number: null,
        gender: null,
        nationality: null,
        avatar_url: null,
        role: "manager",
        status: "active",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: mockUpdatedUser,
          error: null,
        }),
      };

      mockSupabase!.from = jest.fn().mockReturnValue(mockChain);

      const result = await UsersService.updateUser("user-1", {
        role: "manager",
      });

      expect(result.role).toBe("manager");
    });

    it("should update user status", async () => {
      const mockUpdatedUser = {
        id: "user-1",
        email: "admin@example.com",
        full_name: "Admin User",
        phone_number: null,
        identity_number: null,
        gender: null,
        nationality: null,
        avatar_url: null,
        role: "admin",
        status: "banned",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: mockUpdatedUser,
          error: null,
        }),
      };

      mockSupabase!.from = jest.fn().mockReturnValue(mockChain);

      const result = await UsersService.updateUser("user-1", {
        status: "banned",
      });

      expect(result.status).toBe("banned");
    });

    it("should throw ValidationError for invalid role", async () => {
      await expect(
        UsersService.updateUser("user-1", {
          role: "invalid_role" as any,
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("deleteUser", () => {
    it("should soft delete user by setting status to inactive", async () => {
      const mockDeletedUser = {
        id: "user-1",
        email: "admin@example.com",
        full_name: "Admin User",
        phone_number: null,
        identity_number: null,
        gender: null,
        nationality: null,
        avatar_url: null,
        role: "admin",
        status: "inactive",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: mockDeletedUser,
          error: null,
        }),
      };

      mockSupabase!.from = jest.fn().mockReturnValue(mockChain);

      const result = await UsersService.deleteUser("user-1");

      expect(result.status).toBe("inactive");
    });

    it("should throw NotFoundError when user not found", async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockSupabase!.from = jest.fn().mockReturnValue(mockChain);

      await expect(UsersService.deleteUser("nonexistent")).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
