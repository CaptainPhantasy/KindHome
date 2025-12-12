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
import SafetyStream from './SafetyStream';
import { TintedCard } from '../../../components/theme/TintedCard';
import { SolidCard } from '../../../components/theme/SolidCard';
import { User, Pill, CheckCircle, XCircle, Activity } from 'lucide-react';

interface DashboardOverviewProps {
  elderId: string;
}

const DashboardOverview = ({ elderId }: DashboardOverviewProps) => {
  const { data, isLoading, error } = useElderDashboard(elderId);


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

  const { elder, stats } = data;

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

      {/* Safety Stream (Activity Feed) */}
      <SafetyStream elderId={elderId} />

      {/* Medication Scanner */}
      {/* Removed embedded scanner to avoid duplication with dedicated route */}
    </div>
  );
};

export default DashboardOverview;
