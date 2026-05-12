import type { Response, NextFunction } from 'express';
import { ApiResponseBuilder } from '@models/api.model';
import type { AuthRequest } from '@middleware/auth.middleware';
import { CheckoutService } from '@services/checkout.service';
import { ValidationError } from '@utils/errors';

function parseId(req: AuthRequest, param = 'id'): string {
  const id = req.params[param];
  if (!id || typeof id !== 'string' || !id.trim()) throw new ValidationError(`${param} is required`);
  return id;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new ValidationError('Pagination parameters must be positive integers');
  return n;
}

export class CheckoutController {
  static async listCheckoutRequests(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parsePositiveInt(typeof req.query.page === 'string' ? req.query.page : undefined, 1);
      const limit = parsePositiveInt(typeof req.query.limit === 'string' ? req.query.limit : undefined, 20);
      if (limit > 100) throw new ValidationError('limit cannot exceed 100');

      const result = await CheckoutService.listCheckoutRequests({
        page,
        limit,
        status: typeof req.query.status === 'string' ? req.query.status : undefined,
        customerId: typeof req.query.customerId === 'string' ? req.query.customerId : undefined,
      });

      res.status(200).json(ApiResponseBuilder.success(result));
    } catch (err) {
      next(err);
    }
  }

  static async getCheckoutRequestById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await CheckoutService.getCheckoutRequestById(parseId(req));
      res.status(200).json(ApiResponseBuilder.success(data));
    } catch (err) {
      next(err);
    }
  }

  static async createCheckoutRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contract_id, customer_id, requested_checkout_date, reason } = req.body;

      if (typeof contract_id !== 'string' || !contract_id.trim()) throw new ValidationError('contract_id is required');
      if (typeof customer_id !== 'string' || !customer_id.trim()) throw new ValidationError('customer_id is required');
      if (typeof requested_checkout_date !== 'string' || !requested_checkout_date.trim()) {
        throw new ValidationError('requested_checkout_date is required');
      }

      const data = await CheckoutService.createCheckoutRequest({
        contract_id,
        customer_id,
        requested_checkout_date,
        reason: typeof reason === 'string' ? reason : undefined,
      });

      res.status(201).json(ApiResponseBuilder.success(data, 'Checkout request created'));
    } catch (err) {
      next(err);
    }
  }

  static async confirmCheckoutRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await CheckoutService.confirmCheckoutRequest(parseId(req));
      res.status(200).json(ApiResponseBuilder.success(data, 'Checkout request confirmed'));
    } catch (err) {
      next(err);
    }
  }

  static async cancelCheckoutRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await CheckoutService.cancelCheckoutRequest(parseId(req));
      res.status(200).json(ApiResponseBuilder.success(data, 'Checkout request cancelled'));
    } catch (err) {
      next(err);
    }
  }

  static async getSettlement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const settlement = await CheckoutService.getSettlementByCheckoutId(parseId(req));
      res.status(200).json(ApiResponseBuilder.success(settlement));
    } catch (err) {
      next(err);
    }
  }

  static async createSettlement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const checkoutId = parseId(req);
      const { deduction, payment_method, notes } = req.body;

      const deductionNum = Number(deduction);
      if (!Number.isFinite(deductionNum) || deductionNum < 0) {
        throw new ValidationError('deduction must be a non-negative number');
      }

      const data = await CheckoutService.createSettlement(checkoutId, {
        deduction: deductionNum,
        payment_method: typeof payment_method === 'string' ? payment_method as 'cash' | 'transfer' | 'vietqr' : undefined,
        notes: typeof notes === 'string' ? notes : undefined,
      });

      res.status(201).json(ApiResponseBuilder.success(data, 'Settlement created'));
    } catch (err) {
      next(err);
    }
  }

  static async updateSettlementDeduction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const settlementId = parseId(req, 'settlementId');
      const { deduction, notes } = req.body;

      const deductionNum = Number(deduction);
      if (!Number.isFinite(deductionNum) || deductionNum < 0) {
        throw new ValidationError('deduction must be a non-negative number');
      }

      const data = await CheckoutService.updateSettlementDeduction(settlementId, {
        deduction: deductionNum,
        notes: typeof notes === 'string' ? notes : undefined,
      });

      res.status(200).json(ApiResponseBuilder.success(data, 'Settlement updated'));
    } catch (err) {
      next(err);
    }
  }

  static async confirmSettlement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const settlementId = parseId(req, 'settlementId');
      const data = await CheckoutService.confirmSettlement(settlementId);
      res.status(200).json(ApiResponseBuilder.success(data, 'Settlement confirmed'));
    } catch (err) {
      next(err);
    }
  }

  static async completeSettlement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const settlementId = parseId(req, 'settlementId');
      const { payment_method, notes } = req.body;

      if (typeof payment_method !== 'string' || !['cash', 'transfer', 'vietqr'].includes(payment_method)) {
        throw new ValidationError('payment_method must be one of: cash, transfer, vietqr');
      }

      const data = await CheckoutService.completeSettlement(settlementId, {
        payment_method: payment_method as 'cash' | 'transfer' | 'vietqr',
        notes: typeof notes === 'string' ? notes : undefined,
      });

      res.status(200).json(ApiResponseBuilder.success(data, 'Settlement completed'));
    } catch (err) {
      next(err);
    }
  }

  static async completeCheckout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await CheckoutService.completeCheckout(parseId(req));
      res.status(200).json(ApiResponseBuilder.success(data, 'Checkout completed'));
    } catch (err) {
      next(err);
    }
  }
}
