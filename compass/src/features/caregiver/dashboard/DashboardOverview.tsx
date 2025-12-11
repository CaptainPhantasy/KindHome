/**
 * DASHBOARD OVERVIEW COMPONENT
 * Phase 2, Track B: Caregiver UI - Dashboard Overview
 * 
 * Displays high-level status of linked Elder:
 * - Elder profile header
 * - Medication adherence metrics
 * - Today's medication status
 * - Recent activity
 */

import { useElderDashboard } from './useElderDashboard';
import { TintedCard } from '../../../components/theme/TintedCard';
import { SolidCard } from '../../../components/theme/SolidCard';
import { User, Pill, CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';
import { MedicationScanner } from '../../../components/MedicationScanner';
import { supabase } from '../../../lib/supabase';
import type { MedicationData } from '../../../../types';
import { ScannerMode } from '../../../../types';

interface DashboardOverviewProps {
  elderId: string;
}

const DashboardOverview = ({ elderId }: DashboardOverviewProps) => {
  const { data, isLoading, error } = useElderDashboard(elderId);

  const frequencyToCron = (frequency: string): string => {
    const normalized = frequency.toLowerCase();
    if (normalized.includes('twice')) return '0 9,21 * * *';
    if (normalized.includes('every 8')) return '0 */8 * * *';
    if (normalized.includes('evening')) return '0 21 * * *';
    if (normalized.includes('morning')) return '0 9 * * *';
    if (normalized.includes('as needed')) return '0 9 * * *';
    return '0 9 * * *'; // default once daily 9 AM
  };

  const handleSaveMedication = async (med: MedicationData) => {
    try {
      const cron = frequencyToCron(med.frequency || '');
      const newMedication = {
        name: med.medication_name,
        dosage: med.dosage,
        elder_id: elderId,
        schedule_cron: cron,
      };

      const { error: insertError } = await supabase.from('medications').insert([newMedication]);
      if (insertError) {
        throw new Error(insertError.message);
      }

      // Simple refresh to reflect new data
      window.location.reload();
    } catch (err) {
      console.error('Save medication failed:', err);
      alert('Could not save medication. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <TintedCard variant="destructive">
        <div className="text-center">
          <p className="text-foreground font-semibold mb-2">Error Loading Dashboard</p>
          <p className="text-foreground text-sm">{error.message}</p>
        </div>
      </TintedCard>
    );
  }

  if (!data || !data.elder) {
    return (
      <TintedCard variant="accent">
        <p className="text-foreground">No elder data found.</p>
      </TintedCard>
    );
  }

  const { elder, stats, recentEvents } = data;

  // Determine adherence status color
  const getAdherenceVariant = (rate: number): 'accent' | 'success' | 'warning' | 'destructive' => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'accent';
    if (rate >= 50) return 'warning';
    return 'destructive';
  };

  const adherenceVariant = getAdherenceVariant(stats.adherenceRate);

  return (
    <div className="space-y-6">
      {/* Elder Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-border">
        {elder.avatar_url ? (
          <img
            src={elder.avatar_url}
            alt={elder.full_name || 'Elder'}
            className="w-16 h-16 rounded-full object-cover border-2 border-border"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
            <User size={32} className="text-muted-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {elder.full_name || 'Unnamed Elder'}
          </h1>
          <p className="text-muted-foreground">Care Dashboard</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Adherence Rate */}
        <SolidCard variant={adherenceVariant}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Adherence Rate</span>
            <Activity size={20} className="opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.adherenceRate}%</div>
          <p className="text-xs opacity-80">Last 7 days</p>
        </SolidCard>

        {/* Total Medications */}
        <SolidCard variant="primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Total Medications</span>
            <Pill size={20} className="opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalMedications}</div>
          <p className="text-xs opacity-80">Active prescriptions</p>
        </SolidCard>

        {/* Taken Today */}
        <SolidCard variant="success">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Taken Today</span>
            <CheckCircle size={20} className="opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.takenToday}</div>
          <p className="text-xs opacity-80">Medications taken</p>
        </SolidCard>

        {/* Missed Today */}
        {stats.missedToday > 0 ? (
          <SolidCard variant="destructive">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Missed Today</span>
              <XCircle size={20} className="opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.missedToday}</div>
            <p className="text-xs opacity-80">Requires attention</p>
          </SolidCard>
        ) : (
          <SolidCard variant="accent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Status</span>
              <CheckCircle size={20} className="opacity-80" />
            </div>
            <div className="text-2xl font-bold mb-1">All Clear</div>
            <p className="text-xs opacity-80">No missed medications</p>
          </SolidCard>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
        {recentEvents.length === 0 ? (
          <TintedCard variant="accent">
            <p className="text-foreground text-center py-4">
              No recent medication events. Activity will appear here once medications are tracked.
            </p>
          </TintedCard>
        ) : (
          <div className="space-y-2">
            {recentEvents.slice(0, 10).map((event) => {
              const eventDate = new Date(event.event_date);
              const dateStr = eventDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              });

              const statusConfig = {
                taken: { icon: CheckCircle, variant: 'success' as const, label: 'Taken' },
                skipped: { icon: AlertCircle, variant: 'warning' as const, label: 'Skipped' },
                missed: { icon: XCircle, variant: 'destructive' as const, label: 'Missed' },
              };

              const config = statusConfig[event.status];
              const Icon = config.icon;

              return (
                <TintedCard key={event.id} variant={config.variant}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="text-foreground" />
                      <div>
                        <p className="text-foreground font-medium">{config.label}</p>
                        <p className="text-foreground text-sm opacity-70">{dateStr}</p>
                      </div>
                    </div>
                  </div>
                </TintedCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Medication Scanner */}
      <div className="max-w-md mx-auto mt-10">
        <MedicationScanner onSave={handleSaveMedication} lockMode defaultMode={ScannerMode.MEDICATION} />
      </div>
    </div>
  );
};

export default DashboardOverview;
