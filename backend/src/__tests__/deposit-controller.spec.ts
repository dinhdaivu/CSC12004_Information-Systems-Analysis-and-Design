import express from "express";
import request from "supertest";
import depositRoutes from "@routes/deposit.routes";
import { DepositService } from "@services/deposit.service";

jest.mock("@services/deposit.service", () => ({
  DepositService: {
    createDeposit: jest.fn(),
    getDeposits: jest.fn(),
    getDepositById: jest.fn(),
    confirmDeposit: jest.fn(),
    cancelDeposit: jest.fn(),
  },
}));

jest.mock("@services/email.service", () => ({
  sendDepositConfirmedEmail: jest.fn().mockResolvedValue(undefined),
  sendDepositFailedEmail: jest.fn().mockResolvedValue(undefined),
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
      const idHeader = req.headers["x-test-user-id"];
      const id = typeof idHeader === "string" ? idHeader : "staff-1";
      (req as express.Request & { user?: { id: string; email: string; role: string } }).user = {
        id,
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

const MockService = DepositService as jest.Mocked<typeof DepositService>;

const app = express();
app.use(express.json());
app.use("/deposits", depositRoutes);
app.use(
  (err: { statusCode?: number; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  },
);

const depositRow = {
  id: "dep-1",
  customerId: "cust-1",
  roomId: "room-1",
  amount: 3000000,
  status: "pending",
  createdAt: "2026-05-01T00:00:00Z",
};

beforeEach(() => jest.clearAllMocks());

describe("POST /deposits (createDeposit)", () => {
  it("should return 400 when roomId is missing", async () => {
    const res = await request(app)
      .post("/deposits")
      .set("x-test-role", "accountant")
      .send({ customerId: "cust-1", amount: 3000000 });

    expect(res.status).toBe(400);
    expect(MockService.createDeposit).not.toHaveBeenCalled();
  });

  it("should return 400 when roomId is empty string", async () => {
    const res = await request(app)
      .post("/deposits")
      .set("x-test-role", "accountant")
      .send({ roomId: "", customerId: "cust-1", amount: 3000000 });

    expect(res.status).toBe(400);
  });

  it("should return 400 when customerId is missing", async () => {
    const res = await request(app)
      .post("/deposits")
      .set("x-test-role", "accountant")
      .send({ roomId: "room-1", amount: 3000000 });

    expect(res.status).toBe(400);
    expect(MockService.createDeposit).not.toHaveBeenCalled();
  });

  it("should return 400 when amount is missing (not string or number)", async () => {
    const res = await request(app)
      .post("/deposits")
      .set("x-test-role", "accountant")
      .send({ roomId: "room-1", customerId: "cust-1", amount: null });

    expect(res.status).toBe(400);
  });

  it("should create deposit with all required fields", async () => {
    MockService.createDeposit.mockResolvedValue(depositRow as never);

    const res = await request(app)
      .post("/deposits")
      .set("x-test-role", "accountant")
      .send({ roomId: "room-1", customerId: "cust-1", amount: 3000000 });

    expect(res.status).toBe(201);
    expect(MockService.createDeposit).toHaveBeenCalledWith(
      expect.objectContaining({ roomId: "room-1", customerId: "cust-1", amount: 3000000 }),
    );
  });

  it("should pass optional fields when provided as strings", async () => {
    MockService.createDeposit.mockResolvedValue(depositRow as never);

    await request(app)
      .post("/deposits")
      .set("x-test-role", "accountant")
      .send({
        roomId: "room-1",
        customerId: "cust-1",
        amount: 3000000,
        rentalRequestId: "req-1",
        bedId: "bed-1",
        dueAt: "2026-06-01",
        notes: "test note",
      });

    expect(MockService.createDeposit).toHaveBeenCalledWith(
      expect.objectContaining({
        rentalRequestId: "req-1",
        bedId: "bed-1",
        dueAt: "2026-06-01",
        notes: "test note",
      }),
    );
  });

  it("should pass undefined for optional fields when not strings", async () => {
    MockService.createDeposit.mockResolvedValue(depositRow as never);

    await request(app)
      .post("/deposits")
      .set("x-test-role", "accountant")
      .send({
        roomId: "room-1",
        customerId: "cust-1",
        amount: "3000000",
        rentalRequestId: 123,
        bedId: true,
        dueAt: 456,
        notes: [],
      });

    expect(MockService.createDeposit).toHaveBeenCalledWith(
      expect.objectContaining({
        rentalRequestId: undefined,
        bedId: undefined,
        dueAt: undefined,
        notes: undefined,
        amount: 3000000,
      }),
    );
  });

  it("should accept string amount and convert to number", async () => {
    MockService.createDeposit.mockResolvedValue(depositRow as never);

    await request(app)
      .post("/deposits")
      .set("x-test-role", "accountant")
      .send({ roomId: "room-1", customerId: "cust-1", amount: "2500000" });

    expect(MockService.createDeposit).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 2500000 }),
    );
  });
});

describe("GET /deposits (getDeposits / parseFilters)", () => {
  it("should return deposits with no filters", async () => {
    MockService.getDeposits.mockResolvedValue([] as never);

    const res = await request(app)
      .get("/deposits")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(200);
    expect(MockService.getDeposits).toHaveBeenCalledWith(
      expect.objectContaining({ status: undefined }),
    );
  });

  it("should return 400 for invalid status filter", async () => {
    const res = await request(app)
      .get("/deposits?status=invalid_status")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(400);
  });

  it("should pass valid status filter", async () => {
    MockService.getDeposits.mockResolvedValue([] as never);

    await request(app)
      .get("/deposits?status=pending")
      .set("x-test-role", "accountant");

    expect(MockService.getDeposits).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending" }),
    );
  });

  it("should return 400 for invalid fromDate", async () => {
    const res = await request(app)
      .get("/deposits?fromDate=not-a-date")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(400);
  });

  it("should return 400 when fromDate is after toDate", async () => {
    const res = await request(app)
      .get("/deposits?fromDate=2026-06-01&toDate=2026-05-01")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(400);
  });

  it("should accept valid fromDate and toDate", async () => {
    MockService.getDeposits.mockResolvedValue([] as never);

    const res = await request(app)
      .get("/deposits?fromDate=2026-05-01&toDate=2026-06-01")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(200);
  });

  it("should pass branchId and customerId filters", async () => {
    MockService.getDeposits.mockResolvedValue([] as never);

    await request(app)
      .get("/deposits?branchId=br-1&customerId=cust-1")
      .set("x-test-role", "accountant");

    expect(MockService.getDeposits).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: "br-1", customerId: "cust-1" }),
    );
  });

  it("should return undefined for whitespace-only query params", async () => {
    MockService.getDeposits.mockResolvedValue([] as never);

    await request(app)
      .get("/deposits?branchId=%20%20&customerId=%20")
      .set("x-test-role", "accountant");

    expect(MockService.getDeposits).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: undefined, customerId: undefined }),
    );
  });
});

describe("GET /deposits/:id (getDepositById)", () => {
  it("should return deposit by id", async () => {
    MockService.getDepositById.mockResolvedValue(depositRow as never);

    const res = await request(app)
      .get("/deposits/dep-1")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(200);
    expect(MockService.getDepositById).toHaveBeenCalledWith("dep-1");
  });

  it("should return 404 when deposit not found", async () => {
    MockService.getDepositById.mockRejectedValue({ statusCode: 404, message: "Not found" });

    const res = await request(app)
      .get("/deposits/missing")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(404);
  });
});

describe("PATCH /deposits/:id/confirm (confirmDeposit)", () => {
  it("should confirm deposit", async () => {
    MockService.confirmDeposit.mockResolvedValue({ deposit: depositRow } as never);

    const res = await request(app)
      .patch("/deposits/dep-1/confirm")
      .set("x-test-role", "accountant")
      .set("x-test-user-id", "staff-1");

    expect(res.status).toBe(200);
    expect(MockService.confirmDeposit).toHaveBeenCalledWith("dep-1", "staff-1");
  });

  it("should return 409 on conflict", async () => {
    MockService.confirmDeposit.mockRejectedValue({ statusCode: 409, message: "Conflict" });

    const res = await request(app)
      .patch("/deposits/dep-1/confirm")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(409);
  });

  it("should return 400 when actorId is falsy", async () => {
    const res = await request(app)
      .patch("/deposits/dep-1/confirm")
      .set("x-test-role", "accountant")
      .set("x-test-user-id", "");

    expect(res.status).toBe(400);
    expect(MockService.confirmDeposit).not.toHaveBeenCalled();
  });
});

describe("PATCH /deposits/:id/cancel (cancelDeposit)", () => {
  it("should cancel deposit", async () => {
    MockService.cancelDeposit.mockResolvedValue({ deposit: depositRow } as never);

    const res = await request(app)
      .patch("/deposits/dep-1/cancel")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(200);
    expect(MockService.cancelDeposit).toHaveBeenCalledWith("dep-1");
  });

  it("should return 409 when deposit is not pending", async () => {
    MockService.cancelDeposit.mockRejectedValue({ statusCode: 409, message: "Not pending" });

    const res = await request(app)
      .patch("/deposits/dep-1/cancel")
      .set("x-test-role", "accountant");

    expect(res.status).toBe(409);
  });
});
