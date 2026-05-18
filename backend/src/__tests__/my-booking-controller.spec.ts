import { Request, Response } from 'express';
import { MyBookingService } from '../services/my-booking.service';
import { MyBookingController } from '../controllers/my-booking.controller';
import { NotFoundError } from '../utils/errors';

jest.mock('../config/supabase', () => ({
  supabaseServiceRole: { from: jest.fn() },
}));
jest.mock('../services/my-booking.service', () => ({
  MyBookingService: {
    getMyBookings: jest.fn(),
    getBookingById: jest.fn(),
    handleAction: jest.fn(),
    checkAvailability: jest.fn(),
    submitDepositProof: jest.fn(),
  },
}));
jest.mock('@config/cloudinary', () => ({ uploader: { upload: jest.fn() } }));
jest.mock('@services/email.service', () => ({
  sendDepositConfirmedEmail: jest.fn(),
  sendDepositFailedEmail: jest.fn(),
}));

const MockService = MyBookingService as jest.Mocked<typeof MyBookingService>;

function mockRequest(body: Record<string, unknown> = {}, params: Record<string, string> = {}, query: Record<string, string> = {}, user?: { id: string; role: string }) {
  return { body, params, query, user } as unknown as Request;
}

function mockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
}

const mockNext = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('MyBookingController.getDetail', () => {
  it('should call next(error) when service throws', async () => {
    const req = mockRequest({}, { id: '1' }, {}, { id: 'cust-123', role: 'customer' });
    const res = mockResponse();
    MockService.getBookingById.mockRejectedValue(new NotFoundError('Not found'));

    await MyBookingController.getDetail(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
  });

  it('should call next with UnauthorizedError when user is missing', async () => {
    const req = mockRequest({}, { id: '1' }, {}, undefined);
    const res = mockResponse();

    await MyBookingController.getDetail(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});

describe('MyBookingController.checkAvailability', () => {
  it('should return 200 with isAvailable when user is authenticated', async () => {
    const req = mockRequest({}, { id: 'booking-1' }, {}, { id: 'cust-123', role: 'customer' });
    const res = mockResponse();
    MockService.checkAvailability.mockResolvedValue(true as never);

    await MyBookingController.checkAvailability(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, isAvailable: true });
    expect(MockService.checkAvailability).toHaveBeenCalledWith('cust-123', 'booking-1');
  });

  it('should return 200 with isAvailable=false', async () => {
    const req = mockRequest({}, { id: 'booking-1' }, {}, { id: 'cust-123', role: 'customer' });
    const res = mockResponse();
    MockService.checkAvailability.mockResolvedValue(false as never);

    await MyBookingController.checkAvailability(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith({ success: true, isAvailable: false });
  });

  it('should call next with UnauthorizedError when user is missing', async () => {
    const req = mockRequest({}, { id: 'booking-1' }, {}, undefined);
    const res = mockResponse();

    await MyBookingController.checkAvailability(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('should call next(error) when service throws', async () => {
    const req = mockRequest({}, { id: 'booking-1' }, {}, { id: 'cust-123', role: 'customer' });
    const res = mockResponse();
    MockService.checkAvailability.mockRejectedValue(new Error('service error'));

    await MyBookingController.checkAvailability(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('MyBookingController.submitProof', () => {
  it('should return 200 when proofImage is provided', async () => {
    const req = mockRequest({ proofImage: 'data:image/png;base64,abc' }, { id: 'booking-1' }, {}, { id: 'cust-123', role: 'customer' });
    const res = mockResponse();
    MockService.submitDepositProof.mockResolvedValue({ id: 'booking-1' } as never);

    await MyBookingController.submitProof(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    expect(MockService.submitDepositProof).toHaveBeenCalledWith('cust-123', 'booking-1', 'data:image/png;base64,abc');
  });

  it('should return 400 when proofImage is missing', async () => {
    const req = mockRequest({}, { id: 'booking-1' }, {}, { id: 'cust-123', role: 'customer' });
    const res = mockResponse();

    await MyBookingController.submitProof(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(MockService.submitDepositProof).not.toHaveBeenCalled();
  });

  it('should call next with UnauthorizedError when user is missing', async () => {
    const req = mockRequest({ proofImage: 'base64string' }, { id: 'booking-1' }, {}, undefined);
    const res = mockResponse();

    await MyBookingController.submitProof(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('should call next(error) when service throws', async () => {
    const req = mockRequest({ proofImage: 'base64string' }, { id: 'booking-1' }, {}, { id: 'cust-123', role: 'customer' });
    const res = mockResponse();
    MockService.submitDepositProof.mockRejectedValue(new Error('upload error'));

    await MyBookingController.submitProof(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('MyBookingController.performAction no-user branch', () => {
  it('should call next with UnauthorizedError when user is missing', async () => {
    const req = mockRequest({ action: 'cancel' }, { id: '1' }, {}, undefined);
    const res = mockResponse();

    await MyBookingController.performAction(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});

describe('MyBookingController.getList no-user branch', () => {
  it('should call next with UnauthorizedError when user is missing', async () => {
    const req = mockRequest({}, {}, {}, undefined);
    const res = mockResponse();

    await MyBookingController.getList(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});
