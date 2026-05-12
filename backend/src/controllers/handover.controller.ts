import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '@middleware/auth.middleware';
import { HandoverService } from '@services/handover.service';
import type { HandoverStatus } from '@models/handover.model';

export class HandoverController {
  static async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        contractId: req.query.contractId as string | undefined,
        customerId: req.query.customerId as string | undefined,
        status: req.query.status as HandoverStatus | undefined,
      };
      const data = await HandoverService.list(filters);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await HandoverService.getById(String(req.params.id));
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await HandoverService.create({
        contractId: req.body.contractId as string,
        managerId: (req.body.managerId as string | undefined) ?? req.user?.id,
        customerId: req.body.customerId as string,
        handoverAt: req.body.handoverAt,
        notes: req.body.notes,
        items: req.body.items,
      });
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async complete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const managerId = req.user?.id ?? '';
      const data = await HandoverService.complete(String(req.params.id), managerId);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async cancel(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await HandoverService.cancel(String(req.params.id));
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async addItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await HandoverService.addItem(String(req.params.id), {
        itemName: req.body.itemName,
        itemCondition: req.body.itemCondition,
        notes: req.body.notes,
      });
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  }
}
