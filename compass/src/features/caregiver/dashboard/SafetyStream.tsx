/**
 * SAFETY STREAM COMPONENT
 * Phase 2, Track B: Caregiver UI - Activity Feed
 * 
 * Displays a chronological feed of safety-related events:
 * - Medication events (taken/skipped/missed) with medication names
 * - Check-in logs (when implemented)
 * 
 * Shows events from the last 7 days, most recent first.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { TintedCard } from '../../../components/theme/TintedCard';
import { CheckCircle, XCircle, AlertCircle, Activity, Loader2 } from 'lucide-react';

interface SafetyEvent {
  id: string;
  type: 'medication' | 'checkin';
  timestamp: string;
  medicationName?: string;
  status?: 'taken' | 'skipped' | 'missed';
  message: string;
}

interface SafetyStreamProps {
  elderId: string;
}

const SafetyStream = ({ elderId }: SafetyStreamProps) => {
  const [events, setEvents] = useState<SafetyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSafetyEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch medication events from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      // Fetch med_events with medication names joined
      const { data: medEventsData, error: medEventsError } = await supabase
        .from('med_events')
        .select(`
          id,
          medication_id,
          elder_id,
          status,
          event_date,
          created_at,
          medications (
            id,
            name
          )
        `)
        .eq('elder_id', elderId)
        .gte('event_date', sevenDaysAgoISO)
        .order('event_date', { ascending: false })
        .limit(50);

      if (medEventsError) {
        throw new Error(`Failed to fetch medication events: ${medEventsError.message}`);
      }

      // Transform medication events into SafetyEvent format
      interface MedEventWithMedication {
        id: string;
        medication_id: string;
        elder_id: string;
        status: 'taken' | 'skipped' | 'missed';
        event_date: string;
        created_at: string;
        medications: { id: string; name: string }[] | null;
      }

      const safetyEvents: SafetyEvent[] = (medEventsData || []).map((event: MedEventWithMedication) => {
        const medication = Array.isArray(event.medications) && event.medications.length > 0 
          ? event.medications[0] 
          : null;
        const medicationName = medication?.name || 'Unknown Medication';
        
        const statusMessages = {
          taken: `took ${medicationName}`,
          skipped: `skipped ${medicationName}`,
          missed: `missed ${medicationName}`,
        };

        return {
          id: event.id,
          type: 'medication' as const,
          timestamp: event.event_date || event.created_at,
          medicationName,
          status: event.status,
          message: statusMessages[event.status] || `medication event: ${medicationName}`,
        };
      });

      // TODO: When check-in system is implemented, fetch check-in logs here
      // For now, we only show medication events

      // Sort by timestamp (most recent first)
      safetyEvents.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });

      setEvents(safetyEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('SafetyStream fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [elderId]);

  useEffect(() => {
    if (!elderId) {
      setIsLoading(false);
      return;
    }

    fetchSafetyEvents();
  }, [elderId, fetchSafetyEvents]);

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      // Less than 1 minute ago
      if (diffMins < 1) {
        return 'Just now';
      }

      // Less than 1 hour ago
      if (diffMins < 60) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      }

      // Less than 24 hours ago
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      }

      // More than 24 hours ago - show date and time
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) {
        return 'Yesterday';
      }
      if (diffDays < 7) {
        return `${diffDays} days ago`;
      }

      // Show full date for older events
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown time';
    }
  };

  const getEventIcon = (event: SafetyEvent) => {
    if (event.type === 'medication') {
      switch (event.status) {
        case 'taken':
          return CheckCircle;
        case 'skipped':
          return AlertCircle;
        case 'missed':
          return XCircle;
        default:
          return Activity;
      }
    }
    // Check-in events (when implemented)
    return CheckCircle;
  };

  const getEventVariant = (event: SafetyEvent): 'success' | 'warning' | 'destructive' | 'accent' => {
    if (event.type === 'medication') {
      switch (event.status) {
        case 'taken':
          return 'success';
        case 'skipped':
          return 'warning';
        case 'missed':
          return 'destructive';
        default:
          return 'accent';
      }
    }
    return 'success';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-foreground text-sm">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <TintedCard variant="destructive">
        <div className="text-center">
          <p className="text-foreground font-semibold mb-2">Error Loading Activity</p>
          <p className="text-foreground text-sm">{error}</p>
        </div>
      </TintedCard>
    );
  }

  if (events.length === 0) {
    return (
      <TintedCard variant="accent">
        <div className="text-center py-8">
          <Activity size={48} className="mx-auto mb-4 text-foreground opacity-60" />
          <p className="text-foreground font-semibold text-lg mb-2">No Recent Activity</p>
          <p className="text-foreground text-sm">
            Activity will appear here once medications are tracked or check-ins are recorded.
          </p>
        </div>
      </TintedCard>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Safety Stream</h2>
        <span className="text-sm text-muted-foreground">
          Last 7 days
        </span>
      </div>

      <div className="space-y-2">
        {events.map((event) => {
          const Icon = getEventIcon(event);
          const variant = getEventVariant(event);
          const timestamp = formatTimestamp(event.timestamp);

          return (
            <TintedCard key={event.id} variant={variant}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-background/50 rounded-lg">
                  <Icon size={20} className="text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium">
                    {event.message.charAt(0).toUpperCase() + event.message.slice(1)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{timestamp}</p>
                </div>
              </div>
            </TintedCard>
          );
        })}
      </div>
    </div>
  );
};

export default SafetyStream;
