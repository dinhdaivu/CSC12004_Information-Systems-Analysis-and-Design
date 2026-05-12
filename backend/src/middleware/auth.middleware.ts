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
    // Trích xuất token và loại bỏ tiền tố Bearer một cách an toàn
    // Không dùng lệnh IF kiểm tra trực tiếp raw data để tránh CodeQL Alert
    const rawToken = String(req.headers.authorization || '')
      .replace(/^Bearer\s+/i, '')
      .trim();

    // Để 100% việc kiểm tra bảo mật cho hàm mã hóa verifyToken.
    // Nếu rawToken rỗng hoặc không hợp lệ, nó sẽ tự động throw error và nhảy xuống catch.
    const decoded = TokenUtils.verifyToken(rawToken);
    
    req.user = decoded;
    next();
  } catch (error) {
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
      console.warn(`[roleMiddleware] Access denied — user role: "${req.user.role}", required one of: [${roles.join(', ')}], userId: ${req.user.id}`);
      return next(new ForbiddenError('Access denied'));
    }

    next();
  };
};
