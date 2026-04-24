import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// 1. Ép buộc nạp .env ngay tại đây, lấy đường dẫn tuyệt đối ra thư mục gốc
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 2. In ra console để kiểm tra (bạn sẽ thấy nó có ra chữ hay báo undefined)
console.log('--- CLOUDINARY DEBUG ---');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Đã load được' : 'Lỗi: Chưa load được');
console.log('------------------------');

// 3. Cấu hình
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;