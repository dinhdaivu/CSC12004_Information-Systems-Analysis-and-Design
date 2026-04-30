import request from "supertest";
import express from "express";
import roomRoutes from "@routes/room.routes";
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
    const role = typeof roleHeader === "string" ? roleHeader : "admin";

    (
      req as express.Request & {
        user?: { id: string; email: string; role: string };
      }
    ).user = {
      id: "admin-1",
      email: "admin@example.com",
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
        const user = (req as express.Request & { user?: { role: string } }).user;
        if (!user || !roles.includes(user.role)) {
          res.status(403).json({ message: "Forbidden" });
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

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/rooms", roomRoutes);

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
          error: { code: err.code, message: err.message },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" },
      });
    },
  );

  return app;
};

const makeRoomRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: "room-1",
  branch_id: "branch-1",
  room_number: "101",
  room_type: "dorm",
  max_capacity: 4,
  price_per_month: 1500000,
  amenities: ["wifi", "ac"],
  images_url: ["https://example.com/img.jpg"],
  status: "available",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  zones: { branches: { id: "branch-1", name: "Branch A", address: "123 Main St" } },
  beds: [
    {
      id: "bed-1",
      room_id: "room-1",
      bed_number: "A1",
      price_per_month: 500000,
      status: "available",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  ...overrides,
});

describe("Room Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/rooms", () => {
    it("should return list of rooms", async () => {
      const rows = [makeRoomRow()];
      const order = jest.fn().mockResolvedValue({ data: rows, error: null });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].roomNumber).toBe("101");
      expect(response.body.data[0].branch.name).toBe("Branch A");
      expect(response.body.data[0].beds[0].bedNumber).toBe("A1");
    });

    it("should filter by branch_id", async () => {
      const rows = [makeRoomRow()];
      const order = jest.fn().mockResolvedValue({ data: rows, error: null });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ order: jest.fn().mockReturnValue({ eq }) });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms?branch_id=branch-1");

      expect(response.status).toBe(200);
    });

    it("should filter by room_status", async () => {
      const rows = [makeRoomRow()];
      const order = jest.fn().mockResolvedValue({ data: rows, error: null });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ order: jest.fn().mockReturnValue({ eq }) });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms?room_status=available");

      expect(response.status).toBe(200);
    });

    it("should apply search filter on room number", async () => {
      const rows = [makeRoomRow({ room_number: "101" })];
      const order = jest.fn().mockResolvedValue({ data: rows, error: null });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms?search=101");

      expect(response.status).toBe(200);
      expect(response.body.data[0].roomNumber).toBe("101");
    });

    it("should apply search filter on branch name", async () => {
      const rows = [makeRoomRow({ zones: { branches: { id: "b1", name: "Branch Alpha", address: "addr" } } })];
      const order = jest.fn().mockResolvedValue({ data: rows, error: null });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms?search=alpha");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it("should apply search filter on bed number", async () => {
      const rows = [makeRoomRow({
        room_number: "200",
        beds: [{ id: "b1", room_id: "r1", bed_number: "SPECIAL", price_per_month: null, status: "available", created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z" }],
      })];
      const order = jest.fn().mockResolvedValue({ data: rows, error: null });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms?search=special");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it("should exclude rooms that don't match search", async () => {
      const rows = [makeRoomRow({ room_number: "999" })];
      const order = jest.fn().mockResolvedValue({ data: rows, error: null });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms?search=zzznomatch");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it("should handle room with array branches", async () => {
      const rows = [makeRoomRow({ zones: [{ branches: [{ id: "b1", name: "Arr Branch", address: "addr" }] }] })];
      const order = jest.fn().mockResolvedValue({ data: rows, error: null });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms");

      expect(response.status).toBe(200);
      expect(response.body.data[0].branch.name).toBe("Arr Branch");
    });

    it("should handle room with null beds and branches", async () => {
      const rows = [makeRoomRow({ zones: { branches: null }, beds: null, amenities: null, images_url: null })];
      const order = jest.fn().mockResolvedValue({ data: rows, error: null });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms");

      expect(response.status).toBe(200);
      expect(response.body.data[0].branch).toBeNull();
      expect(response.body.data[0].beds).toHaveLength(0);
      expect(response.body.data[0].amenities).toHaveLength(0);
    });

    it("should handle string price_per_month in toNumber", async () => {
      const rows = [makeRoomRow({ price_per_month: "2000000" })];
      const order = jest.fn().mockResolvedValue({ data: rows, error: null });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms");

      expect(response.status).toBe(200);
      expect(response.body.data[0].pricePerMonth).toBe(2000000);
    });

    it("should return 500 on supabase error", async () => {
      const order = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms");

      expect(response.status).toBe(500);
    });

    it("should retry on fetch failed error", async () => {
      const rows = [makeRoomRow()];
      let callCount = 0;
      const order = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error("fetch failed");
        }
        return Promise.resolve({ data: rows, error: null });
      });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms");

      expect(response.status).toBe(200);
      expect(callCount).toBe(2);
    });

    it("should return 500 if retry also fails on fetch failed", async () => {
      const order = jest.fn().mockImplementation(() => {
        throw new Error("fetch failed again");
      });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms");

      expect(response.status).toBe(500);
    });

    it("should return 500 on non-fetch error without retry", async () => {
      const order = jest.fn().mockImplementation(() => {
        throw new Error("some other error");
      });
      const select = jest.fn().mockReturnValue({ order });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms");

      expect(response.status).toBe(500);
    });
  });

  describe("GET /api/rooms/:id", () => {
    it("should return room detail", async () => {
      const row = makeRoomRow();

      const single = jest.fn().mockResolvedValue({ data: row, error: null });
      const eq = jest.fn().mockReturnValue({ single });
      const select = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms/room-1");

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe("room-1");
    });

    it("should return 404 when room not found (PGRST116)", async () => {
      const single = jest.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "not found" },
      });
      const eq = jest.fn().mockReturnValue({ single });
      const select = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms/nonexistent");

      expect(response.status).toBe(404);
    });

    it("should return 500 on generic supabase error", async () => {
      const single = jest.fn().mockResolvedValue({
        data: null,
        error: { code: "OTHER", message: "DB error" },
      });
      const eq = jest.fn().mockReturnValue({ single });
      const select = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ select });

      const app = buildApp();
      const response = await request(app).get("/api/rooms/room-1");

      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/rooms", () => {
    it("should create a room and return 201", async () => {
      const newRoom = makeRoomRow({ id: "room-new" });

      const single = jest.fn().mockResolvedValue({ data: newRoom, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockedSupabase.from.mockReturnValue({ insert });

      const app = buildApp();
      const response = await request(app)
        .post("/api/rooms")
        .set("Authorization", "Bearer fake")
        .send({
          zone_id: "zone-1",
          room_number: "101",
          max_capacity: 2,
          price_per_month: 2000000
        });

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBe("room-new");
    });

    it("should return 400 on supabase insert error", async () => {
      const single = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "insert failed" },
      });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockedSupabase.from.mockReturnValue({ insert });

      const app = buildApp();
      const response = await request(app)
        .post("/api/rooms")
        .send({
          branch_id: "branch-1",
          room_number: "102",
          max_capacity: 4,
          price_per_month: 1500000,
        });

      expect(response.status).toBe(400);
    });

    it("should return 403 for non-manager/admin role", async () => {
      const app = buildApp();
      const response = await request(app)
        .post("/api/rooms")
        .set("x-test-role", "customer")
        .send({ branch_id: "b1", room_number: "101", max_capacity: 4, price_per_month: 1000000 });

      expect(response.status).toBe(403);
    });
  });

  describe("PATCH /api/rooms/:id", () => {
    it("should update a room", async () => {
      const updatedRoom = makeRoomRow({ room_number: "102" });

      const single = jest.fn().mockResolvedValue({ data: updatedRoom, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app)
        .patch("/api/rooms/room-1")
        .send({ room_number: "102" });

      expect(response.status).toBe(200);
      expect(response.body.data.roomNumber).toBe("102");
    });

    it("should return 400 for empty payload", async () => {
      const app = buildApp();
      const response = await request(app)
        .patch("/api/rooms/room-1")
        .send({});

      expect(response.status).toBe(400);
    });

    it("should return 404 when room not found on update (PGRST116)", async () => {
      const single = jest.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "not found" },
      });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app)
        .patch("/api/rooms/nonexistent")
        .send({ room_number: "999" });

      expect(response.status).toBe(404);
    });

    it("should return 400 on generic supabase error on update", async () => {
      const single = jest.fn().mockResolvedValue({
        data: null,
        error: { code: "OTHER", message: "DB error" },
      });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app)
        .patch("/api/rooms/room-1")
        .send({ room_number: "999" });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/rooms/:id", () => {
    it("should delete a room and return 200", async () => {
      const select = jest.fn().mockResolvedValue({ data: [{ id: "room-1" }], error: null });
      const eq = jest.fn().mockReturnValue({ select });
      const del = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ delete: del });

      const app = buildApp();
      const response = await request(app).delete("/api/rooms/room-1");

      expect(response.status).toBe(200);
    });

    it("should return 404 when room not found on delete", async () => {
      const select = jest.fn().mockResolvedValue({ data: [], error: null });
      const eq = jest.fn().mockReturnValue({ select });
      const del = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ delete: del });

      const app = buildApp();
      const response = await request(app).delete("/api/rooms/nonexistent");

      expect(response.status).toBe(404);
    });

    it("should return 400 on supabase error on delete", async () => {
      const select = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });
      const eq = jest.fn().mockReturnValue({ select });
      const del = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ delete: del });

      const app = buildApp();
      const response = await request(app).delete("/api/rooms/room-1");

      expect(response.status).toBe(400);
    });

    it("should return 403 for non-admin role on delete", async () => {
      const app = buildApp();
      const response = await request(app)
        .delete("/api/rooms/room-1")
        .set("x-test-role", "manager");

      expect(response.status).toBe(403);
    });
  });
});
