import { Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../utils/errors';

// 1. Enum khớp 100% với kiểu "public.rental_request_status" trong DB của bạn
export enum RentalRequestStatus {
    REQUESTED = 'requested',
    REVIEWING = 'reviewing',
    VIEWING_SCHEDULED = 'viewing_scheduled',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
    DEPOSIT_PENDING = 'deposit_pending',
    COMPLETED = 'completed'
}

// 2. Enum ảo dành riêng cho Frontend truyền xuống (Không lưu trực tiếp vào DB)
export enum ViewingResultPayload {
    AGREED = 'agreed',
    NEEDS_FOLLOW_UP = 'needs_follow_up',
    NOT_INTERESTED = 'not_interested',
    NO_SHOW = 'no_show'
}

export const createRentalRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const requestData = req.body as Record<string, unknown>;
        const customerId = req.user?.id; 

        if (!customerId) return next(new AppError(401, 'UNAUTHORIZED', 'Yêu cầu đăng nhập'));
        if (!supabase) return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database client chưa được khởi tạo'));
        
        const { data, error } = await supabase
            .from('rental_requests')
            .insert([{ 
                ...requestData, 
                customer_id: customerId,
                status: RentalRequestStatus.REQUESTED 
            }])
            .select()
            .single();

        if (error) throw new AppError(500, 'SUPABASE_INSERT_ERROR', error.message);

        res.status(201).json({ success: true, data, message: 'Yêu cầu thuê phòng đã được gửi thành công' });
    } catch (error: unknown) {
        next(error);
    }
};

export const getMyRentalRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const customerId = req.user?.id;
        if (!customerId) return next(new AppError(401, 'UNAUTHORIZED', 'Yêu cầu đăng nhập'));
        if (!supabase) return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database client chưa được khởi tạo'));
        
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

// ==============================================================
// STAFF/ADMIN APIs (Task 01-04)
// ==============================================================

export const getAllRentalRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!supabase) return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database lỗi'));

        const { data, error } = await supabase
            .from('rental_requests')
            .select('*, branches(name), rooms(room_number)')
            .order('created_at', { ascending: false });

        if (error) throw new AppError(500, 'SUPABASE_QUERY_ERROR', error.message);
        res.status(200).json({ success: true, data });
    } catch (error: unknown) {
        next(error);
    }
};

export const getRentalRequestById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        if (!supabase) return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database lỗi'));

        const { data, error } = await supabase
            .from('rental_requests')
            .select('*, branches(name), rooms(room_number)')
            .eq('id', id)
            .single();

        if (error) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu thuê phòng');
        res.status(200).json({ success: true, data });
    } catch (error: unknown) {
        next(error);
    }
};

export const updateRentalRequestStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const payload = req.body as { 
            status?: RentalRequestStatus, 
            viewing_result?: ViewingResultPayload, 
            room_id?: string, 
            bed_id?: string 
        };
        
        if (!supabase) return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database lỗi'));

        const updateData: Record<string, unknown> = {};
        
        // 1. Staff ghép phòng (Match)
        if (payload.room_id) updateData.room_id = payload.room_id; 
        if (payload.bed_id) updateData.bed_id = payload.bed_id;    

        // 2. Cập nhật Status trực tiếp
        if (payload.status) updateData.status = payload.status;

        // 3. Xử lý "Kết quả xem phòng" bằng cách quy đổi sang Status của CSDL hiện tại
        if (payload.viewing_result) {
            switch (payload.viewing_result) {
                case ViewingResultPayload.AGREED:
                    updateData.status = RentalRequestStatus.DEPOSIT_PENDING; // Sẵn sàng cọc
                    break;
                case ViewingResultPayload.NEEDS_FOLLOW_UP:
                    updateData.status = RentalRequestStatus.REVIEWING; // Trở lại xem xét
                    break;
                case ViewingResultPayload.NOT_INTERESTED:
                    updateData.status = RentalRequestStatus.REJECTED; // Bị từ chối
                    break;
                case ViewingResultPayload.NO_SHOW:
                    updateData.status = RentalRequestStatus.CANCELLED; // Khách hủy hẹn
                    break;
            }
        }

        const { data, error } = await supabase
            .from('rental_requests')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new AppError(500, 'SUPABASE_UPDATE_ERROR', error.message);
        
        res.status(200).json({ success: true, data, message: 'Cập nhật thành công' });
    } catch (error: unknown) {
        next(error);
    }
};