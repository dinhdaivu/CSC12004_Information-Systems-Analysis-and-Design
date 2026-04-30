import request from "supertest";
import express from "express";
import viewingAppointmentsRoutes from "@routes/viewing-appointments.routes";
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
    const role = typeof roleHeader === "string" ? roleHeader : "sale";

    (
      req as express.Request & {
        user?: { id: string; email: string; role: string };
      }
    ).user = {
      id: "sale-1",
      email: "sale@example.com",
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
      const user = (
        req as express.Request & { user?: { role: string } }
      ).user;
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
  app.use("/api/viewing-appointments", viewingAppointmentsRoutes);

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
          error: {
            code: err.code,
            message: err.message,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal Server Error",
        },
      });
    },
  );

  return app;
};

describe("Viewing Appointments Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/viewing-appointments should create appointment", async () => {
    const createdRow = {
      id: "appt-new-1",
      rental_request_id: "req-1",
      customer_id: "cus-1",
      sale_id: "sale-1",
      room_id: "room-1",
      bed_id: "bed-1",
      scheduled_at: "2026-05-10T10:00:00.000Z",
      result_note: "Initial schedule",
      status: "scheduled",
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
    };

    const single = jest
      .fn()
      .mockResolvedValue({ data: createdRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });

    mockedSupabase.from.mockReturnValue({ insert });

    const app = buildApp();
    const response = await request(app)
      .post("/api/viewing-appointments")
      .set("Authorization", "Bearer fake")
      .send({
        rentalRequestId: "req-1",
        customerId: "cus-1",
        saleId: "sale-1",
        roomId: "room-1",
        bedId: "bed-1",
        scheduledAt: "2026-05-10T10:00:00.000Z",
        status: "scheduled",
        resultNote: "Initial schedule",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe("appt-new-1");
    expect(insert).toHaveBeenCalledWith({
      rental_request_id: "req-1",
      customer_id: "cus-1",
      sale_id: "sale-1",
      room_id: "room-1",
      bed_id: "bed-1",
      scheduled_at: "2026-05-10T10:00:00.000Z",
      result_note: "Initial schedule",
      status: "scheduled",
    });
  });

  it("GET /api/viewing-appointments should return mapped appointments", async () => {
    const singleRow = {
      id: "appt-1",
      rental_request_id: "req-1",
      customer_id: "cus-1",
      sale_id: "sale-1",
      room_id: "room-1",
      bed_id: "bed-1",
      scheduled_at: "2026-05-10T10:00:00.000Z",
      result_note: "Customer confirmed",
      status: "scheduled",
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-02T00:00:00.000Z",
    };

    const range = jest.fn().mockResolvedValue({ data: [singleRow], error: null, count: 1 });
    const lt = jest.fn().mockReturnValue({ range });
    const gte = jest.fn().mockReturnValue({ lt });
    const order = jest.fn().mockReturnValue({ gte });
    const select = jest.fn().mockReturnValue({ order });

    mockedSupabase.from.mockReturnValue({ select });

    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments?month=2026-05")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.records[0]).toEqual({
      id: "appt-1",
      rentalRequestId: "req-1",
      customerId: "cus-1",
      saleId: "sale-1",
      roomId: "room-1",
      bedId: "bed-1",
      scheduledAt: "2026-05-10T10:00:00.000Z",
      resultNote: "Customer confirmed",
      status: "scheduled",
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-02T00:00:00.000Z",
    });

    expect(response.body.data.pagination).toEqual({
      page: 1,
      limit: 5,
      total: 1,
      totalPages: 1
    });
  });

  it("PATCH /api/viewing-appointments/:id/outcome should update status and result note", async () => {
    const updatedRow = {
      id: "appt-1",
      rental_request_id: "req-1",
      customer_id: "cus-1",
      sale_id: "sale-1",
      room_id: "room-1",
      bed_id: "bed-1",
      scheduled_at: "2026-05-10T10:00:00.000Z",
      result_note: "Visited room successfully",
      status: "scheduled",
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-03T00:00:00.000Z",
    };

    const single = jest
      .fn()
      .mockResolvedValue({ data: updatedRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });

    mockedSupabase.from.mockReturnValue({ update });

    const app = buildApp();
    const response = await request(app)
      .patch("/api/viewing-appointments/appt-1/outcome")
      .set("Authorization", "Bearer fake")
      .send({
        status: "scheduled",
        resultNote: "Visited room successfully",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(update).toHaveBeenCalledWith({
      status: "scheduled",
      result_note: "Visited room successfully",
    });
    expect(response.body.data.status).toBe("scheduled");
    expect(response.body.data.resultNote).toBe("Visited room successfully");
  });

  it("should return 403 for disallowed roles", async () => {
    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments?month=2026-05")
      .set("Authorization", "Bearer fake")
      .set("x-test-role", "customer");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: "Forbidden" });
  });

  it("GET should return 400 for invalid month format", async () => {
    // Need chain so query init succeeds; getMonthRange throws after that
    const order = jest.fn().mockReturnValue({});
    const select = jest.fn().mockReturnValue({ order });
    mockedSupabase.from.mockReturnValue({ select });

    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments?month=not-a-month")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(400);
  });

  it("GET should return 400 for invalid status filter", async () => {
    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments?status=unknown")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(400);
  });

  it("GET should return 400 for invalid page param", async () => {
    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments?page=0")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(400);
  });

  it("GET should return 400 for invalid limit param", async () => {
    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments?limit=0")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(400);
  });

  it("GET should apply status filter and return results", async () => {
    const singleRow = {
      id: "appt-2",
      rental_request_id: "req-1",
      customer_id: "cus-1",
      sale_id: "sale-1",
      room_id: "room-1",
      bed_id: "bed-1",
      scheduled_at: "2026-05-10T10:00:00.000Z",
      result_note: null,
      status: "pending",
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
    };

    const range = jest.fn().mockResolvedValue({ data: [singleRow], error: null, count: 1 });
    const eq = jest.fn().mockReturnValue({ range });
    const order = jest.fn().mockReturnValue({ eq });
    const select = jest.fn().mockReturnValue({ order });
    mockedSupabase.from.mockReturnValue({ select });

    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments?status=pending")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(200);
    expect(response.body.data.records[0].status).toBe("pending");
  });

  it("GET with branchId should return filtered appointments", async () => {
    const apptRow = {
      id: "appt-3",
      rental_request_id: "req-1",
      customer_id: "cus-1",
      sale_id: "sale-1",
      room_id: "room-1",
      bed_id: "bed-1",
      scheduled_at: "2026-05-10T10:00:00.000Z",
      result_note: null,
      status: "scheduled",
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
    };

    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "rooms") {
        const eq = jest.fn().mockResolvedValue({ data: [{ id: "room-1" }], error: null });
        const select = jest.fn().mockReturnValue({ eq });
        return { select };
      }
      // viewing_appointments
      const range = jest.fn().mockResolvedValue({ data: [apptRow], error: null, count: 1 });
      const inFn = jest.fn().mockReturnValue({ range });
      const order = jest.fn().mockReturnValue({ in: inFn, range });
      const select = jest.fn().mockReturnValue({ order });
      return { select };
    });

    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments?branch=branch-1")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(200);
    expect(response.body.data.records).toHaveLength(1);
  });

  it("GET with branchId should return empty when no rooms in branch", async () => {
    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "rooms") {
        const eq = jest.fn().mockResolvedValue({ data: [], error: null });
        const select = jest.fn().mockReturnValue({ eq });
        return { select };
      }
      const range = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 });
      const order = jest.fn().mockReturnValue({ range });
      const select = jest.fn().mockReturnValue({ order });
      return { select };
    });

    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments?branch=branch-empty")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(200);
    expect(response.body.data.records).toHaveLength(0);
    expect(response.body.data.pagination.total).toBe(0);
  });

  it("GET with branchId should return 500 when rooms query fails", async () => {
    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "rooms") {
        const eq = jest.fn().mockResolvedValue({ data: null, error: { message: "rooms error" } });
        const select = jest.fn().mockReturnValue({ eq });
        return { select };
      }
      const range = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 });
      const order = jest.fn().mockReturnValue({ range });
      const select = jest.fn().mockReturnValue({ order });
      return { select };
    });

    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments?branch=branch-1")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(500);
  });

  it("GET should return 500 when Supabase range query fails", async () => {
    const range = jest.fn().mockResolvedValue({ data: null, error: { message: "query failed" }, count: null });
    const order = jest.fn().mockReturnValue({ range });
    const select = jest.fn().mockReturnValue({ order });
    mockedSupabase.from.mockReturnValue({ select });

    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(500);
  });

  it("GET /:id should return appointment by id", async () => {
    const apptRow = {
      id: "appt-1",
      rental_request_id: "req-1",
      customer_id: "cus-1",
      sale_id: "sale-1",
      room_id: "room-1",
      bed_id: "bed-1",
      scheduled_at: "2026-05-10T10:00:00.000Z",
      result_note: "note",
      status: "scheduled",
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
    };

    const single = jest.fn().mockResolvedValue({ data: apptRow, error: null });
    const eq = jest.fn().mockReturnValue({ single });
    const select = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValue({ select });

    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments/appt-1")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe("appt-1");
  });

  it("GET /:id should return 404 when appointment not found (PGRST116)", async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { code: "PGRST116", message: "not found" } });
    const eq = jest.fn().mockReturnValue({ single });
    const select = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValue({ select });

    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments/nonexistent")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(404);
  });

  it("GET /:id should return 500 on generic supabase error", async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { code: "OTHER", message: "db error" } });
    const eq = jest.fn().mockReturnValue({ single });
    const select = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValue({ select });

    const app = buildApp();
    const response = await request(app)
      .get("/api/viewing-appointments/appt-1")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(500);
  });

  it("POST should return 400 when required fields are missing", async () => {
    const app = buildApp();
    const response = await request(app)
      .post("/api/viewing-appointments")
      .set("Authorization", "Bearer fake")
      .send({ rentalRequestId: "req-1" }); // missing customerId, saleId, etc.

    expect(response.status).toBe(400);
  });

  it("POST should return 400 when status is invalid", async () => {
    const app = buildApp();
    const response = await request(app)
      .post("/api/viewing-appointments")
      .set("Authorization", "Bearer fake")
      .send({
        rentalRequestId: "req-1",
        customerId: "cus-1",
        saleId: "sale-1",
        roomId: "room-1",
        bedId: "bed-1",
        scheduledAt: "2026-05-10T10:00:00.000Z",
        status: "invalidstatus",
      });

    expect(response.status).toBe(400);
  });

  it("POST should return 500 when supabase insert fails", async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { message: "insert error" } });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockedSupabase.from.mockReturnValue({ insert });

    const app = buildApp();
    const response = await request(app)
      .post("/api/viewing-appointments")
      .set("Authorization", "Bearer fake")
      .send({
        rentalRequestId: "req-1",
        customerId: "cus-1",
        saleId: "sale-1",
        roomId: "room-1",
        bedId: "bed-1",
        scheduledAt: "2026-05-10T10:00:00.000Z",
        status: "scheduled",
      });

    expect(response.status).toBe(500);
  });

  it("PATCH /:id/outcome should return 400 for invalid status", async () => {
    const app = buildApp();
    const response = await request(app)
      .patch("/api/viewing-appointments/appt-1/outcome")
      .set("Authorization", "Bearer fake")
      .send({ status: "badstatus" });

    expect(response.status).toBe(400);
  });

  it("PATCH /:id/outcome should return 404 when appointment not found (PGRST116)", async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { code: "PGRST116", message: "not found" } });
    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValue({ update });

    const app = buildApp();
    const response = await request(app)
      .patch("/api/viewing-appointments/nonexistent/outcome")
      .set("Authorization", "Bearer fake")
      .send({ status: "cancelled" });

    expect(response.status).toBe(404);
  });

  it("PATCH /:id/cancel should cancel the appointment", async () => {
    const cancelledRow = {
      id: "appt-1",
      rental_request_id: "req-1",
      customer_id: "cus-1",
      sale_id: "sale-1",
      room_id: "room-1",
      bed_id: "bed-1",
      scheduled_at: "2026-05-10T10:00:00.000Z",
      result_note: null,
      status: "cancelled",
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-04T00:00:00.000Z",
    };

    const single = jest.fn().mockResolvedValue({ data: cancelledRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValue({ update });

    const app = buildApp();
    const response = await request(app)
      .patch("/api/viewing-appointments/appt-1/cancel")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("cancelled");
  });
});
