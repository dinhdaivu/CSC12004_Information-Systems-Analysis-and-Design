import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Chỉ báo lỗi nếu KHÔNG PHẢI môi trường test
if ((!supabaseUrl || !supabaseKey) && process.env.NODE_ENV !== 'test') {
  throw new Error('Missing Supabase configuration');
}

// Nếu đang test, dùng URL giả để hàm createClient không bị crash
export const supabase = createClient(
  supabaseUrl || 'https://mock.supabase.co', 
  supabaseKey || 'mock-key'
);

export const supabaseServiceRole = createClient(
  supabaseUrl || 'https://mock.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-role-key'
);