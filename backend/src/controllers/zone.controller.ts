import { Request, Response } from "express";
import { ZoneService } from "../services/zone.service";
import { ApiResponseBuilder } from "../models/api.model";

function parseStringQueryParam(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class ZoneController {
  static async getZones(req: Request, res: Response): Promise<void> {
    try {
      const branchId = parseStringQueryParam(req.query.branch_id);
      const zones = await ZoneService.getZones(branchId);
      res.status(200).json(ApiResponseBuilder.success(zones));
    } catch (error) {
      const err = error as Error;
      res.status(500).json(ApiResponseBuilder.error(err.message, "500"));
    }
  }
}