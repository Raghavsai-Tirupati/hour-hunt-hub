-- Fix security definer warning by explicitly setting views to SECURITY INVOKER
ALTER VIEW public.questions_with_votes SET (security_invoker = on);
ALTER VIEW public.answers_with_votes SET (security_invoker = on);