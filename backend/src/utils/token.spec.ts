import { TokenUtils } from '@utils/token';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('TokenUtils', () => {
  const mockPassword = 'password123';
  const mockHash = '$2b$10$hashedpassword';
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  const mockPayload = { id: '1', email: 'test@example.com', role: 'user' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await TokenUtils.hashPassword(mockPassword);

      expect(result).toBe(mockHash);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
    });

    it('should handle hash errors', async () => {
      const error = new Error('Hash failed');
      (bcrypt.hash as jest.Mock).mockRejectedValue(error);

      await expect(TokenUtils.hashPassword(mockPassword)).rejects.toThrow('Hash failed');
    });
  });

  describe('comparePassword', () => {
    it('should return true when passwords match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await TokenUtils.comparePassword(mockPassword, mockHash);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHash);
    });

    it('should return false when passwords do not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await TokenUtils.comparePassword(mockPassword, mockHash);

      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a token successfully', () => {
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = TokenUtils.generateToken(mockPayload);

      expect(result).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        expect.any(String),
        expect.objectContaining({ expiresIn: expect.any(String) })
      );
    });

    it('should handle sign errors', () => {
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error('Sign failed');
      });

      expect(() => TokenUtils.generateToken(mockPayload)).toThrow('Sign failed');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = TokenUtils.verifyToken(mockToken);

      expect(result).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
    });

    it('should throw error for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      expect(() => TokenUtils.verifyToken(mockToken)).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => TokenUtils.verifyToken(mockToken)).toThrow('Invalid token');
    });
  });

  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      (jwt.decode as jest.Mock).mockReturnValue(mockPayload);

      const result = TokenUtils.decodeToken(mockToken);

      expect(result).toEqual(mockPayload);
      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
    });

    it('should return null for invalid token format', () => {
      (jwt.decode as jest.Mock).mockReturnValue(null);

      const result = TokenUtils.decodeToken('invalid-token');

      expect(result).toBeNull();
    });
  });
});
