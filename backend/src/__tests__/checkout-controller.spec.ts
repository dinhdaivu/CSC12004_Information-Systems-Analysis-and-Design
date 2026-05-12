import { CheckoutController } from '../controllers/checkout.controller';
import { CheckoutService } from '../services/checkout.service';
import { ValidationError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth.middleware';
import { Response, NextFunction } from 'express';

jest.mock('../services/checkout.service');

describe('CheckoutController', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { query: {}, params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('listCheckoutRequests', () => {
    it('should return list data successfully', async () => {
      req.query = { page: '1', limit: '10', status: 'requested', customerId: 'cus-1' };
      (CheckoutService.listCheckoutRequests as jest.Mock).mockResolvedValue('list-data');
      
      await CheckoutController.listCheckoutRequests(req as AuthRequest, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: 'list-data' }));
    });

    it('should throw ValidationError if limit exceeds 100', async () => {
      req.query = { limit: '150' };
      await CheckoutController.listCheckoutRequests(req as AuthRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should throw ValidationError if page is invalid', async () => {
      req.query = { page: '-5' };
      await CheckoutController.listCheckoutRequests(req as AuthRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('getCheckoutRequestById', () => {
    it('should return detail successfully', async () => {
      req.params = { id: 'chk-1' };
      (CheckoutService.getCheckoutRequestById as jest.Mock).mockResolvedValue('detail-data');
      
      await CheckoutController.getCheckoutRequestById(req as AuthRequest, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: 'detail-data' }));
    });

    it('should throw ValidationError if id is missing or empty', async () => {
      req.params = { id: '   ' };
      await CheckoutController.getCheckoutRequestById(req as AuthRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('createCheckoutRequest', () => {
    it('should create successfully', async () => {
      req.body = { contract_id: 'ctr-1', customer_id: 'cus-1', requested_checkout_date: '2026-06-01', reason: 'moving' };
      (CheckoutService.createCheckoutRequest as jest.Mock).mockResolvedValue('created-data');
      
      await CheckoutController.createCheckoutRequest(req as AuthRequest, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: 'created-data' }));
    });

    it('should throw ValidationError if required fields are missing', async () => {
      req.body = { contract_id: 'ctr-1' }; // missing others
      await CheckoutController.createCheckoutRequest(req as AuthRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('confirmCheckoutRequest & cancelCheckoutRequest', () => {
    it('should confirm checkout request', async () => {
      req.params = { id: 'chk-1' };
      (CheckoutService.confirmCheckoutRequest as jest.Mock).mockResolvedValue('confirmed-data');
      
      await CheckoutController.confirmCheckoutRequest(req as AuthRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should cancel checkout request', async () => {
      req.params = { id: 'chk-1' };
      (CheckoutService.cancelCheckoutRequest as jest.Mock).mockResolvedValue('cancelled-data');
      
      await CheckoutController.cancelCheckoutRequest(req as AuthRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Settlement Endpoints', () => {
    it('should get settlement successfully', async () => {
      req.params = { id: 'chk-1' };
      (CheckoutService.getSettlementByCheckoutId as jest.Mock).mockResolvedValue('settlement-data');
      
      await CheckoutController.getSettlement(req as AuthRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should create settlement successfully', async () => {
      req.params = { id: 'chk-1' };
      req.body = { deduction: 100, payment_method: 'cash', notes: 'test' };
      (CheckoutService.createSettlement as jest.Mock).mockResolvedValue('created-settlement');
      
      await CheckoutController.createSettlement(req as AuthRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should throw ValidationError on create if deduction is negative', async () => {
      req.params = { id: 'chk-1' };
      req.body = { deduction: -100 };
      await CheckoutController.createSettlement(req as AuthRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should update settlement successfully', async () => {
      req.params = { settlementId: 'set-1' };
      req.body = { deduction: 200 };
      (CheckoutService.updateSettlementDeduction as jest.Mock).mockResolvedValue('updated-settlement');
      
      await CheckoutController.updateSettlementDeduction(req as AuthRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw ValidationError on update if deduction is invalid', async () => {
      req.params = { settlementId: 'set-1' };
      req.body = { deduction: 'abc' };
      await CheckoutController.updateSettlementDeduction(req as AuthRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should confirm settlement successfully', async () => {
      req.params = { settlementId: 'set-1' };
      (CheckoutService.confirmSettlement as jest.Mock).mockResolvedValue('confirmed');
      
      await CheckoutController.confirmSettlement(req as AuthRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should complete settlement successfully', async () => {
      req.params = { settlementId: 'set-1' };
      req.body = { payment_method: 'transfer' };
      (CheckoutService.completeSettlement as jest.Mock).mockResolvedValue('completed');
      
      await CheckoutController.completeSettlement(req as AuthRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw ValidationError if payment method is invalid for complete settlement', async () => {
      req.params = { settlementId: 'set-1' };
      req.body = { payment_method: 'crypto' };
      await CheckoutController.completeSettlement(req as AuthRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('completeCheckout', () => {
    it('should complete checkout successfully', async () => {
      req.params = { id: 'chk-1' };
      (CheckoutService.completeCheckout as jest.Mock).mockResolvedValue('completed');
      
      await CheckoutController.completeCheckout(req as AuthRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});