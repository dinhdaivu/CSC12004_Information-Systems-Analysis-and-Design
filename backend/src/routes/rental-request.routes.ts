import { Router } from 'express';
import { 
  createRentalRequest, 
  getMyRentalRequests,
  getAllRentalRequests,
  getRentalRequestById,
  updateRentalRequestStatus
} from '../controllers/rental-request.controller'; 
import { authMiddleware } from '../middleware/auth.middleware'; 
import rateLimit from 'express-rate-limit';

const router = Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 30, // Limit each IP to 30 requests per `windowMs`
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Yêu cầu xác thực cho tất cả endpoints
router.use(authMiddleware);

// ==========================================
// Routes cho Customer
// ==========================================
// Gắn limiter CHỈ cho phương thức POST (tạo mới)
router.post('/', apiLimiter, createRentalRequest);
router.get('/my-requests', getMyRentalRequests);

// ==========================================
// Routes cho Staff/Admin (Task 01-04)
// TODO: Nên thêm middleware kiểm tra role (vd: checkRole(['STAFF'])) ở đây
// ==========================================
router.get('/', getAllRentalRequests);
router.get('/:id', getRentalRequestById);
router.patch('/:id/status', updateRentalRequestStatus);

export default router;