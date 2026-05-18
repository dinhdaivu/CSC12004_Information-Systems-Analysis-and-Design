import type { Response, NextFunction } from 'express';
import { ApiResponseBuilder } from '@models/api.model';
import type { AuthRequest } from '@middleware/auth.middleware';
import { DefaultHandoverItemService } from '@services/default-handover-item.service';

export class DefaultHandoverItemController {
  static async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const data = await DefaultHandoverItemService.list(activeOnly);
      res.json(ApiResponseBuilder.success(data));
    } catch (e) { next(e); }
  }

  /** Resolve the default item set for a specific room type. */
  static async resolve(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const roomType = typeof req.query.roomType === 'string' ? req.query.roomType : undefined;
      const data = await DefaultHandoverItemService.resolveForRoomType(roomType);
      res.json(ApiResponseBuilder.success(data));
    } catch (e) { next(e); }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as Record<string, unknown>;
      const data = await DefaultHandoverItemService.create({
        roomTypeMatch: String(body.roomTypeMatch ?? ''),
        itemName: String(body.itemName ?? ''),
        defaultCondition: typeof body.defaultCondition === 'string' ? body.defaultCondition : undefined,
        sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
        active: typeof body.active === 'boolean' ? body.active : undefined,
      });
      res.status(201).json(ApiResponseBuilder.success(data, 'Default item created'));
    } catch (e) { next(e); }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as Record<string, unknown>;
      const data = await DefaultHandoverItemService.update(String(req.params.id), {
        roomTypeMatch: typeof body.roomTypeMatch === 'string' ? body.roomTypeMatch : undefined,
        itemName: typeof body.itemName === 'string' ? body.itemName : undefined,
        defaultCondition: typeof body.defaultCondition === 'string' ? body.defaultCondition : undefined,
        sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
        active: typeof body.active === 'boolean' ? body.active : undefined,
      });
      res.json(ApiResponseBuilder.success(data, 'Default item updated'));
    } catch (e) { next(e); }
  }

  static async remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await DefaultHandoverItemService.remove(String(req.params.id));
      res.json(ApiResponseBuilder.success({ id: req.params.id }, 'Default item deleted'));
    } catch (e) { next(e); }
  }
}
