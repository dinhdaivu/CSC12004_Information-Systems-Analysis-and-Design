import { Router } from "express";
import { RoomController } from "@controllers/room.controller";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";

const router = Router();

router.get("/", RoomController.getRooms);
router.get("/:id", RoomController.getRoomById);

router.post(
  "/upload-image",
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
  RoomController.uploadRoomImage,
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
  RoomController.createRoom,
);
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
  RoomController.updateRoom,
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  RoomController.deleteRoom,
);

export default router;
