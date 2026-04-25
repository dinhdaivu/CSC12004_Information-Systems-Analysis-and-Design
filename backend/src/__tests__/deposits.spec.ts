import express from "express";
import request from "supertest";
import depositsRoutes from "@routes/deposit.routes";
import { supabaseServiceRole } from "@config/supabase";
import { AppError } from "@utils/errors";

jest.mock("@middleware/auth.middleware", () => {
  const actual = jest.requireActual("@middleware/auth.middleware");

  return {
    ...actual,
    authMiddleware: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ): void => {
      void res;

      const roleHeader = req.headers["x-test-role"];
      const role = typeof roleHeader === "string" ? roleHeader : "accountant";

      (
        req as express.Request & {
          user?: { id: string; email: string; role: string };
        }
      ).user = {
        id: "staff-1",
        email: "staff@example.com",
        role,
      };

      next();
    },
  };
});

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

const depositPendingRow = {
  id: "dep-1",
  rental_request_id: null,
  customer_id: "cus-1",
  room_id: "room-1",
  bed_id: "bed-1",
  amount: "1500000",
  due_at: "2026-04-25T10:00:00.000Z",
  paid_at: null,
  proof_image_url: null,
  notes: null,
  status: "pending",
  created_at: "2026-04-24T10:00:00.000Z",
  updated_at: "2026-04-24T10:00:00.000Z",
  customer: {
    id: "cus-1",
    full_name: "Customer A",
    email: "customer@example.com",
    phone_number: "0909000000",
  },
  room: {
    id: "room-1",
    room_number: "A101",
    branch_id: "branch-1",
    status: "holding",
  },
};

const depositPaidRow = {
  ...depositPendingRow,
  status: "paid",
  paid_at: "2026-04-25T11:00:00.000Z",
  room: {
    ...depositPendingRow.room,
    status: "deposited",
  },
};

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/deposits", depositsRoutes);

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
}

describe("Deposit Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("PATCH /api/deposits/:id/confirm should confirm pending deposit and update room", async () => {
    const findSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({
          data: depositPendingRow,
          error: null,
        }),
      }),
    });

    const roomSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest
          .fn()
          .mockResolvedValue({ data: depositPendingRow.room, error: null }),
      }),
    });

    const depositUpdateSelect = jest.fn().mockResolvedValue({
      data: [{ id: "dep-1" }],
      error: null,
    });
    const depositUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({ select: depositUpdateSelect }),
      }),
    });

    const roomUpdateSelect = jest.fn().mockResolvedValue({
      data: [{ id: "room-1" }],
      error: null,
    });
    const roomUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({ select: roomUpdateSelect }),
    });

    const paymentInsert = jest
      .fn()
      .mockResolvedValue({ data: [{ id: "pay-1" }], error: null });

    const detailSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({
          data: depositPaidRow,
          error: null,
        }),
      }),
    });

    mockedSupabase.from
      .mockReturnValueOnce({ select: findSelect })
      .mockReturnValueOnce({ select: roomSelect })
      .mockReturnValueOnce({ update: depositUpdate })
      .mockReturnValueOnce({ update: roomUpdate })
      .mockReturnValueOnce({ insert: paymentInsert })
      .mockReturnValueOnce({ select: detailSelect });

    const app = buildApp();
    const response = await request(app)
      .patch("/api/deposits/dep-1/confirm")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.deposit.status).toBe("paid");
    expect(depositUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "paid" }),
    );
    expect(roomUpdate).toHaveBeenCalledWith({ status: "deposited" });
    expect(paymentInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        deposit_request_id: "dep-1",
        type: "deposit",
        status: "completed",
      }),
    );
  });

  it("PATCH /api/deposits/:id/cancel should cancel pending deposit and release room", async () => {
    const findSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({
          data: depositPendingRow,
          error: null,
        }),
      }),
    });

    const roomSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest
          .fn()
          .mockResolvedValue({ data: depositPendingRow.room, error: null }),
      }),
    });

    const cancelUpdateSelect = jest.fn().mockResolvedValue({
      data: [{ id: "dep-1" }],
      error: null,
    });
    const cancelUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({ select: cancelUpdateSelect }),
      }),
    });

    const activeIn = jest.fn().mockResolvedValue({ data: [], error: null });
    const activeSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        neq: jest.fn().mockReturnValue({ in: activeIn }),
      }),
    });

    const roomUpdateSelect = jest.fn().mockResolvedValue({
      data: [{ id: "room-1" }],
      error: null,
    });
    const roomUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({ select: roomUpdateSelect }),
    });

    const detailSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            ...depositPendingRow,
            status: "cancelled",
            room: {
              ...depositPendingRow.room,
              status: "available",
            },
          },
          error: null,
        }),
      }),
    });

    mockedSupabase.from
      .mockReturnValueOnce({ select: findSelect })
      .mockReturnValueOnce({ select: roomSelect })
      .mockReturnValueOnce({ update: cancelUpdate })
      .mockReturnValueOnce({ select: activeSelect })
      .mockReturnValueOnce({ update: roomUpdate })
      .mockReturnValueOnce({ select: detailSelect });

    const app = buildApp();
    const response = await request(app)
      .patch("/api/deposits/dep-1/cancel")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.deposit.status).toBe("cancelled");
    expect(cancelUpdate).toHaveBeenCalledWith({ status: "cancelled" });
    expect(roomUpdate).toHaveBeenCalledWith({ status: "available" });
  });

  it("PATCH /api/deposits/:id/confirm should fail when status is not pending", async () => {
    const findSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({
          data: depositPaidRow,
          error: null,
        }),
      }),
    });

    mockedSupabase.from.mockReturnValueOnce({ select: findSelect });

    const app = buildApp();
    const response = await request(app)
      .patch("/api/deposits/dep-1/confirm")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("CONFLICT");
  });

  it("PATCH /api/deposits/:id/confirm should fail for unauthorized role", async () => {
    const app = buildApp();
    const response = await request(app)
      .patch("/api/deposits/dep-1/confirm")
      .set("Authorization", "Bearer fake")
      .set("x-test-role", "customer");

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("GET /api/deposits should list deposits by status filter", async () => {
    const filteredRows = [{ ...depositPendingRow }];

    const eq = jest.fn().mockResolvedValue({ data: filteredRows, error: null });
    const order = jest.fn().mockReturnValue({ eq });
    const select = jest.fn().mockReturnValue({ order });

    mockedSupabase.from.mockReturnValueOnce({ select });

    const app = buildApp();
    const response = await request(app)
      .get("/api/deposits?status=pending")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].status).toBe("pending");
    expect(eq).toHaveBeenCalledWith("status", "pending");
  });
});
