import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { MyBookingService, MyBookingFilters } from '../services/my-booking.service';
import { UnauthorizedError } from '../utils/errors';

export class MyBookingController {
  static async getList(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.user?.id;
      if (!customerId) throw new UnauthorizedError();

      const filters: MyBookingFilters = {
        status: req.query.status as string,
        type: req.query.type as string,
      };

      const data = await MyBookingService.getMyBookings(customerId, filters);

      res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  static async getDetail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.user?.id;
      if (!customerId) throw new UnauthorizedError();

      // Fix: Ép kiểu tường minh params.id về string
      const bookingId = req.params.id as string; 
      
      const data = await MyBookingService.getBookingById(customerId, bookingId);

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async performAction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.user?.id;
      if (!customerId) throw new UnauthorizedError();

      // Fix: Ép kiểu tường minh params.id về string
      const bookingId = req.params.id as string; 
      const action = req.body.action;

      const updatedData = await MyBookingService.handleAction(customerId, bookingId, action);

      res.status(200).json({ 
        success: true, 
        message: `Đã thực hiện hành động '${action}' thành công.`,
        data: updatedData 
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.user?.id;
      if (!customerId) throw new UnauthorizedError();

      const bookingId = req.params.id as string;
      const isAvailable = await MyBookingService.checkAvailability(customerId, bookingId);

      res.status(200).json({ success: true, isAvailable });
    } catch (error) {
      next(error);
    }
  }

  static async submitProof(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.user?.id;
      if (!customerId) throw new UnauthorizedError();

      const bookingId = req.params.id as string;
      const { proofImage } = req.body;

      if (!proofImage) {
        res.status(400).json({ success: false, message: 'proofImage base64 string is required' });
        return;
      }

      const updatedData = await MyBookingService.submitDepositProof(customerId, bookingId, proofImage);

      res.status(200).json({
        success: true,
        message: 'Nộp minh chứng thanh toán thành công.',
        data: updatedData
      });
    } catch (error) {
      next(error);
    }
  }
}