import express from "express";
import request from "supertest";
import contractsRoutes from "@routes/contracts.routes";
import { AppError } from "@utils/errors";
import { supabaseServiceRole } from "@config/supabase";

jest.mock("@middleware/auth.middleware", () => ({
  authMiddleware: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void => {
    if (req.headers["x-no-auth"]) {
      next();
      return;
    }
    void res;
    const roleHeader = req.headers["x-test-role"];
    const role = typeof roleHeader === "string" ? roleHeader : "manager";

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
  roleMiddleware:
    (roles: string[]) =>
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ): void => {
      const role = (
        req as express.Request & {
          user?: { role?: string };
        }
      ).user?.role;

      if (!role || !roles.includes(role)) {
        res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Access denied" },
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

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/contracts", contractsRoutes);

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

describe("Contracts routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/contracts should return paginated contracts", async () => {
    const range = jest.fn().mockResolvedValue({
      data: [
        {
          id: "contract-1",
          customer_id: "customer-1",
          room_id: "room-1",
          bed_id: "bed-1",
          deposit_request_id: "deposit-1",
          start_date: "2026-01-01",
          end_date: "2026-07-01",
          monthly_price: 2500000,
          status: "active",
          contract_document_url: null,
          notes: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
          customer: {
            id: "customer-1",
            full_name: "Nguyen Van A",
            email: "a@example.com",
            phone_number: "0900000000",
          },
          room: {
            id: "room-1",
            room_number: "A101",
            room_type: "quad",
            status: "deposited",
          },
          bed: {
            id: "bed-1",
            bed_number: "B1",
            status: "reserved",
          },
          deposit: {
            id: "deposit-1",
            amount: 5000000,
            status: "paid",
            paid_at: "2026-01-01T00:00:00.000Z",
          },
        },
      ],
      error: null,
      count: 1,
    });
    const order = jest.fn().mockReturnValue({ range });
    const select = jest.fn().mockReturnValue({ order });

    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "contracts") {
        return { select };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const app = buildApp();
    const response = await request(app).get("/api/contracts");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.data).toHaveLength(1);
    expect(response.body.data.meta.total).toBe(1);
  });

  it("POST /api/contracts should block creation when eligibility is ineligible", async () => {
    const depositMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: "deposit-1",
        customer_id: "customer-1",
        room_id: "room-1",
        bed_id: "bed-1",
        status: "paid",
        paid_at: "2026-01-01T00:00:00.000Z",
      },
      error: null,
    });
    const depositEq = jest
      .fn()
      .mockReturnValue({ maybeSingle: depositMaybeSingle });
    const depositSelect = jest.fn().mockReturnValue({ eq: depositEq });

    const eligibilityMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: "elig-1",
        customer_id: "customer-1",
        checked_by: "manager-1",
        decision: "ineligible",
        reasons: ["documents missing"],
        notes: null,
        checked_at: "2026-01-01T00:00:00.000Z",
      },
      error: null,
    });
    const eligibilityLimit = jest
      .fn()
      .mockReturnValue({ maybeSingle: eligibilityMaybeSingle });
    const eligibilityOrder = jest
      .fn()
      .mockReturnValue({ limit: eligibilityLimit });
    const eligibilityEq = jest
      .fn()
      .mockReturnValue({ order: eligibilityOrder });
    const eligibilitySelect = jest.fn().mockReturnValue({ eq: eligibilityEq });

    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "deposit_requests") {
        return { select: depositSelect };
      }

      if (table === "lodging_eligibility_checks") {
        return { select: eligibilitySelect };
      }

      if (table === "contracts") {
        return { select: jest.fn() };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const app = buildApp();
    const response = await request(app).post("/api/contracts").send({
      customer_id: "customer-1",
      room_id: "room-1",
      bed_id: "bed-1",
      deposit_request_id: "deposit-1",
      start_date: "2026-01-01",
      end_date: "2026-07-01",
      monthly_price: 2500000,
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
  });

  it("PATCH /api/contracts/:id/sign should sign when eligibility is eligible", async () => {
    const contractMaybeSingle = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          id: "contract-1",
          customer_id: "customer-1",
          room_id: "room-1",
          bed_id: "bed-1",
          deposit_request_id: "deposit-1",
          start_date: "2026-01-01",
          end_date: "2026-07-01",
          monthly_price: 2500000,
          status: "active",
          contract_document_url: null,
          notes: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
          customer: {
            id: "customer-1",
            full_name: "Nguyen Van A",
            email: "a@example.com",
            phone_number: "0900000000",
          },
          room: {
            id: "room-1",
            room_number: "A101",
            room_type: "quad",
            status: "deposited",
          },
          bed: {
            id: "bed-1",
            bed_number: "B1",
            status: "reserved",
          },
          deposit: {
            id: "deposit-1",
            amount: 5000000,
            status: "paid",
            paid_at: "2026-01-01T00:00:00.000Z",
          },
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: "contract-1",
          customer_id: "customer-1",
          room_id: "room-1",
          bed_id: "bed-1",
          deposit_request_id: "deposit-1",
          start_date: "2026-01-01",
          end_date: "2026-07-01",
          monthly_price: 2500000,
          status: "active",
          contract_document_url: "https://example.com/contract.pdf",
          notes: "signed",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-02T00:00:00.000Z",
          customer: {
            id: "customer-1",
            full_name: "Nguyen Van A",
            email: "a@example.com",
            phone_number: "0900000000",
          },
          room: {
            id: "room-1",
            room_number: "A101",
            room_type: "quad",
            status: "deposited",
          },
          bed: {
            id: "bed-1",
            bed_number: "B1",
            status: "reserved",
          },
          deposit: {
            id: "deposit-1",
            amount: 5000000,
            status: "paid",
            paid_at: "2026-01-01T00:00:00.000Z",
          },
        },
        error: null,
      });

    const contractEqForGet = jest
      .fn()
      .mockReturnValue({ maybeSingle: contractMaybeSingle });
    const contractSelectForGet = jest
      .fn()
      .mockReturnValue({ eq: contractEqForGet });

    const contractUpdateEq = jest.fn().mockResolvedValue({ error: null });
    const contractUpdate = jest.fn().mockReturnValue({ eq: contractUpdateEq });

    const eligibilityMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: "elig-1",
        customer_id: "customer-1",
        checked_by: "manager-1",
        decision: "eligible",
        reasons: [],
        notes: null,
        checked_at: "2026-01-01T00:00:00.000Z",
      },
      error: null,
    });
    const eligibilityLimit = jest
      .fn()
      .mockReturnValue({ maybeSingle: eligibilityMaybeSingle });
    const eligibilityOrder = jest
      .fn()
      .mockReturnValue({ limit: eligibilityLimit });
    const eligibilityEq = jest
      .fn()
      .mockReturnValue({ order: eligibilityOrder });
    const eligibilitySelect = jest.fn().mockReturnValue({ eq: eligibilityEq });

    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === "contracts") {
        return {
          select: contractSelectForGet,
          update: contractUpdate,
        };
      }

      if (table === "lodging_eligibility_checks") {
        return { select: eligibilitySelect };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const app = buildApp();
    const response = await request(app)
      .patch("/api/contracts/contract-1/sign")
      .send({
        contractDocumentUrl: "https://example.com/contract.pdf",
        notes: "signed",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(contractUpdate).toHaveBeenCalled();
  });

  describe("Validations", () => {
    it("GET /api/contracts should validate pagination limit", async () => {
      const app = buildApp();
      const response = await request(app).get("/api/contracts?limit=200");
      expect(response.status).toBe(400);
    });

    it("GET /api/contracts should validate positive integers", async () => {
      const app = buildApp();
      const response = await request(app).get("/api/contracts?page=-1");
      expect(response.status).toBe(400);
    });

    it("GET /api/contracts/:id should validate id", async () => {
      const app = buildApp();
      const response = await request(app).get("/api/contracts/%20%20%20");
      expect(response.status).toBe(400);
    });

    it("PATCH /api/contracts/:id/sign should validate contractDocumentUrl string", async () => {
      const app = buildApp();
      const response = await request(app).patch("/api/contracts/c1/sign").send({ contractDocumentUrl: 123 });
      expect(response.status).toBe(400);
    });

    it("PATCH /api/contracts/:id/sign should validate notes string", async () => {
      const app = buildApp();
      const response = await request(app).patch("/api/contracts/c1/sign").send({ notes: 123 });
      expect(response.status).toBe(400);
    });

    it("POST /api/contracts should validate customer_id", async () => {
      const app = buildApp();
      const response = await request(app).post("/api/contracts").send({ customer_id: 123 });
      expect(response.status).toBe(400);
    });

    it("POST /api/contracts should validate room_id", async () => {
      const app = buildApp();
      const response = await request(app).post("/api/contracts").send({ customer_id: "c1", room_id: "" });
      expect(response.status).toBe(400);
    });

    it("POST /api/contracts should validate start_date", async () => {
      const app = buildApp();
      const response = await request(app).post("/api/contracts").send({ customer_id: "c1", room_id: "r1", start_date: "" });
      expect(response.status).toBe(400);
    });

    it("POST /api/contracts should validate end_date", async () => {
      const app = buildApp();
      const response = await request(app).post("/api/contracts").send({ customer_id: "c1", room_id: "r1", start_date: "2026-01-01", end_date: "" });
      expect(response.status).toBe(400);
    });

    it("POST /api/contracts should validate monthly_price", async () => {
      const app = buildApp();
      const response = await request(app).post("/api/contracts").send({ customer_id: "c1", room_id: "r1", start_date: "2026-01-01", end_date: "2026-12-31", monthly_price: "abc" });
      expect(response.status).toBe(400);
    });

    it("POST /api/contracts should throw if unauthenticated", async () => {
      const app = buildApp();
      const response = await request(app).post("/api/contracts").set("x-no-auth", "true").send({ customer_id: "c1" });
      expect(response.status).toBe(403);
    });
  });

  describe("Contracts Service Logic", () => {
    it("POST /api/contracts should validate end_date > start_date", async () => {
      const app = buildApp();
      const response = await request(app).post("/api/contracts").send({
        customer_id: "c1", room_id: "r1", start_date: "2026-12-31", end_date: "2026-01-01", monthly_price: 1000
      });
      expect(response.status).toBe(400);
    });

    it("POST /api/contracts should throw if deposit request not found", async () => {
      mockedSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }) }) })
      }));
      const app = buildApp();
      const response = await request(app).post("/api/contracts").send({
        customer_id: "c1", room_id: "r1", start_date: "2026-01-01", end_date: "2026-12-31", monthly_price: 1000, deposit_request_id: "d1"
      });
      expect(response.status).toBe(404);
    });

    it("POST /api/contracts should throw if deposit is not paid", async () => {
      mockedSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: { status: "pending" }, error: null }) }) })
      }));
      const app = buildApp();
      const response = await request(app).post("/api/contracts").send({
        customer_id: "c1", room_id: "r1", start_date: "2026-01-01", end_date: "2026-12-31", monthly_price: 1000, deposit_request_id: "d1"
      });
      expect(response.status).toBe(409);
    });

    it("POST /api/contracts should throw if deposit customer mismatch", async () => {
      mockedSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: { status: "paid", customer_id: "c2" }, error: null }) }) })
      }));
      const app = buildApp();
      const response = await request(app).post("/api/contracts").send({
        customer_id: "c1", room_id: "r1", start_date: "2026-01-01", end_date: "2026-12-31", monthly_price: 1000, deposit_request_id: "d1"
      });
      expect(response.status).toBe(409);
    });

    it("POST /api/contracts should throw if duplicate contract exists for deposit", async () => {
      mockedSupabase.from.mockImplementation((table: string) => {
        if (table === "deposit_requests") {
          return { select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: { status: "paid", customer_id: "c1", room_id: "r1" }, error: null }) }) }) };
        }
        if (table === "lodging_eligibility_checks") {
          return { select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ order: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: { decision: "eligible" }, error: null }) }) }) }) }) };
        }
        if (table === "contracts") {
          return { select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue({ data: [{ id: "c1" }], error: null }) }) }) };
        }
      });
      const app = buildApp();
      const response = await request(app).post("/api/contracts").send({
        customer_id: "c1", room_id: "r1", start_date: "2026-01-01", end_date: "2026-12-31", monthly_price: 1000, deposit_request_id: "d1"
      });
      expect(response.status).toBe(409);
    });
  });
});
