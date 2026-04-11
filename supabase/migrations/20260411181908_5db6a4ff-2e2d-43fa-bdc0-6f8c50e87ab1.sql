
-- Create urgency level enum
CREATE TYPE public.urgency_level AS ENUM ('critical', 'urgent', 'moderate');

-- Create request status enum
CREATE TYPE public.request_status AS ENUM ('active', 'solved', 'expired');

-- Create emergency_requests table
CREATE TABLE public.emergency_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  units_needed INTEGER NOT NULL DEFAULT 1,
  hospital TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  urgency_level public.urgency_level NOT NULL DEFAULT 'urgent',
  current_area TEXT,
  notes TEXT,
  doctor_note TEXT,
  ward_cabin TEXT,
  replacement_needed BOOLEAN DEFAULT false,
  donor_preference TEXT,
  gender_preference TEXT,
  additional_instructions TEXT,
  status public.request_status NOT NULL DEFAULT 'active',
  is_pinned BOOLEAN DEFAULT false,
  solved_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can view active requests (public emergency data)
CREATE POLICY "Anyone can view emergency requests"
ON public.emergency_requests
FOR SELECT
USING (true);

-- Anyone can create emergency requests (no auth required for emergencies)
CREATE POLICY "Anyone can create emergency requests"
ON public.emergency_requests
FOR INSERT
WITH CHECK (true);

-- Anyone can update (for solving/reporting - in production would be more restrictive)
CREATE POLICY "Anyone can update emergency requests"
ON public.emergency_requests
FOR UPDATE
USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_emergency_requests_updated_at
BEFORE UPDATE ON public.emergency_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;
