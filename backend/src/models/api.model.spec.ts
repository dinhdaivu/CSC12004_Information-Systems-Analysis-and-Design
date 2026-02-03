import { ApiResponse, ApiResponseBuilder } from '@models/api.model';

describe('API Models', () => {
  describe('ApiResponseBuilder', () => {
    it('should create a successful response', () => {
      const data = { id: 1, name: 'Test' };
      const response = ApiResponseBuilder.success(data, 'Success');

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Success');
    });

    it('should create an error response', () => {
      const response = ApiResponseBuilder.error('NOT_FOUND', 'Not found');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NOT_FOUND');
      expect(response.error?.message).toBe('Not found');
    });

    it('should create a success response with array data', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = ApiResponseBuilder.success(data, 'Retrieved successfully');

      expect(response.data).toEqual(data);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should create an error response with details', () => {
      const details = [{ field: 'email', message: 'Invalid email' }];
      const response = ApiResponseBuilder.error('VALIDATION_ERROR', 'Validation failed', details);

      expect(response.error?.details).toEqual(details);
    });

    it('should handle different error codes', () => {
      const errorCodes = ['NOT_FOUND', 'UNAUTHORIZED', 'FORBIDDEN', 'VALIDATION_ERROR', 'SERVER_ERROR'];

      errorCodes.forEach((code) => {
        const response = ApiResponseBuilder.error(code, 'Error');
        expect(response.error?.code).toBe(code);
      });
    });

    it('should handle complex nested data', () => {
      const complexData = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            settings: { theme: 'dark' },
          },
        },
        items: [{ id: 1 }, { id: 2 }],
      };
      const response = ApiResponseBuilder.success(complexData, 'Success');

      expect(response.data).toEqual(complexData);
      if (response.data) {
        expect(response.data.user.profile.settings.theme).toBe('dark');
      }
    });
  });
});
