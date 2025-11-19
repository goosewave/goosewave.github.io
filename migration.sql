-- 1. Fix RLS Performance Issues
-- Update profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Update abstras policies
DROP POLICY IF EXISTS "Users can view own abstra" ON public.abstras;
CREATE POLICY "Users can view own abstra" ON public.abstras FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own abstra" ON public.abstras;
CREATE POLICY "Users can insert own abstra" ON public.abstras FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own abstra" ON public.abstras;
CREATE POLICY "Users can update own abstra" ON public.abstras FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own abstra" ON public.abstras;
CREATE POLICY "Users can delete own abstra" ON public.abstras FOR DELETE USING (auth.uid() = user_id);

-- 2. Add username column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;

-- 3. Set initial usernames
UPDATE public.profiles SET username = 'Lucas Poirier' WHERE email = 'lucaspoirier6@gmail.com';
UPDATE public.profiles SET username = 'Kyanni' WHERE email = 'kyannihippsley@gmail.com';
