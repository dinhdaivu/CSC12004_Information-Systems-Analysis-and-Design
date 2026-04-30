import request from "supertest";
import express from "express";
import bedRoutes from "@routes/bed.routes";
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
    const role = typeof roleHeader === "string" ? roleHeader : "manager";

    (
      req as express.Request & {
        user?: { id: string; email: string; role: string };
      }
    ).user = {
      id: "manager-1",
      email: "manager@example.com",
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
  app.use("/api/beds", bedRoutes);

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

describe("Bed Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/beds/insert", () => {
    it("should insert beds and return 201", async () => {
      const insertedBeds = [
        {
          id: "bed-1",
          room_id: "room-1",
          bed_number: "A1",
          price_per_month: 1500000,
          status: "available",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ];

      const select = jest.fn().mockResolvedValue({ data: insertedBeds, error: null });
      const insert = jest.fn().mockReturnValue({ select });
      mockedSupabase.from.mockReturnValue({ insert });

      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({
          room_id: "room-1",
          beds: [{ bed_number: "A1", price_per_month: 1500000 }],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inserted_count).toBe(1);
      expect(response.body.data.beds[0].bedNumber).toBe("A1");
      expect(response.body.data.beds[0].pricePerMonth).toBe(1500000);
    });

    it("should return 201 with single bed via bed_number shorthand", async () => {
      const insertedBeds = [
        {
          id: "bed-2",
          room_id: "room-1",
          bed_number: "B1",
          price_per_month: null,
          status: "available",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ];

      const select = jest.fn().mockResolvedValue({ data: insertedBeds, error: null });
      const insert = jest.fn().mockReturnValue({ select });
      mockedSupabase.from.mockReturnValue({ insert });

      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({ room_id: "room-1", bed_number: "B1" });

      expect(response.status).toBe(201);
      expect(response.body.data.beds[0].pricePerMonth).toBeNull();
    });

    it("should return 400 when room_id is missing", async () => {
      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({ beds: [{ bed_number: "A1" }] });

      expect(response.status).toBe(400);
    });

    it("should return 400 when beds array is empty", async () => {
      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({ room_id: "room-1", beds: [] });

      expect(response.status).toBe(400);
    });

    it("should return 400 when bed_number is missing", async () => {
      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({ room_id: "room-1", beds: [{ price_per_month: 500000 }] });

      expect(response.status).toBe(400);
    });

    it("should return 400 when price_per_month is negative", async () => {
      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({ room_id: "room-1", beds: [{ bed_number: "A1", price_per_month: -100 }] });

      expect(response.status).toBe(400);
    });

    it("should return 400 when price_per_month is not a number", async () => {
      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({ room_id: "room-1", beds: [{ bed_number: "A1", price_per_month: "abc" }] });

      expect(response.status).toBe(400);
    });

    it("should return 400 when bed item is not an object", async () => {
      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({ room_id: "room-1", beds: ["notanobject"] });

      expect(response.status).toBe(400);
    });

    it("should return 400 when status is invalid", async () => {
      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({ room_id: "room-1", beds: [{ bed_number: "A1", status: "invalid" }] });

      expect(response.status).toBe(400);
    });

    it("should return 400 when status is not a string", async () => {
      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({ room_id: "room-1", beds: [{ bed_number: "A1", status: 123 }] });

      expect(response.status).toBe(400);
    });

    it("should return 400 on supabase insert error", async () => {
      const select = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "insert failed" },
      });
      const insert = jest.fn().mockReturnValue({ select });
      mockedSupabase.from.mockReturnValue({ insert });

      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({ room_id: "room-1", beds: [{ bed_number: "A1" }] });

      expect(response.status).toBe(400);
    });

    it("should return 403 for non-manager/admin role", async () => {
      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .set("x-test-role", "customer")
        .send({ room_id: "room-1", beds: [{ bed_number: "A1" }] });

      expect(response.status).toBe(403);
    });

    it("should accept valid status values", async () => {
      const insertedBeds = [
        {
          id: "bed-3",
          room_id: "room-1",
          bed_number: "C1",
          price_per_month: null,
          status: "maintenance",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ];

      const select = jest.fn().mockResolvedValue({ data: insertedBeds, error: null });
      const insert = jest.fn().mockReturnValue({ select });
      mockedSupabase.from.mockReturnValue({ insert });

      const app = buildApp();
      const response = await request(app)
        .post("/api/beds/insert")
        .send({ room_id: "room-1", beds: [{ bed_number: "C1", status: "maintenance" }] });

      expect(response.status).toBe(201);
    });
  });

  describe("PATCH /api/beds/:id/status", () => {
    it("should update bed status and return 200", async () => {
      const updatedBed = {
        id: "bed-1",
        room_id: "room-1",
        bed_number: "A1",
        price_per_month: 1500000,
        status: "occupied",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-02T00:00:00.000Z",
      };

      const single = jest.fn().mockResolvedValue({ data: updatedBed, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app)
        .patch("/api/beds/bed-1/status")
        .send({ status: "occupied" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("occupied");
      expect(response.body.data.bedNumber).toBe("A1");
    });

    it("should return 400 when status is missing", async () => {
      const app = buildApp();
      const response = await request(app)
        .patch("/api/beds/bed-1/status")
        .send({});

      expect(response.status).toBe(400);
    });

    it("should return 400 when status is invalid", async () => {
      const app = buildApp();
      const response = await request(app)
        .patch("/api/beds/bed-1/status")
        .send({ status: "unknown" });

      expect(response.status).toBe(400);
    });

    it("should return 404 when bed not found (PGRST116)", async () => {
      const single = jest.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "no rows" },
      });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app)
        .patch("/api/beds/nonexistent/status")
        .send({ status: "available" });

      expect(response.status).toBe(404);
    });

    it("should return 400 on generic supabase error", async () => {
      const single = jest.fn().mockResolvedValue({
        data: null,
        error: { code: "OTHER", message: "some db error" },
      });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockedSupabase.from.mockReturnValue({ update });

      const app = buildApp();
      const response = await request(app)
        .patch("/api/beds/bed-1/status")
        .send({ status: "available" });

      expect(response.status).toBe(400);
    });

    it("should return 403 for non-manager/admin role", async () => {
      const app = buildApp();
      const response = await request(app)
        .patch("/api/beds/bed-1/status")
        .set("x-test-role", "sale")
        .send({ status: "available" });

      expect(response.status).toBe(403);
    });
  });
});
