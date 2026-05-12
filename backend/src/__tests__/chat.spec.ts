import request from "supertest";
import express from "express";
import chatRoutes from "../routes/chat.routes";
import { supabaseServiceRole } from "../config/supabase";

jest.mock("../middleware/auth.middleware", () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = {
      id: req.headers["x-test-user-id"] || "user-1",
      email: "test@example.com",
      role: req.headers["x-test-role"] || "customer",
    };
    next();
  },
  roleMiddleware: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  },
}));

jest.mock("../config/supabase", () => ({
  supabaseServiceRole: { from: jest.fn() },
}));

function createSupabaseMock(resolveValue: any, errorValue: any = null) {
  const chain: any = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    update: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    neq: jest.fn(() => chain),
    is: jest.fn(() => chain),
    order: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    single: jest.fn().mockResolvedValue({ data: resolveValue, error: errorValue }),
    maybeSingle: jest.fn().mockResolvedValue({ data: resolveValue, error: errorValue }),
  };
  chain.then = (onfulfilled: any) =>
    Promise.resolve({ data: resolveValue, error: errorValue }).then(onfulfilled);
  return chain;
}

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/chat", chatRoutes);
  app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  });
  return app;
};

describe("Chat API & Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /conversations should create or get conversation", async () => {
    (supabaseServiceRole!.from as jest.Mock).mockImplementation(() =>
      createSupabaseMock({ id: "conv-1", status: "open" })
    );
    const app = buildApp();
    const res = await request(app).post("/api/chat/conversations").set("x-test-role", "customer");
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("conv-1");
  });

  it("GET /conversations should return conversations for staff", async () => {
    (supabaseServiceRole!.from as jest.Mock).mockImplementation(() =>
      createSupabaseMock([{ id: "conv-1", messages: [] }])
    );
    const app = buildApp();
    const res = await request(app).get("/api/chat/conversations").set("x-test-role", "manager");
    expect(res.status).toBe(200);
  });

  it("GET /conversations/:id/messages should return messages", async () => {
    (supabaseServiceRole!.from as jest.Mock).mockImplementation((table) => {
      if (table === "conversations") return createSupabaseMock({ id: "conv-1", customer_id: "user-1", status: "open" });
      return createSupabaseMock([{ id: "msg-1", content: "hello" }]);
    });
    const app = buildApp();
    const res = await request(app).get("/api/chat/conversations/conv-1/messages").set("x-test-role", "customer");
    expect(res.status).toBe(200);
  });

  it("POST /conversations/:id/messages should send a message", async () => {
    (supabaseServiceRole!.from as jest.Mock).mockImplementation((table) => {
      if (table === "conversations") return createSupabaseMock({ id: "conv-1", customer_id: "user-1", status: "open" });
      return createSupabaseMock({ id: "msg-1", content: "hello" });
    });
    const app = buildApp();
    const res = await request(app)
      .post("/api/chat/conversations/conv-1/messages")
      .set("x-test-role", "customer")
      .send({ content: "hello" });
    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe("hello");
  });

  it("PATCH /conversations/:id/read should mark as read", async () => {
    (supabaseServiceRole!.from as jest.Mock).mockImplementation((table) => {
      if (table === "conversations") return createSupabaseMock({ id: "conv-1", customer_id: "user-1", status: "open" });
      return createSupabaseMock([{ id: "msg-1", read_at: "2026-01-01" }]);
    });
    const app = buildApp();
    const res = await request(app).patch("/api/chat/conversations/conv-1/read").set("x-test-role", "customer");
    expect(res.status).toBe(200);
  });
});