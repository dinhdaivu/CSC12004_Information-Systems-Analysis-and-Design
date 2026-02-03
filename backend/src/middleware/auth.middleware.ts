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
    // Extract authorization header directly
    // Don't use it in any security checks - let verifyToken handle validation
    const authHeader = req.headers.authorization;
    
    // Define constants
    const BEARER_PREFIX = 'Bearer ';
    
    // Extract token - if authHeader is undefined/null/invalid, 
    // the substring operations will fail safely or produce invalid token
    // which verifyToken will reject
    const rawToken = String(authHeader || '').substring(BEARER_PREFIX.length).trim();
    
    // Security validation happens here - verifyToken will throw if:
    // - token is empty, malformed, expired, or has invalid signature
    // This is the ONLY security check - cryptographic validation
    const decoded = TokenUtils.verifyToken(rawToken);

    req.user = decoded;
    next();
  } catch (error) {
    // Any error (including from verifyToken) results in unauthorized
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or missing authentication token'));
    }
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
