-- Latest cleaned migration derived from ScriptDB_06.sql.
-- This version keeps the legacy dormitory schema but fixes the build order,
-- removes the duplicate invoice-detail table definition, and makes indexes repeat-safe.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================
-- ENUM TYPES
-- ========================

DO $$
BEGIN
    CREATE TYPE room_status AS ENUM ('available','occupied','reserved','maintenance');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE deposit_status AS ENUM ('pending','paid','expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE contract_status AS ENUM ('draft','active','terminated','completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE invoice_status AS ENUM ('unpaid','paid','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE role_type AS ENUM ('customer','sale','accountant','manager');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========================
-- CHI NHANH
-- ========================

CREATE TABLE IF NOT EXISTS chinhanh (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- HO SO (USER BASE)
-- ========================

CREATE TABLE IF NOT EXISTS hoso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    gender TEXT,
    dob DATE,
    phone TEXT,
    email TEXT,
    role role_type,
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- NHAN VIEN / KHACH HANG
-- ========================

CREATE TABLE IF NOT EXISTS nhanvien (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hoso_id UUID REFERENCES hoso(id),
    role role_type,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS khachhang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hoso_id UUID REFERENCES hoso(id),
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- NHOM
-- ========================

CREATE TABLE IF NOT EXISTS nhom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nhom_khachhang (
    nhom_id UUID REFERENCES nhom(id),
    khachhang_id UUID REFERENCES khachhang(id),
    PRIMARY KEY (nhom_id, khachhang_id)
);

-- ========================
-- DICH VU
-- ========================

CREATE TABLE IF NOT EXISTS dichvu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL
);

-- ========================
-- PHONG / GIUONG
-- ========================

CREATE TABLE IF NOT EXISTS phong (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chinhanh_id UUID REFERENCES chinhanh(id),
    name TEXT,
    capacity INT,
    price NUMERIC,
    status room_status DEFAULT 'available',
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS giuong (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phong_id UUID REFERENCES phong(id),
    name TEXT,
    status room_status DEFAULT 'available'
);

-- ========================
-- YEU CAU THUE / LICH XEM
-- ========================

CREATE TABLE IF NOT EXISTS yeucau_thue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    khachhang_id UUID REFERENCES khachhang(id),
    loai_phong TEXT,
    gia_min NUMERIC,
    gia_max NUMERIC,
    so_nguoi INT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lich_xem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yeucau_id UUID REFERENCES yeucau_thue(id),
    ngay_hen TIMESTAMP,
    status TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- DANG KY / TIEN COC / HOP DONG
-- ========================

CREATE TABLE IF NOT EXISTS dangky (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    khachhang_id UUID REFERENCES khachhang(id),
    phong_id UUID REFERENCES phong(id),
    giuong_id UUID REFERENCES giuong(id),
    status TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tiencoc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dangky_id UUID REFERENCES dangky(id),
    amount NUMERIC,
    status deposit_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hopdong (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dangky_id UUID REFERENCES dangky(id),
    start_date DATE,
    end_date DATE,
    status contract_status DEFAULT 'draft',
    note TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- HOA DON / CHI TIET HOA DON
-- ========================

CREATE TABLE IF NOT EXISTS hoadon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hopdong_id UUID REFERENCES hopdong(id),
    total NUMERIC,
    status invoice_status DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT now()
);

-- Keep the richer invoice-detail variant from the legacy script.
CREATE TABLE IF NOT EXISTS chitiet_hoadon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hoadon_id UUID REFERENCES hoadon(id),
    dichvu_id UUID REFERENCES dichvu(id),
    amount NUMERIC NOT NULL,
    name TEXT
);

-- ========================
-- BIEN BAN BAN GIAO / THANH LY
-- ========================

CREATE TABLE IF NOT EXISTS bienban_bangiao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hopdong_id UUID REFERENCES hopdong(id),
    created_at TIMESTAMP DEFAULT now(),
    status TEXT
);

CREATE TABLE IF NOT EXISTS chitiet_bangiao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bangiao_id UUID REFERENCES bienban_bangiao(id),
    item TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS bienban_thanhly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hopdong_id UUID REFERENCES hopdong(id),
    deposit_total NUMERIC,
    refund_rate NUMERIC,
    deduction NUMERIC,
    final_amount NUMERIC,
    payment_method TEXT,
    status TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- INDEXES
-- ========================

CREATE INDEX IF NOT EXISTS idx_khachhang_hoso ON khachhang(hoso_id);
CREATE INDEX IF NOT EXISTS idx_phong_status ON phong(status);
CREATE INDEX IF NOT EXISTS idx_giuong_status ON giuong(status);
CREATE INDEX IF NOT EXISTS idx_hopdong_status ON hopdong(status);
