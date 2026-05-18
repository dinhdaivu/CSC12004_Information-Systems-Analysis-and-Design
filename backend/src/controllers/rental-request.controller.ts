import { Response, NextFunction } from 'express';
import { supabaseServiceRole } from '../config/supabase';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../utils/errors';
import cloudinary from '../config/cloudinary';
import { ViewingAppointmentsService } from '../services/viewing-appointments.service';

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
        if (!supabaseServiceRole) return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database client chưa được khởi tạo'));
        
        if (requestData.identity_card_base64) {
            const uploadResult = await cloudinary.uploader.upload(requestData.identity_card_base64 as string, {
                folder: 'homestay_dorm_id_cards'
            });
            // Gán link ảnh mới vào cột database ta vừa tạo
            requestData.identity_card_url = uploadResult.secure_url;
            
            // Xóa chuỗi base64 khổng lồ này đi để không bị lỗi khi Insert vào Supabase
            delete requestData.identity_card_base64; 
        }

        const scheduledAt = requestData.scheduled_at as string | undefined;
        delete requestData.scheduled_at;

        // Lấy thông tin cá nhân đính kèm để cập nhật profile khách hàng (nếu có)
        const userUpdates: Record<string, unknown> = {};
        if (requestData.full_name) userUpdates['full_name'] = requestData.full_name;
        if (requestData.phone_number) userUpdates['phone_number'] = requestData.phone_number;
        if (requestData.gender) userUpdates['gender'] = requestData.gender;
        if (requestData.identity_number) userUpdates['identity_number'] = requestData.identity_number;

        if (Object.keys(userUpdates).length > 0) {
            await supabaseServiceRole.from('users').update(userUpdates).eq('id', customerId);
        }

        // Xóa các trường tạm khỏi payload để không gây lỗi khi insert vào bảng rental_requests
        delete requestData.full_name;
        delete requestData.phone_number;
        delete requestData.gender;
        delete requestData.identity_number;

        // Gọi supabase insert data với requestData như bình thường...
        const { data, error } = await supabaseServiceRole
            .from('rental_requests')
            .insert([{ 
                ...requestData, 
                customer_id: customerId,
                    status: RentalRequestStatus.REVIEWING
            }])
            .select()
            .single();

        if (error) throw new AppError(500, 'SUPABASE_INSERT_ERROR', error.message);

        // Tạo tự động viewing appointment qua Service đã định chuẩn
        if (scheduledAt) {
            try {
                await ViewingAppointmentsService.createAppointment({
                    rentalRequestId: data.id,
                    customerId: customerId,
                    roomId: requestData.room_id as string | undefined,
                    bedId: requestData.bed_id as string | undefined,
                    scheduledAt: scheduledAt,
                    status: 'pending'
                });
            } catch (viewingError) {
                console.error("Lỗi khi tạo viewing_appointment qua service:", viewingError);
            }
        }

        res.status(201).json({ success: true, data, message: 'Yêu cầu thuê phòng đã được gửi thành công' });
    } catch (error: unknown) {
        next(error);
    }
};

export const getMyRentalRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const customerId = req.user?.id;
        if (!customerId) return next(new AppError(401, 'UNAUTHORIZED', 'Yêu cầu đăng nhập'));
        if (!supabaseServiceRole) return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database client chưa được khởi tạo'));
        
        const { data, error } = await supabaseServiceRole
            .from('rental_requests')
            .select('*, branches(name), rooms(room_number), users(full_name, gender, phone_number, email, identity_number)')
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
        if (!supabaseServiceRole) return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database lỗi'));

        const { data, error } = await supabaseServiceRole
            .from('rental_requests')
            .select('*, branches(name), rooms(room_number), users(full_name, gender, phone_number, email, identity_number)')
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
        if (!supabaseServiceRole) return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database lỗi'));

        const { data, error } = await supabaseServiceRole
            .from('rental_requests')
            .select('*, branches(name), rooms(room_number), users(full_name, gender, phone_number, email, identity_number)')
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
        
        if (!supabaseServiceRole) return next(new AppError(500, 'SUPABASE_CLIENT_UNAVAILABLE', 'Database lỗi'));

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

        const { data, error } = await supabaseServiceRole
            .from('rental_requests')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new AppError(500, 'SUPABASE_UPDATE_ERROR', error.message);

        // When transitioning to deposit_pending, ensure a deposit_request row exists
        if (updateData.status === RentalRequestStatus.DEPOSIT_PENDING && data.room_id) {
            const { data: existing } = await supabaseServiceRole
                .from('deposit_requests')
                .select('id')
                .eq('rental_request_id', data.id)
                .in('status', ['pending', 'paid'])
                .maybeSingle();

            if (!existing) {
                const { data: roomData } = await supabaseServiceRole
                    .from('rooms')
                    .select('price_per_month, max_capacity')
                    .eq('id', data.room_id)
                    .single();

                let amount = 0;
                if (roomData) {
                    const bedsCount = data.bed_id ? 1 : (roomData.max_capacity || 1);
                    amount = (roomData.price_per_month ?? 0) * 2 * bedsCount;
                }

                await supabaseServiceRole
                    .from('deposit_requests')
                    .insert({
                        rental_request_id: data.id,
                        customer_id: data.customer_id,
                        room_id: data.room_id,
                        bed_id: data.bed_id ?? null,
                        amount,
                        due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        status: 'pending',
                    });
            }
        }

        res.status(200).json({ success: true, data, message: 'Cập nhật thành công' });
    } catch (error: unknown) {
        next(error);
    }
};