-- Donations tracking table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  patient_name TEXT,
  blood_group TEXT NOT NULL,
  hospital TEXT,
  area TEXT,
  units_donated INTEGER NOT NULL DEFAULT 1,
  emergency_request_id UUID REFERENCES public.emergency_requests(id) ON DELETE SET NULL,
  donor_note TEXT,
  patient_relation TEXT DEFAULT 'unknown',
  verified_by_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Anyone can create donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update donations" ON public.donations FOR UPDATE USING (true);

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add access token to donors for phone-based identity
ALTER TABLE public.donors ADD COLUMN IF NOT EXISTS access_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex');

-- Index for fast lookups
CREATE INDEX idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX idx_donors_phone ON public.donors(phone);
CREATE INDEX idx_donors_access_token ON public.donors(access_token);

-- Enable realtime for donations
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;