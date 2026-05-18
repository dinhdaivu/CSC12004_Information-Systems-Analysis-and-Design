import express from "express";
import request from "supertest";
import paymentRoutes from "@routes/payment.routes";
import { PaymentService } from "@services/payment.service";

jest.mock("@services/payment.service", () => ({
  PaymentService: {
    getPayments: jest.fn(),
  },
}));

jest.mock("@config/supabase", () => ({
  supabaseServiceRole: null,
}));

jest.mock("@middleware/auth.middleware", () => {
  const actual = jest.requireActual("@middleware/auth.middleware");
  return {
    ...actual,
    authMiddleware: (
      req: express.Request,
      _res: express.Response,
      next: express.NextFunction,
    ): void => {
      const roleHeader = req.headers["x-test-role"];
      const role = typeof roleHeader === "string" ? roleHeader : "accountant";
      (req as express.Request & { user?: { id: string; email: string; role: string } }).user = {
        id: "staff-1",
        email: "staff@example.com",
        role,
      };
      next();
    },
    roleMiddleware:
      (roles: string[]) =>
      (req: express.Request, res: express.Response, next: express.NextFunction): void => {
        const user = (req as express.Request & { user?: { role: string } }).user;
        if (!user || !roles.includes(user.role)) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }
        next();
      },
  };
});

const MockService = PaymentService as jest.Mocked<typeof PaymentService>;

const app = express();
app.use(express.json());
app.use("/payments", paymentRoutes);
app.use(
  (err: { statusCode?: number; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  },
);

beforeEach(() => jest.clearAllMocks());

describe("GET /payments (parseFilters branches)", () => {
  it("should return 200 with no filters", async () => {
    MockService.getPayments.mockResolvedValue([] as never);

    const res = await request(app)
      .get("/payments")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(200);
  });

  it("should return 400 for invalid type filter", async () => {
    const res = await request(app)
      .get("/payments?type=invalid_type")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(400);
    expect(MockService.getPayments).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid status filter", async () => {
    const res = await request(app)
      .get("/payments?status=bad_status")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(400);
    expect(MockService.getPayments).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid fromDate", async () => {
    const res = await request(app)
      .get("/payments?fromDate=not-a-date")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(400);
  });

  it("should return 400 for invalid toDate", async () => {
    const res = await request(app)
      .get("/payments?toDate=not-a-date")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(400);
  });

  it("should return 400 when fromDate is after toDate", async () => {
    const res = await request(app)
      .get("/payments?fromDate=2026-06-01&toDate=2026-05-01")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(400);
  });

  it("should accept valid date range and pass filters", async () => {
    MockService.getPayments.mockResolvedValue([] as never);

    const res = await request(app)
      .get("/payments?fromDate=2026-05-01&toDate=2026-06-01&type=deposit&status=completed")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(200);
    expect(MockService.getPayments).toHaveBeenCalledWith(
      expect.objectContaining({ type: "deposit", status: "completed" }),
    );
  });

  it("should pass undefined for whitespace-only filter values", async () => {
    MockService.getPayments.mockResolvedValue([] as never);

    await request(app)
      .get("/payments?type=%20%20")
      .set("x-test-role", "accountant");

    expect(MockService.getPayments).toHaveBeenCalledWith(
      expect.objectContaining({ type: undefined }),
    );
  });

  it("should return 403 for customer role", async () => {
    const res = await request(app)
      .get("/payments")
      .set("x-test-role", "customer");

    expect(res.status).toBe(403);
  });

  it("should accept valid paymentMethod and pass to service", async () => {
    MockService.getPayments.mockResolvedValue([] as never);

    const res = await request(app)
      .get("/payments?paymentMethod=cash")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(200);
  });

  it("should ignore invalid paymentMethod (empty block, no error thrown)", async () => {
    MockService.getPayments.mockResolvedValue([] as never);

    const res = await request(app)
      .get("/payments?paymentMethod=unknown_method")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(200);
  });
});
