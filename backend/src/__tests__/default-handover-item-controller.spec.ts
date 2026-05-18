import express from "express";
import request from "supertest";
import defaultHandoverItemRoutes from "@routes/default-handover-item.routes";
import { DefaultHandoverItemService } from "@services/default-handover-item.service";

jest.mock("@services/default-handover-item.service", () => ({
  DefaultHandoverItemService: {
    list: jest.fn(),
    resolveForRoomType: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
      (req as express.Request & { user?: { id: string; email: string; role: string } }).user = {
        id: "user-1",
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

const MockService = DefaultHandoverItemService as jest.Mocked<typeof DefaultHandoverItemService>;

const app = express();
app.use(express.json());
app.use("/default-handover-items", defaultHandoverItemRoutes);
app.use(
  (err: { statusCode?: number; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  },
);

const itemRow = {
  id: "item-1",
  roomTypeMatch: "*",
  itemName: "Light Bulb",
  defaultCondition: "Good",
  sortOrder: 1,
  active: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const resolvedItem = {
  itemName: "Light Bulb",
  itemCondition: "Good",
  notes: "",
  sortOrder: 1,
};

beforeEach(() => jest.clearAllMocks());

describe("GET /default-handover-items", () => {
  it("should call list with activeOnly=false when param not provided", async () => {
    MockService.list.mockResolvedValue([itemRow] as never);

    const res = await request(app)
      .get("/default-handover-items")
      .set("x-test-role", "customer");

    expect(res.status).toBe(200);
    expect(MockService.list).toHaveBeenCalledWith(false);
  });

  it("should call list with activeOnly=true when query param is 'true'", async () => {
    MockService.list.mockResolvedValue([itemRow] as never);

    const res = await request(app)
      .get("/default-handover-items?activeOnly=true")
      .set("x-test-role", "customer");

    expect(res.status).toBe(200);
    expect(MockService.list).toHaveBeenCalledWith(true);
  });

  it("should call list with activeOnly=false when param is '1' (not 'true')", async () => {
    MockService.list.mockResolvedValue([] as never);

    await request(app)
      .get("/default-handover-items?activeOnly=1")
      .set("x-test-role", "customer");

    expect(MockService.list).toHaveBeenCalledWith(false);
  });

  it("should return 500 on service error", async () => {
    MockService.list.mockRejectedValue({ statusCode: 500, message: "db error" });

    const res = await request(app)
      .get("/default-handover-items")
      .set("x-test-role", "customer");

    expect(res.status).toBe(500);
  });
});

describe("GET /default-handover-items/resolve", () => {
  it("should call resolveForRoomType with roomType when string query param provided", async () => {
    MockService.resolveForRoomType.mockResolvedValue([resolvedItem] as never);

    const res = await request(app)
      .get("/default-handover-items/resolve?roomType=dorm")
      .set("x-test-role", "customer");

    expect(res.status).toBe(200);
    expect(MockService.resolveForRoomType).toHaveBeenCalledWith("dorm");
  });

  it("should call resolveForRoomType with undefined when roomType not provided", async () => {
    MockService.resolveForRoomType.mockResolvedValue([] as never);

    await request(app)
      .get("/default-handover-items/resolve")
      .set("x-test-role", "customer");

    expect(MockService.resolveForRoomType).toHaveBeenCalledWith(undefined);
  });

  it("should return 500 on service error", async () => {
    MockService.resolveForRoomType.mockRejectedValue({ statusCode: 500, message: "db error" });

    const res = await request(app)
      .get("/default-handover-items/resolve")
      .set("x-test-role", "customer");

    expect(res.status).toBe(500);
  });
});

describe("POST /default-handover-items", () => {
  it("should return 403 for non-staff role", async () => {
    const res = await request(app)
      .post("/default-handover-items")
      .set("x-test-role", "customer")
      .send({ itemName: "Bulb", roomTypeMatch: "*" });

    expect(res.status).toBe(403);
    expect(MockService.create).not.toHaveBeenCalled();
  });

  it("should create item for staff role", async () => {
    MockService.create.mockResolvedValue(itemRow as never);

    const res = await request(app)
      .post("/default-handover-items")
      .set("x-test-role", "admin")
      .send({ itemName: "Light Bulb", roomTypeMatch: "*", defaultCondition: "Good", sortOrder: 1, active: true });

    expect(res.status).toBe(201);
    expect(MockService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        itemName: "Light Bulb",
        roomTypeMatch: "*",
        defaultCondition: "Good",
        sortOrder: 1,
        active: true,
      }),
    );
  });

  it("should pass undefined defaultCondition when not a string", async () => {
    MockService.create.mockResolvedValue(itemRow as never);

    await request(app)
      .post("/default-handover-items")
      .set("x-test-role", "admin")
      .send({ itemName: "Bulb", roomTypeMatch: "*", defaultCondition: 123 });

    expect(MockService.create).toHaveBeenCalledWith(
      expect.objectContaining({ defaultCondition: undefined }),
    );
  });

  it("should pass undefined sortOrder when not a number", async () => {
    MockService.create.mockResolvedValue(itemRow as never);

    await request(app)
      .post("/default-handover-items")
      .set("x-test-role", "sale")
      .send({ itemName: "Bulb", roomTypeMatch: "*", sortOrder: "not-a-number" });

    expect(MockService.create).toHaveBeenCalledWith(
      expect.objectContaining({ sortOrder: undefined }),
    );
  });

  it("should pass undefined active when not a boolean", async () => {
    MockService.create.mockResolvedValue(itemRow as never);

    await request(app)
      .post("/default-handover-items")
      .set("x-test-role", "manager")
      .send({ itemName: "Bulb", roomTypeMatch: "*", active: "true" });

    expect(MockService.create).toHaveBeenCalledWith(
      expect.objectContaining({ active: undefined }),
    );
  });

  it("should return 400 on validation error from service", async () => {
    MockService.create.mockRejectedValue({ statusCode: 400, message: "itemName required" });

    const res = await request(app)
      .post("/default-handover-items")
      .set("x-test-role", "admin")
      .send({ itemName: "", roomTypeMatch: "*" });

    expect(res.status).toBe(400);
  });

  it("should use empty string for roomTypeMatch and itemName when absent from body", async () => {
    MockService.create.mockRejectedValue({ statusCode: 400, message: "required" });

    await request(app)
      .post("/default-handover-items")
      .set("x-test-role", "admin")
      .send({});

    expect(MockService.create).toHaveBeenCalledWith(
      expect.objectContaining({ roomTypeMatch: "", itemName: "" }),
    );
  });
});

describe("PATCH /default-handover-items/:id", () => {
  it("should return 403 for non-staff role", async () => {
    const res = await request(app)
      .patch("/default-handover-items/item-1")
      .set("x-test-role", "customer")
      .send({ itemName: "Updated" });

    expect(res.status).toBe(403);
    expect(MockService.update).not.toHaveBeenCalled();
  });

  it("should update item for staff role", async () => {
    MockService.update.mockResolvedValue({ ...itemRow, itemName: "Updated Bulb" } as never);

    const res = await request(app)
      .patch("/default-handover-items/item-1")
      .set("x-test-role", "admin")
      .send({ itemName: "Updated Bulb" });

    expect(res.status).toBe(200);
    expect(MockService.update).toHaveBeenCalledWith(
      "item-1",
      expect.objectContaining({ itemName: "Updated Bulb" }),
    );
  });

  it("should pass undefined for non-string fields", async () => {
    MockService.update.mockResolvedValue(itemRow as never);

    await request(app)
      .patch("/default-handover-items/item-1")
      .set("x-test-role", "admin")
      .send({ itemName: "New", roomTypeMatch: 123, sortOrder: "five", active: "yes" });

    expect(MockService.update).toHaveBeenCalledWith(
      "item-1",
      expect.objectContaining({
        itemName: "New",
        roomTypeMatch: undefined,
        sortOrder: undefined,
        active: undefined,
      }),
    );
  });

  it("should return 404 on not found error", async () => {
    MockService.update.mockRejectedValue({ statusCode: 404, message: "Not found" });

    const res = await request(app)
      .patch("/default-handover-items/missing")
      .set("x-test-role", "admin")
      .send({ itemName: "X" });

    expect(res.status).toBe(404);
  });

  it("should pass all valid-typed fields including roomTypeMatch, sortOrder, active", async () => {
    MockService.update.mockResolvedValue(itemRow as never);

    await request(app)
      .patch("/default-handover-items/item-1")
      .set("x-test-role", "admin")
      .send({ roomTypeMatch: "dorm", itemName: "Fan", defaultCondition: "Fair", sortOrder: 3, active: false });

    expect(MockService.update).toHaveBeenCalledWith(
      "item-1",
      expect.objectContaining({ roomTypeMatch: "dorm", sortOrder: 3, active: false }),
    );
  });

  it("should pass undefined itemName when not a string in update", async () => {
    MockService.update.mockResolvedValue(itemRow as never);

    await request(app)
      .patch("/default-handover-items/item-1")
      .set("x-test-role", "admin")
      .send({ roomTypeMatch: "dorm", itemName: 42 });

    expect(MockService.update).toHaveBeenCalledWith(
      "item-1",
      expect.objectContaining({ itemName: undefined }),
    );
  });
});

describe("DELETE /default-handover-items/:id", () => {
  it("should return 403 for non-staff role", async () => {
    const res = await request(app)
      .delete("/default-handover-items/item-1")
      .set("x-test-role", "customer");

    expect(res.status).toBe(403);
    expect(MockService.remove).not.toHaveBeenCalled();
  });

  it("should delete item for staff role", async () => {
    MockService.remove.mockResolvedValue(undefined);

    const res = await request(app)
      .delete("/default-handover-items/item-1")
      .set("x-test-role", "admin");

    expect(res.status).toBe(200);
    expect(MockService.remove).toHaveBeenCalledWith("item-1");
  });

  it("should return 404 when item not found", async () => {
    MockService.remove.mockRejectedValue({ statusCode: 404, message: "Not found" });

    const res = await request(app)
      .delete("/default-handover-items/missing")
      .set("x-test-role", "admin");

    expect(res.status).toBe(404);
  });
});
