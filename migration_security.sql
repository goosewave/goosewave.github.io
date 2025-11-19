-- 1. Fix Security Warning: mutable search_path
-- Ensure handle_new_user runs with a safe search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$;

-- 2. Fix Performance Warning: auth_rls_initplan
-- Use (select auth.uid()) to prevent re-evaluation for every row

-- Drop ALL existing policies to clean up duplicates (Fixes multiple_permissive_policies)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own abstra" ON public.abstras;
DROP POLICY IF EXISTS "Users can view their own Abstras" ON public.abstras;
DROP POLICY IF EXISTS "Users can insert own abstra" ON public.abstras;
DROP POLICY IF EXISTS "Users can create their own Abstras" ON public.abstras;
DROP POLICY IF EXISTS "Users can update own abstra" ON public.abstras;
DROP POLICY IF EXISTS "Users can update their own Abtras" ON public.abstras;
DROP POLICY IF EXISTS "Users can delete own abstra" ON public.abstras;
DROP POLICY IF EXISTS "Users can delete their own Abstras" ON public.abstras;

-- Re-create optimized policies for PROFILES
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (id = (select auth.uid()));

-- Re-create optimized policies for ABSTRAS
CREATE POLICY "Users can view own abstra" 
ON public.abstras FOR SELECT 
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own abstra" 
ON public.abstras FOR INSERT 
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own abstra" 
ON public.abstras FOR UPDATE 
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own abstra" 
ON public.abstras FOR DELETE 
USING (user_id = (select auth.uid()));
