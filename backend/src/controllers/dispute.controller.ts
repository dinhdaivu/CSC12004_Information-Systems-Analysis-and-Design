import type { Response, NextFunction } from 'express';
import { ApiResponseBuilder } from '@models/api.model';
import type { AuthRequest } from '@middleware/auth.middleware';
import { DisputeService } from '@services/dispute.service';
import type { DisputeStatus } from '@models/dispute.model';
import { ValidationError } from '@utils/errors';

const RESOLVABLE: DisputeStatus[] = ['reviewing', 'resolved', 'rejected'];

export class DisputeController {
  static async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isStaff = ['sale', 'accountant', 'manager', 'admin'].includes(req.user?.role ?? '');
      // Customers can only see their own disputes; staff can filter freely.
      const customerId = isStaff
        ? (typeof req.query.customerId === 'string' ? req.query.customerId : undefined)
        : req.user?.id;
      const status = typeof req.query.status === 'string' ? (req.query.status as DisputeStatus) : undefined;
      const data = await DisputeService.list({ customerId, status });
      res.json(ApiResponseBuilder.success(data));
    } catch (e) { next(e); }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await DisputeService.getById(String(req.params.id));
      res.json(ApiResponseBuilder.success(data));
    } catch (e) { next(e); }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.user?.id;
      if (!customerId) throw new ValidationError('Authenticated user required');
      const body = req.body as Record<string, unknown>;
      const data = await DisputeService.create({
        customerId,
        settlementId: typeof body.settlementId === 'string' ? body.settlementId : undefined,
        checkoutRequestId: typeof body.checkoutRequestId === 'string' ? body.checkoutRequestId : undefined,
        name: typeof body.name === 'string' ? body.name : '',
        branch: typeof body.branch === 'string' ? body.branch : undefined,
        reason: typeof body.reason === 'string' ? body.reason : '',
        evidenceUrl: typeof body.evidenceUrl === 'string' ? body.evidenceUrl : undefined,
        evidenceBase64: typeof body.evidenceBase64 === 'string' ? body.evidenceBase64 : undefined,
      });
      res.status(201).json(ApiResponseBuilder.success(data, 'Dispute submitted'));
    } catch (e) { next(e); }
  }

  static async resolve(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const resolvedBy = req.user?.id;
      if (!resolvedBy) throw new ValidationError('Authenticated staff required');
      const { status, resolutionNote } = req.body as { status?: string; resolutionNote?: string };
      if (!status || !RESOLVABLE.includes(status as DisputeStatus)) {
        throw new ValidationError('status must be one of: reviewing, resolved, rejected');
      }
      const data = await DisputeService.resolve(String(req.params.id), {
        status: status as Exclude<DisputeStatus, 'pending'>,
        resolutionNote,
        resolvedBy,
      });
      res.json(ApiResponseBuilder.success(data, 'Dispute updated'));
    } catch (e) { next(e); }
  }
}
