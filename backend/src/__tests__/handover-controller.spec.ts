import { HandoverController } from '../controllers/handover.controller';
import { HandoverService } from '../services/handover.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { Response } from 'express';

jest.mock('../services/handover.service');

describe('HandoverController', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { query: {}, params: {}, body: {}, user: { id: 'u1', role: 'manager', email: 'e' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return list', async () => {
    req.query = { contractId: 'c1', customerId: 'cu1', status: 'pending' };
    (HandoverService.list as jest.Mock).mockResolvedValue('list-data');
    await HandoverController.list(req as AuthRequest, res as Response, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'list-data' });
  });

  it('should get detail by id', async () => {
    req.params = { id: '1' };
    (HandoverService.getById as jest.Mock).mockResolvedValue('get-data');
    await HandoverController.getById(req as AuthRequest, res as Response, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'get-data' });
  });

  it('should create handover', async () => {
    req.body = { contractId: 'c1', customerId: 'cu1' };
    (HandoverService.create as jest.Mock).mockResolvedValue('created');
    await HandoverController.create(req as AuthRequest, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'created' });
  });

  it('should complete handover', async () => {
    req.params = { id: '1' };
    (HandoverService.complete as jest.Mock).mockResolvedValue('completed');
    await HandoverController.complete(req as AuthRequest, res as Response, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'completed' });
  });

  it('should cancel handover', async () => {
    req.params = { id: '1' };
    (HandoverService.cancel as jest.Mock).mockResolvedValue('cancelled');
    await HandoverController.cancel(req as AuthRequest, res as Response, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'cancelled' });
  });

  it('should add handover item', async () => {
    req.params = { id: '1' };
    req.body = { itemName: 'key' };
    (HandoverService.addItem as jest.Mock).mockResolvedValue('added');
    await HandoverController.addItem(req as AuthRequest, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'added' });
  });

  it('should forward errors to next', async () => {
    const error = new Error('test error');
    (HandoverService.list as jest.Mock).mockRejectedValue(error);
    await HandoverController.list(req as AuthRequest, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});