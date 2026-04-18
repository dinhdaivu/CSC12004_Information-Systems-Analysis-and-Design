import { Response, NextFunction } from 'express';
// Đổi alias thành đường dẫn tương đối để ESLint không báo lỗi
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../utils/errors';

export const createRentalRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Fix lỗi "Unsafe assignment of an any value"
        const requestData = req.body as Record<string, unknown>;
        const customerId = req.user?.id; 

        if (!customerId) {
            return next(new AppError(401, 'UNAUTHORIZED', 'Yêu cầu đăng nhập để thực hiện chức năng này'));
        }

        if (!supabase) {
            return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database client chưa được khởi tạo'));
        }

        // TODO: Kiểm tra tính khả dụng của phòng/giường (Task 01-03)
        
        const { data, error } = await supabase
            .from('rental_requests')
            .insert([{ 
                ...requestData, 
                customer_id: customerId,
                status: 'requested' 
            }])
            .select()
            .single();

        if (error) throw new AppError(500, 'SUPABASE_INSERT_ERROR', error.message);

        res.status(201).json({ 
            success: true, 
            data,
            message: 'Yêu cầu thuê phòng đã được gửi thành công'
        });
    // Fix lỗi "Unexpected any" trong catch block
    } catch (error: unknown) {
        next(error);
    }
};

export const getMyRentalRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const customerId = req.user?.id;

        if (!customerId) {
            return next(new AppError(401, 'UNAUTHORIZED', 'Yêu cầu đăng nhập để xem yêu cầu thuê của bạn'));
        }

        if (!supabase) {
            return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database client chưa được khởi tạo'));
        }
        
        const { data, error } = await supabase
            .from('rental_requests')
            .select('*, branches(name), rooms(room_number)')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) throw new AppError(500, 'SUPABASE_QUERY_ERROR', error.message);
        
        res.status(200).json({ success: true, data });
    } catch (error: unknown) {
        next(error);
    }
};