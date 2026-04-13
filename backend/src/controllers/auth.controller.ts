import { Request, Response, NextFunction } from 'express';
import { ApiResponseBuilder } from '@models/api.model';
import { AuthService } from '@services/auth.service';
import type { AuthRequest } from '@middleware/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(ApiResponseBuilder.success(result, 'Registration successful'));
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await AuthService.login(req.body);
      res.status(200).json(ApiResponseBuilder.success(session, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.forgotPassword(req.body);
      res.status(200).json(ApiResponseBuilder.success(null, 'Password reset email requested'));
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await AuthService.verifyEmail(req.body);
      res.status(200).json(ApiResponseBuilder.success(session, 'Email verified successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.resendVerification(req.body);
      res.status(200).json(ApiResponseBuilder.success(null, 'Verification code resent'));
    } catch (error) {
      next(error);
    }
  }

  static async resetPasswordWithCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.resetPasswordWithCode(req.body);
      res.status(200).json(ApiResponseBuilder.success(null, 'Password updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(ApiResponseBuilder.success(null, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser(req.user!.id);
      res.status(200).json(ApiResponseBuilder.success(user));
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.updateCurrentUser(req.user!.id, req.body);
      res.status(200).json(ApiResponseBuilder.success(user, 'Profile updated'));
    } catch (error) {
      next(error);
    }
  }
}
