import express from "express";
import request from "supertest";
import paymentsRoutes from "@routes/payment.routes";
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

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/payments", paymentsRoutes);

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

describe("Payment Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/payments should return filtered list", async () => {
    const rows = [
      {
        id: "pay-1",
        user_id: "staff-1",
        deposit_request_id: "dep-1",
        amount: "1500000",
        type: "deposit",
        status: "completed",
        payment_method: "cash",
        created_at: "2026-04-25T12:00:00.000Z",
        updated_at: "2026-04-25T12:00:00.000Z",
      },
    ];

    const eqStatus = jest.fn().mockResolvedValue({ data: rows, error: null });
    const eqType = jest.fn().mockReturnValue({ eq: eqStatus });
    const order = jest.fn().mockReturnValue({ eq: eqType });
    const select = jest.fn().mockReturnValue({ order });

    mockedSupabase.from.mockReturnValueOnce({ select });

    const app = buildApp();
    const response = await request(app)
      .get("/api/payments?type=deposit&status=completed")
      .set("Authorization", "Bearer fake");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        id: "pay-1",
        type: "deposit",
        status: "completed",
        paymentMethod: "cash",
      }),
    );
    expect(eqType).toHaveBeenCalledWith("type", "deposit");
    expect(eqStatus).toHaveBeenCalledWith("status", "completed");
  });

  it("GET /api/payments should reject unauthorized role", async () => {
    const app = buildApp();
    const response = await request(app)
      .get("/api/payments")
      .set("Authorization", "Bearer fake")
      .set("x-test-role", "customer");

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
