-- -- ========================
-- -- DROP TABLES 
-- -- ========================

-- DROP TABLE IF EXISTS chitiet_bangiao CASCADE;
-- DROP TABLE IF EXISTS bienban_bangiao CASCADE;

-- DROP TABLE IF EXISTS chitiet_hoadon CASCADE;
-- DROP TABLE IF EXISTS hoadon CASCADE;

-- DROP TABLE IF EXISTS chitiet_hopdong CASCADE;
-- DROP TABLE IF EXISTS bienban_thanhly CASCADE;
-- DROP TABLE IF EXISTS hopdong CASCADE;

-- DROP TABLE IF EXISTS tiencoc CASCADE;
-- DROP TABLE IF EXISTS dangky CASCADE;

-- DROP TABLE IF EXISTS lich_xem CASCADE;
-- DROP TABLE IF EXISTS yeucau_thue CASCADE;

-- DROP TABLE IF EXISTS giuong CASCADE;
-- DROP TABLE IF EXISTS phong CASCADE;

-- DROP TABLE IF EXISTS dichvu CASCADE;

-- DROP TABLE IF EXISTS nhom_khachhang CASCADE;
-- DROP TABLE IF EXISTS nhom CASCADE;

-- DROP TABLE IF EXISTS khachhang CASCADE;
-- DROP TABLE IF EXISTS nhanvien CASCADE;
-- DROP TABLE IF EXISTS hoso CASCADE;

-- DROP TABLE IF EXISTS chinhanh CASCADE;

-- -- ========================
-- -- DROP ENUM TYPES
-- -- ========================

-- DROP TYPE IF EXISTS invoice_status CASCADE;
-- DROP TYPE IF EXISTS contract_status CASCADE;
-- DROP TYPE IF EXISTS deposit_status CASCADE;
-- DROP TYPE IF EXISTS room_status CASCADE;
-- DROP TYPE IF EXISTS role_type CASCADE;

-- -- ========================
-- -- DROP EXTENSION
-- -- ========================
-- -- DROP EXTENSION IF EXISTS pgcrypto;

-- ========================
-- EXTENSIONS
-- ========================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================
-- ENUM TYPES
-- ========================
CREATE TYPE room_status AS ENUM ('available','occupied','reserved','maintenance');
CREATE TYPE deposit_status AS ENUM ('pending','paid','expired');
CREATE TYPE contract_status AS ENUM ('draft','active','terminated','completed');
CREATE TYPE invoice_status AS ENUM ('unpaid','paid','cancelled');
CREATE TYPE role_type AS ENUM ('customer','sale','accountant','manager');

-- ========================
-- CHI NHANH
-- ========================
CREATE TABLE chinhanh (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- HO SO (USER BASE)
-- ========================
CREATE TABLE hoso (
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
-- NHAN VIEN
-- ========================
CREATE TABLE nhanvien (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hoso_id UUID REFERENCES hoso(id),
    role role_type,
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- KHACH HANG
-- ========================
CREATE TABLE khachhang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hoso_id UUID REFERENCES hoso(id),
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- NHOM
-- ========================
CREATE TABLE nhom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE nhom_khachhang (
    nhom_id UUID REFERENCES nhom(id),
    khachhang_id UUID REFERENCES khachhang(id),
    PRIMARY KEY (nhom_id, khachhang_id)
);

-- ========================
-- DICH VU
-- ========================
CREATE TABLE dichvu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL
);


-- ========================
-- PHONG
-- ========================
CREATE TABLE phong (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chinhanh_id UUID REFERENCES chinhanh(id),
    name TEXT,
    capacity INT,
    price NUMERIC,
    status room_status DEFAULT 'available',
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- GIUONG
-- ========================
CREATE TABLE giuong (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phong_id UUID REFERENCES phong(id),
    name TEXT,
    status room_status DEFAULT 'available'
);

-- ========================
-- YEU CAU THUE 
-- ========================
CREATE TABLE yeucau_thue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    khachhang_id UUID REFERENCES khachhang(id),
    loai_phong TEXT,
    gia_min NUMERIC,
    gia_max NUMERIC,
    so_nguoi INT,
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- LICH XEM PHONG
-- ========================
CREATE TABLE lich_xem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yeucau_id UUID REFERENCES yeucau_thue(id),
    ngay_hen TIMESTAMP,
    status TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- DANG KY 
-- ========================
CREATE TABLE dangky (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    khachhang_id UUID REFERENCES khachhang(id),
    phong_id UUID REFERENCES phong(id),
    giuong_id UUID REFERENCES giuong(id),
    status TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- TIEN COC 
-- ========================
CREATE TABLE tiencoc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dangky_id UUID REFERENCES dangky(id),
    amount NUMERIC,
    status deposit_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- HOP DONG 
-- ========================
CREATE TABLE hopdong (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dangky_id UUID REFERENCES dangky(id),
    start_date DATE,
    end_date DATE,
    status contract_status DEFAULT 'draft',
    note TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- CHI TIET HOP DONG
-- ========================
CREATE TABLE chitiet_hoadon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hoadon_id UUID REFERENCES hoadon(id),
    dichvu_id UUID REFERENCES dichvu(id), 
    amount NUMERIC NOT NULL,             
    name TEXT                           

-- ========================
-- HOA DON
-- ========================
CREATE TABLE hoadon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hopdong_id UUID REFERENCES hopdong(id),
    total NUMERIC,
    status invoice_status DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT now()
);

-- ========================
-- CHI TIET HOA DON
-- ========================
CREATE TABLE chitiet_hoadon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hoadon_id UUID REFERENCES hoadon(id),
    name TEXT,
    amount NUMERIC
);

-- ========================
-- BIEN BAN BAN GIAO 
-- ========================
CREATE TABLE bienban_bangiao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hopdong_id UUID REFERENCES hopdong(id),
    created_at TIMESTAMP DEFAULT now(),
    status TEXT
);

CREATE TABLE chitiet_bangiao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bangiao_id UUID REFERENCES bienban_bangiao(id),
    item TEXT,
    status TEXT
);

-- ========================
-- BIEN BAN THANH LY 
-- ========================
CREATE TABLE bienban_thanhly (
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
CREATE INDEX idx_khachhang_hoso ON khachhang(hoso_id);
CREATE INDEX idx_phong_status ON phong(status);
CREATE INDEX idx_giuong_status ON giuong(status);
CREATE INDEX idx_hopdong_status ON hopdong(status);
