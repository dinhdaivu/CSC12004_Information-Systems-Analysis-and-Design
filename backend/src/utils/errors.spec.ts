import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from '@utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with all properties', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message', [{ field: 'name' }]);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual([{ field: 'name' }]);
      expect(error.name).toBe('AppError');
      expect(error instanceof Error).toBe(true);
    });

    it('should create an AppError without details', () => {
      const error = new AppError(500, 'SERVER_ERROR', 'Server error');

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.details).toBeUndefined();
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with default values', () => {
      const error = new ValidationError('Validation failed');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('ValidationError');
    });

    it('should create a ValidationError with details', () => {
      const details = [{ field: 'email', message: 'Invalid email' }];
      const error = new ValidationError('Validation failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an UnauthorizedError with custom message', () => {
      const error = new UnauthorizedError('Invalid credentials');

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Invalid credentials');
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create an UnauthorizedError with default message', () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('ForbiddenError', () => {
    it('should create a ForbiddenError with custom message', () => {
      const error = new ForbiddenError('Insufficient permissions');

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Insufficient permissions');
      expect(error.name).toBe('ForbiddenError');
    });

    it('should create a ForbiddenError with default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Forbidden');
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with custom message', () => {
      const error = new NotFoundError('User not found');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('User not found');
      expect(error.name).toBe('NotFoundError');
    });

    it('should create a NotFoundError with default message', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Not found');
    });
  });

  describe('ConflictError', () => {
    it('should create a ConflictError with custom message', () => {
      const error = new ConflictError('Email already exists');

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Email already exists');
      expect(error.name).toBe('ConflictError');
    });

    it('should create a ConflictError with default message', () => {
      const error = new ConflictError();

      expect(error.message).toBe('Conflict');
    });
  });

  describe('InternalServerError', () => {
    it('should create an InternalServerError with custom message', () => {
      const error = new InternalServerError('Database connection failed');

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Database connection failed');
      expect(error.name).toBe('InternalServerError');
    });

    it('should create an InternalServerError with default message', () => {
      const error = new InternalServerError();

      expect(error.message).toBe('Internal server error');
    });
  });
});
