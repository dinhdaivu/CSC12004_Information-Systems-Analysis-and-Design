import { Router } from "express";
import rateLimit from "express-rate-limit";
import { RoomController } from "@controllers/room.controller";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";

const router = Router();

const roomWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/", RoomController.getRooms);
router.get("/:id", RoomController.getRoomById);

router.post(
  "/upload-image",
  roomWriteLimiter,
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
  RoomController.uploadRoomImage,
);

router.post(
  "/",
  roomWriteLimiter,
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
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
