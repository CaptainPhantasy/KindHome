/**
 * USE ELDER DASHBOARD HOOK
 * Phase 2, Track B: Caregiver UI - Dashboard Overview
 * 
 * Custom hook that fetches dashboard data for a specific elder:
 * - Elder profile information
 * - Medication adherence statistics
 * - Recent medication events
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Profile, Medication, MedEvent } from '../../../types/schema';

interface DashboardStats {
  totalMedications: number;
  adherenceRate: number; // Percentage (0-100)
  takenToday: number;
  missedToday: number;
  skippedToday: number;
}

interface ElderDashboardData {
  elder: Profile | null;
  medications: Medication[];
  recentEvents: MedEvent[];
  stats: DashboardStats;
}

interface UseElderDashboardResult {
  data: ElderDashboardData | null;
  isLoading: boolean;
  error: Error | null;
}

export const useElderDashboard = (elderId: string | null): UseElderDashboardResult => {
  const [data, setData] = useState<ElderDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!elderId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch elder profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', elderId)
          .single();

        if (profileError) {
          throw new Error(`Profile error: ${profileError.message}`);
        }

        // Fetch medications for this elder
        const { data: medicationsData, error: medicationsError } = await supabase
          .from('medications')
          .select('*')
          .eq('elder_id', elderId)
          .order('name', { ascending: true });

        if (medicationsError) {
          throw new Error(`Medications error: ${medicationsError.message}`);
        }

        const medications = medicationsData || [];

        // Fetch recent medication events (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoISO = sevenDaysAgo.toISOString();

        const { data: eventsData, error: eventsError } = await supabase
          .from('med_events')
          .select('*')
          .eq('elder_id', elderId)
          .gte('event_date', sevenDaysAgoISO)
          .order('event_date', { ascending: false })
          .limit(20);

        if (eventsError) {
          throw new Error(`Events error: ${eventsError.message}`);
        }

        const recentEvents = eventsData || [];

        // Calculate today's stats
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const todayEvents = recentEvents.filter(
          (event) => event.event_date.startsWith(today)
        );

        const takenToday = todayEvents.filter((e) => e.status === 'taken').length;
        const missedToday = todayEvents.filter((e) => e.status === 'missed').length;
        const skippedToday = todayEvents.filter((e) => e.status === 'skipped').length;

        // Calculate adherence rate (last 7 days)
        // Adherence = (taken) / (taken + missed + skipped) * 100
        const totalEvents = recentEvents.length;
        const takenEvents = recentEvents.filter((e) => e.status === 'taken').length;
        const adherenceRate = totalEvents > 0 
          ? Math.round((takenEvents / totalEvents) * 100)
          : 100; // If no events, assume 100% (no meds to track)

        const stats: DashboardStats = {
          totalMedications: medications.length,
          adherenceRate,
          takenToday,
          missedToday,
          skippedToday,
        };

        setData({
          elder: profileData,
          medications,
          recentEvents,
          stats,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [elderId]);

  return { data, isLoading, error };
};
