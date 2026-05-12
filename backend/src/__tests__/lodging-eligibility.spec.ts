import request from "supertest";
import express from "express";
import lodgingEligibilityRoutes from "../routes/lodging-eligibility.routes";
import { supabaseServiceRole } from "../config/supabase";

jest.mock("../middleware/auth.middleware", () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: "admin-1", email: "admin@example.com", role: req.headers["x-test-role"] || "manager" };
    next();
  },
  roleMiddleware: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  }
}));

jest.mock("../config/supabase", () => ({
  supabaseServiceRole: { from: jest.fn() },
}));

function createSupabaseMock(resolveValue: any, errorValue: any = null) {
  const chain: any = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    order: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    single: jest.fn().mockResolvedValue({ data: resolveValue, error: errorValue }),
    maybeSingle: jest.fn().mockResolvedValue({ data: resolveValue, error: errorValue }),
  };
  chain.then = (onfulfilled: any) => Promise.resolve({ data: resolveValue, error: errorValue }).then(onfulfilled);
  return chain;
}

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/lodging-eligibility", lodgingEligibilityRoutes);
  app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  });
  return app;
};

describe("Lodging Eligibility API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /:customerId should return input data", async () => {
    (supabaseServiceRole!.from as jest.Mock).mockImplementation((table) => {
      if (table === "users") return createSupabaseMock({ id: "cus-1", full_name: "John" });
      if (table === "deposit_requests") return createSupabaseMock({ id: "dep-1", amount: 100 });
      if (table === "lodging_eligibility_checks") return createSupabaseMock({ decision: "eligible", reasons: [] });
      return createSupabaseMock({});
    });

    const app = buildApp();
    const res = await request(app).get("/api/lodging-eligibility/cus-1").set("x-test-role", "manager");
    
    expect(res.status).toBe(200);
    expect(res.body.data.customer.fullName).toBe("John");
  });

  it("POST /check should evaluate and save eligibility (Eligible)", async () => {
    (supabaseServiceRole!.from as jest.Mock).mockImplementation(() => {
      return createSupabaseMock({ decision: "eligible", reasons: [] });
    });

    const app = buildApp();
    const res = await request(app).post("/api/lodging-eligibility/check").set("x-test-role", "manager").send({
      customerId: "cus-1",
      identityVerified: true,
      documentsComplete: true,
      backgroundCheckPassed: true,
      healthRequirementsMet: true,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.decision).toBe("eligible");
  });

  it("POST /check should save as ineligible if checks fail", async () => {
    (supabaseServiceRole!.from as jest.Mock).mockImplementation(() => {
      return createSupabaseMock({ decision: "ineligible", reasons: ["Identity information is not verified"] });
    });

    const app = buildApp();
    const res = await request(app).post("/api/lodging-eligibility/check").set("x-test-role", "manager").send({
      customerId: "cus-1",
      identityVerified: false,
      documentsComplete: true,
      backgroundCheckPassed: true,
    });
    expect(res.status).toBe(200);
  });
});