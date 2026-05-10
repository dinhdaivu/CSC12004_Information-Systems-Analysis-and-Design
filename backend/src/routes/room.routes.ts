// room.routes.ts

import { Router } from "express";

import rateLimit from "express-rate-limit";

import { RoomController } from "@controllers/room.controller";

import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";

const router = Router();

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  standardHeaders: true,

  legacyHeaders: false,
});

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get("/", readLimiter, RoomController.getRooms);

router.get("/:id", readLimiter, RoomController.getRoomById);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/upload-image",

  writeLimiter,

  authMiddleware,

  roleMiddleware(["manager", "admin"]),

  RoomController.uploadRoomImage,
);

router.post(
  "/",

  writeLimiter,

  authMiddleware,

  roleMiddleware(["manager", "admin"]),

  RoomController.createRoom,
);

router.patch(
  "/:id",

  writeLimiter,

  authMiddleware,

  roleMiddleware(["manager", "admin"]),

  RoomController.updateRoom,
);

router.delete(
  "/:id",

  writeLimiter,

  authMiddleware,

  roleMiddleware(["admin"]),

  RoomController.deleteRoom,
);

export default router;
