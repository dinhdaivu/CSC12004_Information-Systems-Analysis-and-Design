-- Harden chat realtime access now that the frontend subscribes directly to payloads.
-- These policies ensure customers only receive their own conversation rows while
-- staff can still monitor the full inbox.

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Chat access should be authenticated only; the frontend uses the anon key for
-- the Supabase client, but the JWT must be present for any row to be visible.
REVOKE SELECT ON public.conversations FROM anon;
REVOKE SELECT ON public.messages FROM anon;
GRANT SELECT ON public.conversations TO authenticated;
GRANT SELECT ON public.messages TO authenticated;

DROP POLICY IF EXISTS conversations_select_own_or_staff ON public.conversations;
CREATE POLICY conversations_select_own_or_staff
ON public.conversations
FOR SELECT TO authenticated
USING (
  customer_id = auth.uid()
  OR public.is_staff()
);

DROP POLICY IF EXISTS messages_select_own_or_staff ON public.messages;
CREATE POLICY messages_select_own_or_staff
ON public.messages
FOR SELECT TO authenticated
USING (
  public.is_staff()
  OR EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND c.customer_id = auth.uid()
  )
);