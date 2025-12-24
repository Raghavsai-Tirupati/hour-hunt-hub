-- Add indexes for foreign keys and frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_reviews_opportunity_id ON public.reviews(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_questions_opportunity_id ON public.opportunity_questions(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON public.question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities(type);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_user_id ON public.saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_votes_votable_id ON public.discussion_votes(votable_id);

-- Create a function for server-side distance calculation (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance_miles(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
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