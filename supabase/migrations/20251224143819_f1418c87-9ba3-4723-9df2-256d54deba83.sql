-- Fix security: set search_path for the distance function
CREATE OR REPLACE FUNCTION public.calculate_distance_miles(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  R constant numeric := 3959; -- Earth radius in miles
  dLat numeric;
  dLon numeric;
  a numeric;
  c numeric;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;
  
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat / 2) * sin(dLat / 2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon / 2) * sin(dLon / 2);
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  
  RETURN R * c;
END;
$$;