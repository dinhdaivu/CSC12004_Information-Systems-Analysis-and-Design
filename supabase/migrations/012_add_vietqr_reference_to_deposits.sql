-- Add vietqr_reference to deposit_requests so Spring JPA entity matches DB schema.
-- The column tracks the VietQR payment reference for each deposit.

ALTER TABLE public.deposit_requests
    ADD COLUMN IF NOT EXISTS vietqr_reference TEXT;
