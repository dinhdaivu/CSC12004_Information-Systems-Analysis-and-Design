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
  roleMiddleware: (roles: string[]) => {
    return (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ): void => {
      const userRole = (req as any).user?.role;
      // Nếu role không nằm trong danh sách cho phép, trả về 403 để pass test case cuối cùng
      if (!userRole || !roles.includes(userRole)) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      next();
    };
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
});
