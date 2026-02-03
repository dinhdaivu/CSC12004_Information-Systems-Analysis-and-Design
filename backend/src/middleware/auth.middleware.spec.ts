import { Response, NextFunction } from 'express';
import { authMiddleware, roleMiddleware, AuthRequest } from '@middleware/auth.middleware';
import { TokenUtils } from '@utils/token';
import { UnauthorizedError, ForbiddenError } from '@utils/errors';

jest.mock('@utils/token');

describe('Auth Middleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('should authenticate with valid token', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: 'user' };
      const token = 'valid-token';

      req.headers = { authorization: `Bearer ${token}` };
      (TokenUtils.verifyToken as jest.Mock).mockReturnValue(mockUser);

      await authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user).toEqual(mockUser);
      expect(TokenUtils.verifyToken).toHaveBeenCalledWith(token);
      expect(next).toHaveBeenCalledWith();
    });

    it('should reject request with missing authorization header', async () => {
      req.headers = {};
      (TokenUtils.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authMiddleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(((next as jest.Mock).mock.calls[0][0] as UnauthorizedError).message).toBe(
        'Invalid or missing authentication token'
      );
    });

    it('should reject request with invalid authorization header format', async () => {
      req.headers = { authorization: 'InvalidFormat token' };
      (TokenUtils.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authMiddleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should reject request with invalid token', async () => {
      const token = 'invalid-token';
      req.headers = { authorization: `Bearer ${token}` };
      (TokenUtils.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authMiddleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(((next as jest.Mock).mock.calls[0][0] as UnauthorizedError).message).toBe(
        'Invalid or missing authentication token'
      );
    });

    it('should handle missing Bearer prefix', async () => {
      req.headers = { authorization: 'token-without-bearer' };
      (TokenUtils.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authMiddleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('roleMiddleware', () => {
    it('should allow user with required role', () => {
      const middleware = roleMiddleware(['admin', 'moderator']);
      req.user = { id: '1', email: 'test@example.com', role: 'admin' };

      middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should allow user with one of multiple required roles', () => {
      const middleware = roleMiddleware(['admin', 'moderator', 'user']);
      req.user = { id: '1', email: 'test@example.com', role: 'moderator' };

      middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should reject user without required role', () => {
      const middleware = roleMiddleware(['admin']);
      req.user = { id: '1', email: 'test@example.com', role: 'user' };

      middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(((next as jest.Mock).mock.calls[0][0] as ForbiddenError).message).toBe('Access denied');
    });

    it('should reject request without authentication', () => {
      const middleware = roleMiddleware(['admin']);
      req.user = undefined;

      middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(((next as jest.Mock).mock.calls[0][0] as UnauthorizedError).message).toBe(
        'Authentication required'
      );
    });

    it('should work with empty roles array', () => {
      const middleware = roleMiddleware([]);
      req.user = { id: '1', email: 'test@example.com', role: 'admin' };

      middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should handle multiple roles correctly', () => {
      const middleware = roleMiddleware(['admin', 'moderator', 'user', 'guest']);
      req.user = { id: '1', email: 'test@example.com', role: 'guest' };

      middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should verify exact role match', () => {
      const middleware = roleMiddleware(['admin']);
      req.user = { id: '1', email: 'test@example.com', role: 'administrator' };

      middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should be case-sensitive for roles', () => {
      const middleware = roleMiddleware(['Admin']);
      req.user = { id: '1', email: 'test@example.com', role: 'admin' };

      middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });
});
