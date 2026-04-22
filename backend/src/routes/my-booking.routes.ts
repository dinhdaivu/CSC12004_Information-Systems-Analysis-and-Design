import { Router } from 'express';
import { MyBookingController } from '../controllers/my-booking.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Áp dụng middleware xác thực cho TOÀN BỘ routes ở dưới
router.use(authMiddleware);
// Tùy chọn: Nếu muốn chỉ customer mới được gọi API này, có thể dùng:
// router.use(roleMiddleware(['customer']));

// GET /api/my-bookings - Lấy danh sách (có hỗ trợ query ?status=pending)
router.get('/', MyBookingController.getList);

// GET /api/my-bookings/:id - Lấy chi tiết
router.get('/:id', MyBookingController.getDetail);

// POST /api/my-bookings/:id/actions - Thực hiện hành động (Hủy)
router.post('/:id/actions', MyBookingController.performAction);

export default router;