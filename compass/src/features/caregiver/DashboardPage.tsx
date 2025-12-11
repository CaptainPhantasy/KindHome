/**
 * CAREGIVER DASHBOARD PAGE
 * Phase 2, Track B: Caregiver UI - Dashboard Overview
 * 
 * Displays the dashboard for a selected elder.
 * Reads the `elder` query parameter from the URL.
 */

import { useSearchParams, useNavigate } from 'react-router';
import DashboardOverview from './dashboard/DashboardOverview';
import { TintedCard } from '../../components/theme/TintedCard';
import { ArrowLeft } from 'lucide-react';

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const elderId = searchParams.get('elder');

  // If no elder is selected, redirect to selector
  if (!elderId) {
    return (
      <div className="space-y-4">
        <TintedCard variant="accent">
          <div className="text-center py-4">
            <p className="text-foreground font-semibold mb-2">No Elder Selected</p>
            <p className="text-foreground text-sm mb-4">
              Please select an elder to view their dashboard.
            </p>
            <button
              onClick={() => navigate('/caregiver')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <ArrowLeft size={16} />
              Select Elder
            </button>
          </div>
        </TintedCard>
      </div>
    );
  }

  return <DashboardOverview elderId={elderId} />;
};

export default DashboardPage;

