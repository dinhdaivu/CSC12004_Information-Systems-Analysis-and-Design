import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
export const hasSupabaseServiceRoleConfig = Boolean(supabaseUrl && supabaseServiceRoleKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseServiceRole = hasSupabaseServiceRoleConfig
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;
