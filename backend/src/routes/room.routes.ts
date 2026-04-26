import { Router } from "express";
import rateLimit from "express-rate-limit";
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
  windowMs: 15 * 60 * 1000,
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/", readLimiter, RoomController.getRooms);
router.get("/:id", readLimiter, RoomController.getRoomById);

  max: 100,
  standardHeaders: true,
  writeLimiter,
  legacyHeaders: false,
});

router.get("/", RoomController.getRooms);
router.get("/:id", RoomController.getRoomById);

router.post(
  writeLimiter,
  "/upload-image",
  roomWriteLimiter,
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
  RoomController.uploadRoomImage,
);
  writeLimiter,

router.post(
  "/",
  roomWriteLimiter,
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
  writeLimiter,
  RoomController.createRoom,
);
router.patch(
  "/:id",
  roomWriteLimiter,
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
  RoomController.updateRoom,
);
router.delete(
  "/:id",
  roomWriteLimiter,
  authMiddleware,
  roleMiddleware(["admin"]),
  RoomController.deleteRoom,
);

export default router;
