/**
 * USE LINKED ELDERS HOOK
 * Phase 2, Track B: Caregiver UI - Elder Selector
 * 
 * Custom hook that queries Supabase for all family_links where
 * caregiver_id equals the current user, joining with profiles
 * to get Elder's full_name and avatar_url.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { LinkedElder } from '../../../types/schema';

interface UseLinkedEldersResult {
  elders: LinkedElder[];
  isLoading: boolean;
  error: Error | null;
}

export const useLinkedElders = (): UseLinkedEldersResult => {
  const [elders, setElders] = useState<LinkedElder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLinkedElders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw new Error(`Authentication error: ${authError.message}`);
        }

        if (!user) {
          throw new Error('No authenticated user found');
        }

        // Query family_links for the current caregiver
        const { data: linksData, error: linksError } = await supabase
          .from('family_links')
          .select('id, elder_id')
          .eq('caregiver_id', user.id);

        if (linksError) {
          throw new Error(`Query error: ${linksError.message}`);
        }

        if (!linksData || linksData.length === 0) {
          setElders([]);
          return;
        }

        // Extract elder IDs
        const elderIds = linksData.map((link) => link.elder_id);

        // Query profiles for the linked elders
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', elderIds);

        if (profilesError) {
          throw new Error(`Profiles query error: ${profilesError.message}`);
        }

        // Create a map of elder_id -> profile for quick lookup
        const profileMap = new Map(
          (profilesData || []).map((profile) => [profile.id, profile])
        );

        // Transform the data to match LinkedElder interface
        const linkedElders: LinkedElder[] = linksData
          .map((link) => {
            const profile = profileMap.get(link.elder_id);
            if (!profile) {
              return null;
            }
            return {
              id: profile.id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              family_link_id: link.id,
            };
          })
          .filter((elder): elder is LinkedElder => elder !== null);

        setElders(linkedElders);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        setElders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkedElders();
  }, []);

  return { elders, isLoading, error };
};
