import request from "supertest";
import express from "express";
import adminRoutes from "@routes/admin.routes";
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
  roleMiddleware:
    (roles: string[]) =>
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ): void => {
      const user = (req as express.Request & { user?: { role: string } }).user;
      if (!user || !roles.includes(user.role)) {
        res.status(403).json({ message: "Forbidden" });
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

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminRoutes);

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

function mockDashboardQueries(overrides: {
  usersError?: { message: string };
  roomsError?: { message: string };
  bookingsError?: { message: string };
  paymentsError?: { message: string };
  rentalActivitiesError?: { message: string };
  paymentActivitiesError?: { message: string };
  paymentsData?: Array<{ amount: number | string }>;
  rentalActivitiesData?: Array<{ created_at: string }>;
  paymentActivitiesData?: Array<{ created_at: string; amount: number | string }>;
} = {}): void {
  const {
    usersError = null,
    roomsError = null,
    bookingsError = null,
    paymentsError = null,
    rentalActivitiesError = null,
    paymentActivitiesError = null,
    paymentsData = [{ amount: 5000000 }],
    rentalActivitiesData = [{ created_at: "2026-04-01T00:00:00.000Z" }],
    paymentActivitiesData = [{ created_at: "2026-04-02T00:00:00.000Z", amount: 5000000 }],
  } = overrides;

  let callCount = 0;

  mockedSupabase.from.mockImplementation((table: string) => {
    callCount++;

    if (table === "users" && callCount === 1) {
      return {
        select: jest.fn().mockReturnValue({
          error: usersError,
          count: usersError ? null : 10,
          data: null,
        }),
      };
    }

    if (table === "rooms") {
      return {
        select: jest.fn().mockReturnValue({
          error: roomsError,
          count: roomsError ? null : 5,
          data: null,
        }),
      };
    }

    if (table === "rental_requests" && callCount <= 4) {
      if (callCount === 3) {
        return {
          select: jest.fn().mockReturnValue({
            neq: jest.fn().mockReturnValue({
              error: bookingsError,
              count: bookingsError ? null : 8,
              data: null,
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: rentalActivitiesData,
              error: rentalActivitiesError,
            }),
          }),
        }),
      };
    }

    if (table === "payments") {
      if (callCount === 4) {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              error: paymentsError,
              data: paymentsError ? null : paymentsData,
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: paymentActivitiesData,
                error: paymentActivitiesError,
              }),
            }),
          }),
        }),
      };
    }

    return { select: jest.fn().mockReturnValue({ error: null, data: [] }) };
  });
}

describe("Admin Dashboard Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/admin/dashboard should return dashboard summary", async () => {
    const usersResult = { error: null, count: 10, data: null };
    const roomsResult = { error: null, count: 5, data: null };
    const bookingsResult = { error: null, count: 8, data: null };
    const paymentsResult = { error: null, data: [{ amount: 5000000 }, { amount: "3000000" }] };
    const rentalActivities = { error: null, data: [{ created_at: "2026-04-01T00:00:00.000Z" }] };
    const paymentActivities = {
      error: null,
      data: [{ created_at: "2026-04-02T00:00:00.000Z", amount: 5000000 }],
    };

    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "users") {
        return { select: jest.fn().mockReturnValue(usersResult) };
      }
      if (table === "rooms") {
        return { select: jest.fn().mockReturnValue(roomsResult) };
      }
      if (table === "rental_requests") {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.head) {
              return { neq: jest.fn().mockReturnValue(bookingsResult) };
            }
            return {
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(rentalActivities),
              }),
            };
          }),
        };
      }
      if (table === "payments") {
        return {
          select: jest.fn().mockImplementation((cols: string) => {
            if (cols === "amount") {
              return { eq: jest.fn().mockReturnValue(paymentsResult) };
            }
            return {
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue(paymentActivities),
                }),
              }),
            };
          }),
        };
      }
      return { select: jest.fn().mockReturnValue({ error: null, data: [] }) };
    });

    const app = buildApp();
    const response = await request(app).get("/api/admin/dashboard");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("usersCount");
    expect(response.body.data).toHaveProperty("roomsCount");
    expect(response.body.data).toHaveProperty("bookingsCount");
    expect(response.body.data).toHaveProperty("revenue");
    expect(response.body.data).toHaveProperty("recentActivities");
    expect(Array.isArray(response.body.data.recentActivities)).toBe(true);
  });

  it("should return 403 for non-manager/admin role", async () => {
    const app = buildApp();
    const response = await request(app)
      .get("/api/admin/dashboard")
      .set("x-test-role", "customer");

    expect(response.status).toBe(403);
  });

  it("should return 403 for sale role", async () => {
    const app = buildApp();
    const response = await request(app)
      .get("/api/admin/dashboard")
      .set("x-test-role", "sale");

    expect(response.status).toBe(403);
  });

  it("should return 200 for manager role", async () => {
    const usersResult = { error: null, count: 5, data: null };
    const roomsResult = { error: null, count: 3, data: null };
    const bookingsResult = { error: null, count: 2, data: null };
    const paymentsResult = { error: null, data: [] };
    const rentalActivities = { error: null, data: [] };
    const paymentActivities = { error: null, data: [] };

    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "users") return { select: jest.fn().mockReturnValue(usersResult) };
      if (table === "rooms") return { select: jest.fn().mockReturnValue(roomsResult) };
      if (table === "rental_requests") {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.head) {
              return { neq: jest.fn().mockReturnValue(bookingsResult) };
            }
            return {
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(rentalActivities),
              }),
            };
          }),
        };
      }
      if (table === "payments") {
        return {
          select: jest.fn().mockImplementation((cols: string) => {
            if (cols === "amount") return { eq: jest.fn().mockReturnValue(paymentsResult) };
            return {
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue(paymentActivities),
                }),
              }),
            };
          }),
        };
      }
      return { select: jest.fn().mockReturnValue({ error: null, data: [] }) };
    });

    const app = buildApp();
    const response = await request(app)
      .get("/api/admin/dashboard")
      .set("x-test-role", "manager");

    expect(response.status).toBe(200);
    expect(response.body.data.revenue).toBe(0);
    expect(response.body.data.recentActivities).toHaveLength(0);
  });

  it("should return 500 when users query fails", async () => {
    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: jest.fn().mockReturnValue({
            error: { message: "users query failed" },
            count: null,
            data: null,
          }),
        };
      }
      if (table === "rooms") {
        return { select: jest.fn().mockReturnValue({ error: null, count: 0, data: null }) };
      }
      if (table === "rental_requests") {
        return {
          select: jest.fn().mockReturnValue({
            neq: jest.fn().mockReturnValue({ error: null, count: 0, data: null }),
          }),
        };
      }
      if (table === "payments") {
        return { select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ error: null, data: [] }) }) };
      }
      return { select: jest.fn().mockReturnValue({ error: null, data: [] }) };
    });

    const app = buildApp();
    const response = await request(app).get("/api/admin/dashboard");

    expect(response.status).toBe(500);
  });

  it("should return 500 when rooms query fails", async () => {
    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "users") {
        return { select: jest.fn().mockReturnValue({ error: null, count: 10, data: null }) };
      }
      if (table === "rooms") {
        return { select: jest.fn().mockReturnValue({ error: { message: "rooms error" }, count: null, data: null }) };
      }
      if (table === "rental_requests") {
        return {
          select: jest.fn().mockReturnValue({
            neq: jest.fn().mockReturnValue({ error: null, count: 0, data: null }),
          }),
        };
      }
      if (table === "payments") {
        return { select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ error: null, data: [] }) }) };
      }
      return { select: jest.fn().mockReturnValue({ error: null, data: [] }) };
    });

    const app = buildApp();
    const response = await request(app).get("/api/admin/dashboard");
    expect(response.status).toBe(500);
  });

  it("should return 500 when bookings query fails", async () => {
    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "users") {
        return { select: jest.fn().mockReturnValue({ error: null, count: 10, data: null }) };
      }
      if (table === "rooms") {
        return { select: jest.fn().mockReturnValue({ error: null, count: 5, data: null }) };
      }
      if (table === "rental_requests") {
        return {
          select: jest.fn().mockReturnValue({
            neq: jest.fn().mockReturnValue({ error: { message: "bookings error" }, count: null, data: null }),
          }),
        };
      }
      if (table === "payments") {
        return { select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ error: null, data: [] }) }) };
      }
      return { select: jest.fn().mockReturnValue({ error: null, data: [] }) };
    });

    const app = buildApp();
    const response = await request(app).get("/api/admin/dashboard");
    expect(response.status).toBe(500);
  });

  it("should return 500 when payments query fails", async () => {
    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "users") {
        return { select: jest.fn().mockReturnValue({ error: null, count: 10, data: null }) };
      }
      if (table === "rooms") {
        return { select: jest.fn().mockReturnValue({ error: null, count: 5, data: null }) };
      }
      if (table === "rental_requests") {
        return {
          select: jest.fn().mockReturnValue({
            neq: jest.fn().mockReturnValue({ error: null, count: 8, data: null }),
          }),
        };
      }
      if (table === "payments") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({ error: { message: "payments error" }, data: null }),
          }),
        };
      }
      return { select: jest.fn().mockReturnValue({ error: null, data: [] }) };
    });

    const app = buildApp();
    const response = await request(app).get("/api/admin/dashboard");
    expect(response.status).toBe(500);
  });

  it("should return 500 when rental activities query fails", async () => {
    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "users") return { select: jest.fn().mockReturnValue({ error: null, count: 10, data: null }) };
      if (table === "rooms") return { select: jest.fn().mockReturnValue({ error: null, count: 5, data: null }) };
      if (table === "rental_requests") {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.head) {
              return { neq: jest.fn().mockReturnValue({ error: null, count: 8, data: null }) };
            }
            return {
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({ data: null, error: { message: "activities error" } }),
              }),
            };
          }),
        };
      }
      if (table === "payments") {
        return {
          select: jest.fn().mockImplementation((cols: string) => {
            if (cols === "amount") return { eq: jest.fn().mockReturnValue({ error: null, data: [] }) };
            return {
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            };
          }),
        };
      }
      return { select: jest.fn().mockReturnValue({ error: null, data: [] }) };
    });

    const app = buildApp();
    const response = await request(app).get("/api/admin/dashboard");
    expect(response.status).toBe(500);
  });

  it("should return 500 when payment activities query fails", async () => {
    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "users") return { select: jest.fn().mockReturnValue({ error: null, count: 10, data: null }) };
      if (table === "rooms") return { select: jest.fn().mockReturnValue({ error: null, count: 5, data: null }) };
      if (table === "rental_requests") {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.head) {
              return { neq: jest.fn().mockReturnValue({ error: null, count: 8, data: null }) };
            }
            return {
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            };
          }),
        };
      }
      if (table === "payments") {
        return {
          select: jest.fn().mockImplementation((cols: string) => {
            if (cols === "amount") return { eq: jest.fn().mockReturnValue({ error: null, data: [] }) };
            return {
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({ data: null, error: { message: "payment activities error" } }),
                }),
              }),
            };
          }),
        };
      }
      return { select: jest.fn().mockReturnValue({ error: null, data: [] }) };
    });

    const app = buildApp();
    const response = await request(app).get("/api/admin/dashboard");
    expect(response.status).toBe(500);
  });
});
