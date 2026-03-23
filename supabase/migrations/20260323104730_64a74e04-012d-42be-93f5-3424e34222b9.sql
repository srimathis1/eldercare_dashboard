
-- Create medications table
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'Once daily',
  times TEXT,
  next_dose TEXT,
  doctor TEXT,
  instructions TEXT,
  remaining INTEGER NOT NULL DEFAULT 30,
  total INTEGER NOT NULL DEFAULT 30,
  taken BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT 'TBD',
  location TEXT,
  doctor TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Medications RLS: doctors and caregivers can access medications for their patients
CREATE POLICY "Doctors can manage medications" ON public.medications
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.doctor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.doctor_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can view medications" ON public.medications
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can update medication taken status" ON public.medications
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.caregiver_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.caregiver_id = auth.uid()
  )
);

-- Appointments RLS
CREATE POLICY "Doctors can manage appointments" ON public.appointments
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.doctor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.doctor_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can view appointments" ON public.appointments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can update appointment status" ON public.appointments
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.caregiver_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.caregiver_id = auth.uid()
  )
);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.medications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- Updated_at triggers
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
