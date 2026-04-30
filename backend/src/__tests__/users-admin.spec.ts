import request from "supertest";
import express from "express";
import usersRoutes from "@routes/users.routes";
import { supabaseServiceRole } from "@config/supabase";
import { AppError } from "@utils/errors";

jest.mock("@middleware/auth.middleware", () => ({
  authMiddleware: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void => {
    void res;
    const roleHeader = req.headers["x-test-role"];
    const role = typeof roleHeader === "string" ? roleHeader : "admin";

    (
      req as express.Request & {
        user?: { id: string; email: string; role: string };
      }
    ).user = {
      id: "admin-1",
      email: "admin@example.com",
      role,
    };

    next();
  },
}));

jest.mock("@middleware/require-admin", () => ({
  requireAdmin: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void => {
    const user = (req as express.Request & { user?: { role: string } }).user;
    if (!user || user.role !== "admin") {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Admin access required" },
      });
      return;
    }
    next();
  },
}));

jest.mock("@config/supabase", () => ({
  supabaseServiceRole: {
    from: jest.fn(),
  },
}));

const mockedSupabase = supabaseServiceRole as NonNullable<
  typeof supabaseServiceRole
> & {
  from: jest.Mock;
};

const makeUserRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: "user-1",
  email: "user@example.com",
  full_name: "Test User",
  phone_number: "0900000001",
  identity_number: "123456789",
  gender: "male",
  nationality: "Vietnamese",
  avatar_url: null,
  role: "customer",
  status: "active",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/users", usersRoutes);

  app.use(
    (
      err: unknown,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      void req;
      void next;

      if (err instanceof AppError) {
        res.status(err.statusCode).json({
          success: false,
          error: { code: err.code, message: err.message },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" },
      });
    },
  );

  return app;
};

describe("Users Admin Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users", () => {
    it("should return paginated user list", async () => {
      const userRows = [makeUserRow()];

      const range = jest.fn().mockResolvedValue({ data: userRows, error: null, count: 1 });
      const order = jest.fn().mockReturnValue({ range });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/users");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data[0].fullName).toBe("Test User");
      expect(response.body.data.meta.total).toBe(1);
    });

    it("should apply search filter", async () => {
      const range = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 });
      const or = jest.fn().mockReturnValue({ range });
      const order = jest.fn().mockReturnValue({ or });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/users?search=test");

      expect(response.status).toBe(200);
      expect(or).toHaveBeenCalled();
    });

    it("should apply role filter", async () => {
      const range = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 });
      const eq = jest.fn().mockReturnValue({ range });
      const order = jest.fn().mockReturnValue({ eq });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/users?role=customer");

      expect(response.status).toBe(200);
      expect(eq).toHaveBeenCalledWith("role", "customer");
    });

    it("should apply status filter", async () => {
      const range = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 });
      const eq = jest.fn().mockReturnValue({ range });
      const order = jest.fn().mockReturnValue({ eq });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/users?status=active");

      expect(response.status).toBe(200);
    });

    it("should return 400 for invalid page param", async () => {
      const app = buildApp();
      const response = await request(app).get("/api/users?page=0");

      expect(response.status).toBe(400);
    });

    it("should return 400 for limit > 100", async () => {
      const app = buildApp();
      const response = await request(app).get("/api/users?limit=200");

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid role filter", async () => {
      const app = buildApp();
      const response = await request(app).get("/api/users?role=superadmin");

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid status filter", async () => {
      const app = buildApp();
      const response = await request(app).get("/api/users?status=deleted");

      expect(response.status).toBe(400);
    });

    it("should return 500 on database error", async () => {
      const range = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "DB error" },
        count: null,
      });
      const order = jest.fn().mockReturnValue({ range });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/users");

      expect(response.status).toBe(500);
    });

    it("should return 403 for non-admin role", async () => {
      const app = buildApp();
      const response = await request(app)
        .get("/api/users")
        .set("x-test-role", "manager");

      expect(response.status).toBe(403);
    });

    it("should handle null count by returning 0 totalPages", async () => {
      const range = jest.fn().mockResolvedValue({ data: [], error: null, count: null });
      const order = jest.fn().mockReturnValue({ range });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/users");

      expect(response.status).toBe(200);
      expect(response.body.data.meta.totalPages).toBe(0);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return user detail", async () => {
      const userRow = makeUserRow();

      const maybeSingle = jest.fn().mockResolvedValue({ data: userRow, error: null });
      const eq = jest.fn().mockReturnValue({ maybeSingle });
      const select = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/users/user-1");

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe("user-1");
      expect(response.body.data.identityNumber).toBe("123456789");
      expect(response.body.data.gender).toBe("male");
    });

    it("should return 404 when user not found", async () => {
      const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
      const eq = jest.fn().mockReturnValue({ maybeSingle });
      const select = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/users/nonexistent");

      expect(response.status).toBe(404);
    });

    it("should return 500 on database error", async () => {
      const maybeSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });
      const eq = jest.fn().mockReturnValue({ maybeSingle });
      const select = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/users/user-1");

      expect(response.status).toBe(500);
    });
  });

  describe("PATCH /api/users/:id", () => {
    it("should update user role", async () => {
      const updatedRow = makeUserRow({ role: "sale" });

      const maybeSingle = jest.fn().mockResolvedValue({ data: updatedRow, error: null });
      const select = jest.fn().mockReturnValue({ maybeSingle });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app)
        .patch("/api/users/user-1")
        .send({ role: "sale" });

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe("sale");
      expect(update).toHaveBeenCalledWith({ role: "sale" });
    });

    it("should update user status", async () => {
      const updatedRow = makeUserRow({ status: "banned" });

      const maybeSingle = jest.fn().mockResolvedValue({ data: updatedRow, error: null });
      const select = jest.fn().mockReturnValue({ maybeSingle });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app)
        .patch("/api/users/user-1")
        .send({ status: "banned" });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("banned");
    });

    it("should return 400 when no fields provided", async () => {
      const app = buildApp();
      const response = await request(app)
        .patch("/api/users/user-1")
        .send({});

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid role", async () => {
      const app = buildApp();
      const response = await request(app)
        .patch("/api/users/user-1")
        .send({ role: "superadmin" });

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid status", async () => {
      const app = buildApp();
      const response = await request(app)
        .patch("/api/users/user-1")
        .send({ status: "deleted" });

      expect(response.status).toBe(400);
    });

    it("should return 404 when user not found", async () => {
      const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
      const select = jest.fn().mockReturnValue({ maybeSingle });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app)
        .patch("/api/users/nonexistent")
        .send({ role: "sale" });

      expect(response.status).toBe(404);
    });

    it("should return 500 on database error", async () => {
      const maybeSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });
      const select = jest.fn().mockReturnValue({ maybeSingle });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app)
        .patch("/api/users/user-1")
        .send({ role: "sale" });

      expect(response.status).toBe(500);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should soft-delete user by setting status to inactive", async () => {
      const deletedRow = makeUserRow({ status: "inactive" });

      const maybeSingle = jest.fn().mockResolvedValue({ data: deletedRow, error: null });
      const select = jest.fn().mockReturnValue({ maybeSingle });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app).delete("/api/users/user-1");

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("inactive");
      expect(update).toHaveBeenCalledWith({ status: "inactive" });
    });

    it("should return 404 when user not found", async () => {
      const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
      const select = jest.fn().mockReturnValue({ maybeSingle });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app).delete("/api/users/nonexistent");

      expect(response.status).toBe(404);
    });

    it("should return 500 on database error", async () => {
      const maybeSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });
      const select = jest.fn().mockReturnValue({ maybeSingle });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app).delete("/api/users/user-1");

      expect(response.status).toBe(500);
    });
  });
});
