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
    // Get authorization header - safely handle undefined/null
    const authHeader = req.headers.authorization;
    const BEARER_PREFIX = 'Bearer ';
    
    // Validate header exists and is a string
    const isValidHeader = 
      authHeader !== undefined && 
      authHeader !== null && 
      typeof authHeader === 'string';
    
    if (!isValidHeader) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    // Extract token using safe string operations
    const headerValue = String(authHeader); // Ensure string type
    const hasValidPrefix = headerValue.indexOf(BEARER_PREFIX) === 0;
    
    if (!hasValidPrefix) {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    // Extract token after prefix
    const token = headerValue.slice(BEARER_PREFIX.length).trim();
    
    // Validate token is not empty
    if (token.length === 0) {
      throw new UnauthorizedError('Missing authentication token');
    }

    // Verify token (this is where the actual security validation happens)
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
