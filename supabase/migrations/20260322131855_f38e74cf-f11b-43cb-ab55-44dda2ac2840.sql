-- Add caregiver_email column to patients table
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS caregiver_email text;

-- Update the handle_new_user trigger function to auto-link caregiver to patient by email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
  _name TEXT;
BEGIN
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'caregiver');
  _name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');

  INSERT INTO public.profiles (id, name, email, role)
  VALUES (NEW.id, _name, NEW.email, _role);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  -- If caregiver, auto-link to patient by email
  IF _role = 'caregiver' THEN
    UPDATE public.patients
    SET caregiver_id = NEW.id
    WHERE caregiver_email = NEW.email AND caregiver_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Make sure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add RLS policy for caregivers to update their patient
CREATE POLICY "Caregivers can update their patient"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (caregiver_id = auth.uid());