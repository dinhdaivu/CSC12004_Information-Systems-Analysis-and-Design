import { Router } from 'express';
import { MyBookingController } from '../controllers/my-booking.controller';
import { authMiddleware/*, roleMiddleware*/ } from '../middleware/auth.middleware';
import { rateLimit } from 'node_modules/express-rate-limit/dist/index.cjs';

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
    
// Áp dụng middleware xác thực cho TOÀN BỘ routes ở dưới
router.use(authMiddleware);
// Tùy chọn: Nếu muốn chỉ customer mới được gọi API này
// router.use(roleMiddleware(['customer']));

// GET /api/my-bookings - Lấy danh sách (có hỗ trợ query ?status=pending)
router.get('/', apiLimiter, MyBookingController.getList);

// GET /api/my-bookings/:id - Lấy chi tiết
router.get('/:id', apiLimiter, MyBookingController.getDetail);

// POST /api/my-bookings/:id/actions - Thực hiện hành động (Hủy)
router.post('/:id/actions', apiLimiter, MyBookingController.performAction);

export default router;