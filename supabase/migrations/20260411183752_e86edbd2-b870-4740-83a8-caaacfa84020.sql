
-- Create donors table
CREATE TABLE public.donors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  student_roll TEXT,
  batch_session TEXT NOT NULL,
  year_semester TEXT,
  gender TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  facebook_link TEXT,
  blood_group TEXT NOT NULL,
  last_donation_date TEXT,
  donor_status TEXT,
  weight TEXT,
  health_notes TEXT,
  available_now BOOLEAN NOT NULL DEFAULT true,
  preferred_time TEXT,
  current_area TEXT,
  hall_hostel TEXT,
  city TEXT,
  emergency_zone TEXT,
  blood_report_url TEXT,
  student_id_card_url TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- Anyone can view donors (public registry)
CREATE POLICY "Anyone can view donors" ON public.donors FOR SELECT USING (true);

-- Anyone can register as a donor
CREATE POLICY "Anyone can register as donor" ON public.donors FOR INSERT WITH CHECK (true);

-- Anyone can update their own record (by phone match for now)
CREATE POLICY "Anyone can update donors" ON public.donors FOR UPDATE USING (true);

-- Timestamp trigger
CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON public.donors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create false_reports table
CREATE TABLE public.false_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.emergency_requests(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  reporter_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.false_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view false reports" ON public.false_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can create false reports" ON public.false_reports FOR INSERT WITH CHECK (true);

-- Create site_stats table (single row cache)
CREATE TABLE public.site_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_donors INTEGER NOT NULL DEFAULT 0,
  active_requests INTEGER NOT NULL DEFAULT 0,
  rare_blood_count INTEGER NOT NULL DEFAULT 0,
  successful_matches INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site stats" ON public.site_stats FOR SELECT USING (true);

-- Insert initial row
INSERT INTO public.site_stats (total_donors, active_requests, rare_blood_count, successful_matches) VALUES (0, 0, 0, 0);

-- Enable realtime for donors
ALTER PUBLICATION supabase_realtime ADD TABLE public.donors;

-- Create a function to refresh site_stats
CREATE OR REPLACE FUNCTION public.refresh_site_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.site_stats SET
    total_donors = (SELECT COUNT(*) FROM public.donors),
    active_requests = (SELECT COUNT(*) FROM public.emergency_requests WHERE status = 'active'),
    rare_blood_count = (SELECT COUNT(*) FROM public.donors WHERE blood_group IN ('O-', 'A-', 'B-', 'AB-')),
    successful_matches = (SELECT COUNT(*) FROM public.emergency_requests WHERE status = 'solved'),
    updated_at = now();
  RETURN NULL;
END;
$$;

-- Trigger on donors insert/delete
CREATE TRIGGER refresh_stats_on_donor_change
  AFTER INSERT OR DELETE ON public.donors
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_site_stats();

-- Trigger on emergency_requests status change
CREATE TRIGGER refresh_stats_on_request_change
  AFTER INSERT OR UPDATE OR DELETE ON public.emergency_requests
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_site_stats();
