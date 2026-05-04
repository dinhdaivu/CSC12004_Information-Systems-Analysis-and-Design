import type { Response } from "express";
import { ApiResponseBuilder } from "@models/api.model";
import type { AuthRequest } from "@middleware/auth.middleware";
import { LodgingEligibilityService } from "@services/lodging-eligibility.service";
import { ValidationError } from "@utils/errors";

function parseCustomerId(req: AuthRequest): string {
  const customerId = req.params.customerId;

  if (!customerId || typeof customerId !== "string" || !customerId.trim()) {
    throw new ValidationError("customerId is required");
  }

  return customerId;
}

function parseBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new ValidationError(`${fieldName} must be a boolean`);
  }

  return value;
}

export class LodgingEligibilityController {
  static async getInputData(req: AuthRequest, res: Response): Promise<void> {
    const customerId = parseCustomerId(req);
    const result =
      await LodgingEligibilityService.getEligibilityInputData(customerId);
    res.status(200).json(ApiResponseBuilder.success(result));
  }

  static async checkEligibility(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    const actorId = req.user?.id;

    if (!actorId) {
      throw new ValidationError("Authenticated user is required");
    }

    const customerId = req.body.customerId;
    if (typeof customerId !== "string" || !customerId.trim()) {
      throw new ValidationError("customerId is required");
    }

    const result = await LodgingEligibilityService.checkAndSaveEligibility({
      customerId,
      checkedBy: actorId,
      identityVerified: parseBoolean(
        req.body.identityVerified,
        "identityVerified",
      ),
      documentsComplete: parseBoolean(
        req.body.documentsComplete,
        "documentsComplete",
      ),
      backgroundCheckPassed: parseBoolean(
        req.body.backgroundCheckPassed,
        "backgroundCheckPassed",
      ),
      healthRequirementsMet:
        typeof req.body.healthRequirementsMet === "boolean"
          ? req.body.healthRequirementsMet
          : undefined,
      notes: typeof req.body.notes === "string" ? req.body.notes : undefined,
    });

    res
      .status(200)
      .json(ApiResponseBuilder.success(result, "Lodging eligibility saved"));
  }
}
