import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Opportunity {
  id: string;
  name: string;
  type: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  hours_required: string;
  acceptance_likelihood: string;
  description: string | null;
  requirements: string[];
  phone: string | null;
  email: string | null;
  website: string | null;
  avg_rating?: number;
  review_count?: number;
  distance?: number;
}

interface UseOpportunitiesOptions {
  userLocation: { lat: number; lng: number } | null;
  filterType: string;
  searchTerm: string;
  pageSize?: number;
}

interface UseOpportunitiesResult {
  opportunities: Opportunity[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  totalCount: number;
}

export function useOpportunities({
  userLocation,
  filterType,
  searchTerm,
  pageSize = 20,
}: UseOpportunitiesOptions): UseOpportunitiesResult {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  // Reset when filters change
  useEffect(() => {
    setOpportunities([]);
    setPage(0);
    setHasMore(true);
  }, [filterType, searchTerm, userLocation?.lat, userLocation?.lng]);

  const fetchOpportunities = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const from = pageNum * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("opportunities_with_ratings")
        .select("*", { count: "exact" });

      // Apply type filter
      if (filterType !== "all") {
        query = query.eq("type", filterType);
      }

      // Apply search filter (on name and location)
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      // Pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      let processedData: Opportunity[] = (data || []).map((opp: any) => ({
        id: opp.id,
        name: opp.name,
        type: opp.type,
        location: opp.location,
        latitude: opp.latitude,
        longitude: opp.longitude,
        hours_required: opp.hours_required,
        acceptance_likelihood: opp.acceptance_likelihood,
        description: opp.description,
        requirements: opp.requirements || [],
        phone: opp.phone,
        email: opp.email,
        website: opp.website,
        avg_rating: opp.avg_rating,
        review_count: opp.review_count,
        distance: undefined,
      }));

      // Calculate distance client-side (server-side would require RPC call)
      if (userLocation) {
        processedData = processedData.map((opp) => ({
          ...opp,
          distance: opp.latitude && opp.longitude
            ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                opp.latitude,
                opp.longitude
              )
            : undefined,
        }));

        // Sort by distance
        processedData.sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
      }

      if (pageNum === 0) {
        setOpportunities(processedData);
      } else {
        setOpportunities((prev) => [...prev, ...processedData]);
      }

      setTotalCount(count || 0);
      setHasMore(processedData.length === pageSize);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filterType, searchTerm, userLocation, pageSize, toast]);

  // Fetch on mount and when filters/page change
  useEffect(() => {
    fetchOpportunities(page);
  }, [page, fetchOpportunities]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  return {
    opportunities,
    loading,
    hasMore,
    loadMore,
    totalCount,
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
