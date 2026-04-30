import { Router } from "express";
import { ZoneController } from "../controllers/zone.controller";
import rateLimit from "express-rate-limit";

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.get("/", readLimiter, ZoneController.getZones);

export default router;