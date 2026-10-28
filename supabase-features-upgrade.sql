-- =========================================================================
-- 1. FIX TEACHER CASCADE DELETE (Problem 2)
-- =========================================================================
-- This function runs as SECURITY DEFINER and cleanly deletes all child records 
-- across all tables before removing the user from profiles and auth.users.
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Delete all child/dependent records of the teacher or student
  DELETE FROM public.materials WHERE teacher_id = target_user_id;
  DELETE FROM public.tests WHERE teacher_id = target_user_id;
  DELETE FROM public.classes_schedule WHERE teacher_id = target_user_id;
  DELETE FROM public.attendance WHERE teacher_id = target_user_id OR student_id = target_user_id;
  DELETE FROM public.student_performance WHERE teacher_id = target_user_id OR student_id = target_user_id;
  DELETE FROM public.student_enrollments WHERE student_id = target_user_id;
  DELETE FROM public.announcements WHERE sender_id = target_user_id;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- Delete from auth.users (permanently removes login credentials)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(uuid) TO authenticated, service_role;


-- =========================================================================
-- 2. PASSWORD RESET TRACKING & MONTHLY LIMIT (Problem 3)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.password_reset_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  reset_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.password_reset_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/insert for password reset functionality
DROP POLICY IF EXISTS "Allow reset logs read" ON public.password_reset_logs;
DROP POLICY IF EXISTS "Allow reset logs insert" ON public.password_reset_logs;

CREATE POLICY "Allow reset logs read" ON public.password_reset_logs FOR SELECT USING (true);
CREATE POLICY "Allow reset logs insert" ON public.password_reset_logs FOR INSERT WITH CHECK (true);

-- Function to check if user has exceeded 2 resets in the current calendar month
CREATE OR REPLACE FUNCTION public.check_password_reset_limit(user_email text)
RETURNS json AS $$
DECLARE
  reset_count int;
BEGIN
  -- Count resets in the current calendar month
  SELECT COUNT(*) INTO reset_count
  FROM public.password_reset_logs
  WHERE lower(email) = lower(user_email)
    AND reset_at >= date_trunc('month', now());

  IF reset_count >= 2 THEN
    RETURN json_build_object(
      'allowed', false,
      'count', reset_count,
      'message', 'Monthly limit reached: You can only reset your password 2 times per month.'
    );
  ELSE
    RETURN json_build_object(
      'allowed', true,
      'count', reset_count,
      'remaining', 2 - reset_count
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log a successful password reset
CREATE OR REPLACE FUNCTION public.log_password_reset(user_email text)
RETURNS void AS $$
BEGIN
  INSERT INTO public.password_reset_logs (email, reset_at)
  VALUES (lower(user_email), now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_password_reset_limit(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_password_reset(text) TO anon, authenticated, service_role;


-- =========================================================================
-- 3. SUPABASE STORAGE BUCKET FOR DIRECT PDF UPLOADS (Problem 1)
-- =========================================================================
-- Create 'materials' public storage bucket if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies so anyone can view uploaded files, and teachers/authenticated users can upload
DROP POLICY IF EXISTS "Public can view materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete materials" ON storage.objects;

CREATE POLICY "Public can view materials" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'materials');

CREATE POLICY "Anyone can upload materials" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Anyone can delete materials" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'materials');
