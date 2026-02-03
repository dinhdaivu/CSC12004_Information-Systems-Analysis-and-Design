import { Request, Response, NextFunction } from 'express';
import { TokenUtils } from '@utils/token';
import { UnauthorizedError, ForbiddenError } from '@utils/errors';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // Ensure authHeader is a string and properly formatted
    if (typeof authHeader !== 'string' || authHeader.length === 0) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const bearerPrefix = 'Bearer ';
    if (!authHeader.startsWith(bearerPrefix)) {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const token = authHeader.substring(bearerPrefix.length).trim();
    
    // Ensure token is not empty after extraction
    if (token.length === 0) {
      throw new UnauthorizedError('Missing authentication token');
    }

    const decoded = TokenUtils.verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Access denied'));
    }

    next();
  };
};
