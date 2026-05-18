import express from "express";
import request from "supertest";
import disputeRoutes from "@routes/dispute.routes";
import { DisputeService } from "@services/dispute.service";

jest.mock("@services/dispute.service", () => ({
  DisputeService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    resolve: jest.fn(),
  },
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
      const role = typeof roleHeader === "string" ? roleHeader : "customer";
      const idHeader = req.headers["x-test-user-id"];
      const id = typeof idHeader === "string" ? idHeader : "user-1";
      (req as express.Request & { user?: { id: string; email: string; role: string } }).user = {
        id,
        email: "user@example.com",
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

const MockService = DisputeService as jest.Mocked<typeof DisputeService>;

const app = express();
app.use(express.json());
app.use("/disputes", disputeRoutes);
app.use(
  (err: { statusCode?: number; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  },
);

const disputeRow = {
  id: "d-1",
  settlementId: null,
  checkoutRequestId: "co-1",
  customerId: "cust-1",
  name: "Jane",
  branch: "Branch A",
  reason: "Incorrect charge",
  evidenceUrl: null,
  status: "pending",
  resolvedAt: null,
  resolvedBy: null,
  resolutionNote: null,
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
};

beforeEach(() => jest.clearAllMocks());

describe("GET /disputes", () => {
  it("should return disputes scoped to customer id when role is customer", async () => {
    MockService.list.mockResolvedValue([disputeRow] as never);

    const res = await request(app)
      .get("/disputes")
      .set("x-test-role", "customer")
      .set("x-test-user-id", "cust-1");

    expect(res.status).toBe(200);
    expect(MockService.list).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: "cust-1" }),
    );
  });

  it("should allow staff to see all disputes without scoping", async () => {
    MockService.list.mockResolvedValue([] as never);

    const res = await request(app)
      .get("/disputes")
      .set("x-test-role", "sale")
      .set("x-test-user-id", "staff-1");

    expect(res.status).toBe(200);
    expect(MockService.list).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: undefined }),
    );
  });

  it("should pass customerId query param for staff", async () => {
    MockService.list.mockResolvedValue([] as never);

    await request(app)
      .get("/disputes?customerId=cust-2")
      .set("x-test-role", "admin");

    expect(MockService.list).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: "cust-2" }),
    );
  });

  it("should pass status filter when provided", async () => {
    MockService.list.mockResolvedValue([] as never);

    await request(app)
      .get("/disputes?status=resolved")
      .set("x-test-role", "manager");

    expect(MockService.list).toHaveBeenCalledWith(
      expect.objectContaining({ status: "resolved" }),
    );
  });

  it("should pass undefined status when not a string query param", async () => {
    MockService.list.mockResolvedValue([] as never);

    await request(app)
      .get("/disputes")
      .set("x-test-role", "manager");

    expect(MockService.list).toHaveBeenCalledWith(
      expect.objectContaining({ status: undefined }),
    );
  });

  it("should return 500 on service error", async () => {
    MockService.list.mockRejectedValue({ statusCode: 500, message: "db error" });

    const res = await request(app)
      .get("/disputes")
      .set("x-test-role", "customer");

    expect(res.status).toBe(500);
  });
});

describe("GET /disputes/:id", () => {
  it("should return dispute by id", async () => {
    MockService.getById.mockResolvedValue(disputeRow as never);

    const res = await request(app)
      .get("/disputes/d-1")
      .set("x-test-role", "customer");

    expect(res.status).toBe(200);
    expect(MockService.getById).toHaveBeenCalledWith("d-1");
  });

  it("should return 404 when not found", async () => {
    MockService.getById.mockRejectedValue({ statusCode: 404, message: "Not found" });

    const res = await request(app)
      .get("/disputes/missing")
      .set("x-test-role", "customer");

    expect(res.status).toBe(404);
  });
});

describe("POST /disputes", () => {
  it("should create a dispute for authenticated user", async () => {
    MockService.create.mockResolvedValue(disputeRow as never);

    const res = await request(app)
      .post("/disputes")
      .set("x-test-role", "customer")
      .set("x-test-user-id", "cust-1")
      .send({ name: "Jane", reason: "Incorrect charge" });

    expect(res.status).toBe(201);
    expect(MockService.create).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: "cust-1", name: "Jane", reason: "Incorrect charge" }),
    );
  });

  it("should return 400 when name is not a string (fallback to empty string)", async () => {
    MockService.create.mockRejectedValue({ statusCode: 400, message: "name required" });

    const res = await request(app)
      .post("/disputes")
      .set("x-test-role", "customer")
      .set("x-test-user-id", "cust-1")
      .send({ name: 123, reason: "r" });

    expect(MockService.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "" }),
    );
    expect(res.status).toBe(400);
  });

  it("should pass optional fields when provided as strings", async () => {
    MockService.create.mockResolvedValue(disputeRow as never);

    await request(app)
      .post("/disputes")
      .set("x-test-role", "customer")
      .set("x-test-user-id", "cust-1")
      .send({
        name: "Jane",
        reason: "r",
        settlementId: "s-1",
        checkoutRequestId: "co-1",
        branch: "Branch A",
        evidenceUrl: "https://cdn/ev.jpg",
        evidenceBase64: "data:image/png;base64,abc",
      });

    expect(MockService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        settlementId: "s-1",
        checkoutRequestId: "co-1",
        branch: "Branch A",
        evidenceUrl: "https://cdn/ev.jpg",
        evidenceBase64: "data:image/png;base64,abc",
      }),
    );
  });

  it("should pass undefined for optional fields when not strings", async () => {
    MockService.create.mockResolvedValue(disputeRow as never);

    await request(app)
      .post("/disputes")
      .set("x-test-role", "customer")
      .set("x-test-user-id", "cust-1")
      .send({ name: "Jane", reason: "r", settlementId: 999 });

    expect(MockService.create).toHaveBeenCalledWith(
      expect.objectContaining({ settlementId: undefined }),
    );
  });

  it("should return 400 when customerId is falsy (line 34 branch)", async () => {
    const res = await request(app)
      .post("/disputes")
      .set("x-test-role", "customer")
      .set("x-test-user-id", "")
      .send({ name: "Jane", reason: "r" });

    expect(res.status).toBe(400);
    expect(MockService.create).not.toHaveBeenCalled();
  });

  it("should use empty string for reason when not a string (line 42 FALSE branch)", async () => {
    MockService.create.mockRejectedValue({ statusCode: 400, message: "reason required" });

    await request(app)
      .post("/disputes")
      .set("x-test-role", "customer")
      .set("x-test-user-id", "cust-1")
      .send({ name: "Jane", reason: 123 });

    expect(MockService.create).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "" }),
    );
  });
});

describe("PATCH /disputes/:id/resolve", () => {
  it("should return 403 for non-staff role", async () => {
    const res = await request(app)
      .patch("/disputes/d-1/resolve")
      .set("x-test-role", "customer")
      .send({ status: "resolved" });

    expect(res.status).toBe(403);
    expect(MockService.resolve).not.toHaveBeenCalled();
  });

  it("should return 400 when status is missing", async () => {
    const res = await request(app)
      .patch("/disputes/d-1/resolve")
      .set("x-test-role", "sale")
      .send({});

    expect(res.status).toBe(400);
    expect(MockService.resolve).not.toHaveBeenCalled();
  });

  it("should return 400 when status is not in RESOLVABLE list", async () => {
    const res = await request(app)
      .patch("/disputes/d-1/resolve")
      .set("x-test-role", "admin")
      .send({ status: "pending" });

    expect(res.status).toBe(400);
  });

  it("should resolve dispute with valid status", async () => {
    MockService.resolve.mockResolvedValue({ dispute: { ...disputeRow, status: "resolved" } } as never);

    const res = await request(app)
      .patch("/disputes/d-1/resolve")
      .set("x-test-role", "admin")
      .set("x-test-user-id", "staff-1")
      .send({ status: "resolved", resolutionNote: "Accepted" });

    expect(res.status).toBe(200);
    expect(MockService.resolve).toHaveBeenCalledWith("d-1", {
      status: "resolved",
      resolutionNote: "Accepted",
      resolvedBy: "staff-1",
    });
  });

  it("should resolve with status reviewing", async () => {
    MockService.resolve.mockResolvedValue({ dispute: disputeRow } as never);

    const res = await request(app)
      .patch("/disputes/d-1/resolve")
      .set("x-test-role", "manager")
      .send({ status: "reviewing" });

    expect(res.status).toBe(200);
    expect(MockService.resolve).toHaveBeenCalledWith("d-1", expect.objectContaining({ status: "reviewing" }));
  });

  it("should resolve with status rejected", async () => {
    MockService.resolve.mockResolvedValue({ dispute: disputeRow } as never);

    const res = await request(app)
      .patch("/disputes/d-1/resolve")
      .set("x-test-role", "accountant")
      .send({ status: "rejected" });

    expect(res.status).toBe(200);
  });

  it("should return 409 on conflict error from service", async () => {
    MockService.resolve.mockRejectedValue({ statusCode: 409, message: "Already resolved" });

    const res = await request(app)
      .patch("/disputes/d-1/resolve")
      .set("x-test-role", "admin")
      .send({ status: "resolved" });

    expect(res.status).toBe(409);
  });

  it("should return 400 when resolvedBy is falsy (line 53 branch)", async () => {
    const res = await request(app)
      .patch("/disputes/d-1/resolve")
      .set("x-test-role", "admin")
      .set("x-test-user-id", "")
      .send({ status: "resolved" });

    expect(res.status).toBe(400);
    expect(MockService.resolve).not.toHaveBeenCalled();
  });
});
