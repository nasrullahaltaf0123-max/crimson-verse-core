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
      total_donors = (SELECT COUNT(*) FROM public.donors),
      active_requests = (SELECT COUNT(*) FROM public.emergency_requests WHERE status = 'active'),
      rare_blood_count = (SELECT COUNT(*) FROM public.donors WHERE blood_group IN ('O-', 'A-', 'B-', 'AB-')),
      successful_matches = (SELECT COUNT(*) FROM public.emergency_requests WHERE status = 'solved'),
      updated_at = now()
    WHERE id = stats_id;
  END IF;
  
  RETURN NULL;
END;
$function$;