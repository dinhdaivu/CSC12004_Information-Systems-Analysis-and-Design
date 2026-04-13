import { AuthController } from '@controllers/auth.controller';
import { AuthService } from '@services/auth.service';
import type { Request, Response, NextFunction } from 'express';

jest.mock('@services/auth.service', () => ({
  AuthService: {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
    resetPasswordWithCode: jest.fn(),
    getCurrentUser: jest.fn(),
    updateCurrentUser: jest.fn(),
  },
}));

describe('AuthController', () => {
  let req: Partial<Request> & { user?: { id: string } };
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 'user-1' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should delegate forgotPassword errors to next', async () => {
    const error = new Error('Forgot failed');
    (AuthService.forgotPassword as jest.Mock).mockRejectedValue(error);

    await AuthController.forgotPassword(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should delegate verifyEmail errors to next', async () => {
    const error = new Error('Verify failed');
    (AuthService.verifyEmail as jest.Mock).mockRejectedValue(error);

    await AuthController.verifyEmail(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should delegate resendVerification errors to next', async () => {
    const error = new Error('Resend failed');
    (AuthService.resendVerification as jest.Mock).mockRejectedValue(error);

    await AuthController.resendVerification(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should delegate resetPasswordWithCode errors to next', async () => {
    const error = new Error('Reset failed');
    (AuthService.resetPasswordWithCode as jest.Mock).mockRejectedValue(error);

    await AuthController.resetPasswordWithCode(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return logout success', async () => {
    await AuthController.logout(req as never, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('should delegate logout response errors to next', async () => {
    const error = new Error('Response write failed');
    (res.status as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await AuthController.logout(req as never, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should delegate me errors to next', async () => {
    const error = new Error('Load current user failed');
    (AuthService.getCurrentUser as jest.Mock).mockRejectedValue(error);

    await AuthController.me(req as never, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should delegate updateMe errors to next', async () => {
    const error = new Error('Update current user failed');
    (AuthService.updateCurrentUser as jest.Mock).mockRejectedValue(error);

    await AuthController.updateMe(req as never, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
