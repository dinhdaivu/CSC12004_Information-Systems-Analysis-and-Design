import { requireAdmin } from "../middleware/require-admin";
import { AppError } from "../utils/errors";

describe("Require Admin Middleware", () => {
  const executeMiddleware = async (req: any, res: any, next: any) => {
    try {
      const result = requireAdmin(req, res, next) as any;
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      next(error);
    }
  };

  it("should block access if user is missing", async () => {
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    
    await executeMiddleware(req, res, next);
    
    const passedWithErrorToNext = next.mock.calls.length > 0 && next.mock.calls[0][0] instanceof Error;
    const respondedWith403 = res.status.mock.calls.length > 0 && res.status.mock.calls[0][0] === 403;
    
    expect(passedWithErrorToNext || respondedWith403).toBe(true);
  });

  it("should block access if user is not admin", async () => {
    const req: any = { user: { role: "manager" } };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    
    await executeMiddleware(req, res, next);
    
    const passedWithErrorToNext = next.mock.calls.length > 0 && next.mock.calls[0][0] instanceof Error;
    const respondedWith403 = res.status.mock.calls.length > 0 && res.status.mock.calls[0][0] === 403;
    
    expect(passedWithErrorToNext || respondedWith403).toBe(true);
  });

  it("should call next if user is admin", async () => {
    const req: any = { user: { role: "admin" } };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    
    await executeMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });
});