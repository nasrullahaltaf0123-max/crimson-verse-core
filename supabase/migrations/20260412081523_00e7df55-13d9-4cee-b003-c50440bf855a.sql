-- Add approval_status column
ALTER TABLE public.donors 
ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';

-- Update refresh_site_stats to only count approved donors
CREATE OR REPLACE FUNCTION public.refresh_site_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  stats_id uuid;
BEGIN
  SELECT id INTO stats_id FROM public.site_stats LIMIT 1;
  
  IF stats_id IS NOT NULL THEN
    UPDATE public.site_stats SET
      total_donors = (SELECT COUNT(*) FROM public.donors WHERE approval_status = 'approved'),
      active_requests = (SELECT COUNT(*) FROM public.emergency_requests WHERE status = 'active'),
      rare_blood_count = (SELECT COUNT(*) FROM public.donors WHERE blood_group IN ('O-', 'A-', 'B-', 'AB-') AND approval_status = 'approved'),
      successful_matches = (SELECT COUNT(*) FROM public.emergency_requests WHERE status = 'solved'),
      updated_at = now()
    WHERE id = stats_id;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Create triggers for auto-refresh (drop first if exist)
DROP TRIGGER IF EXISTS refresh_stats_on_donor_change ON public.donors;
CREATE TRIGGER refresh_stats_on_donor_change
  AFTER INSERT OR UPDATE OR DELETE ON public.donors
  FOR EACH ROW EXECUTE FUNCTION public.refresh_site_stats();

DROP TRIGGER IF EXISTS refresh_stats_on_request_change ON public.emergency_requests;
CREATE TRIGGER refresh_stats_on_request_change
  AFTER INSERT OR UPDATE OR DELETE ON public.emergency_requests
  FOR EACH ROW EXECUTE FUNCTION public.refresh_site_stats();