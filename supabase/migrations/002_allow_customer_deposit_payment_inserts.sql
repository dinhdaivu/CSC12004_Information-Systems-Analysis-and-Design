-- Allow customer-created deposit and payment records.
-- This keeps the remote database aligned if 001_initial_schema.sql was already applied.

DROP POLICY IF EXISTS deposit_requests_customer_insert ON public.deposit_requests;
CREATE POLICY deposit_requests_customer_insert ON public.deposit_requests
FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS payments_customer_insert ON public.payments;
CREATE POLICY payments_customer_insert ON public.payments
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_staff());
