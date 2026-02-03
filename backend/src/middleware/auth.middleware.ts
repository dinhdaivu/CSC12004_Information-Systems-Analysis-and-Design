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
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    // Basic validation without using user input in security decisions
    if (authHeader === undefined || authHeader === null) {
      throw new UnauthorizedError('Missing authorization header');
    }

    if (typeof authHeader !== 'string') {
      throw new UnauthorizedError('Invalid authorization header type');
    }

    // Check for Bearer prefix format
    const BEARER_PREFIX = 'Bearer ';
    const prefixLength = BEARER_PREFIX.length;
    
    if (authHeader.length < prefixLength) {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    // Use fixed-length comparison to avoid user-controlled conditionals
    const prefix = authHeader.substring(0, prefixLength);
    if (prefix !== BEARER_PREFIX) {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    // Extract token - verifyToken will validate it cryptographically
    const token = authHeader.substring(prefixLength).trim();
    
    // Let TokenUtils.verifyToken handle all security validation
    // This method will throw if the token is invalid, malformed, or expired
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
