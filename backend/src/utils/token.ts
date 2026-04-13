import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { AppRole } from '@models/user.model';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export interface AuthTokenPayload extends jwt.JwtPayload {
  id: string;
  email: string;
  role: AppRole;
}

export class TokenUtils {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET as string, {
      expiresIn: JWT_EXPIRE,
    } as jwt.SignOptions);
  }

  static verifyToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET as string) as AuthTokenPayload;
    } catch {
      throw new Error('Invalid token');
    }
  }

  static decodeToken(token: string): AuthTokenPayload | null {
    return jwt.decode(token) as AuthTokenPayload | null;
  }
}
