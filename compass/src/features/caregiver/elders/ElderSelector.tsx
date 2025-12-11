/**
 * ELDER SELECTOR COMPONENT
 * Phase 2, Track B: Caregiver UI - Elder Selector
 * 
 * The "Bouncer" component that implements the "1 vs Many" logic:
 * - 0 Elders: Show "No elders linked" empty state
 * - 1 Elder: Automatically redirect to that Elder's dashboard
 * - >1 Elders: Render a list of cards for selection
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLinkedElders } from './useLinkedElders';
import { TintedCard } from '../../../components/theme/TintedCard';
import { SolidCard } from '../../../components/theme/SolidCard';
import { User } from 'lucide-react';

const ElderSelector = () => {
  const { elders, isLoading, error } = useLinkedElders();
  const navigate = useNavigate();

  // Auto-redirect if exactly 1 elder
  useEffect(() => {
    if (!isLoading && elders.length === 1) {
      navigate(`/caregiver/dashboard?elder=${elders[0].id}`, { replace: true });
    }
  }, [elders, isLoading, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-lg">Loading elders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <TintedCard variant="destructive">
          <div className="text-center">
            <p className="text-foreground font-semibold mb-2">Error Loading Elders</p>
            <p className="text-foreground text-sm">{error.message}</p>
          </div>
        </TintedCard>
      </div>
    );
  }

  // 0 Elders: Empty state
  if (elders.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <TintedCard variant="accent" className="max-w-md w-full">
          <div className="text-center">
            <User size={48} className="mx-auto mb-4 text-foreground opacity-60" />
            <p className="text-foreground font-semibold text-xl mb-2">No Elders Linked</p>
            <p className="text-foreground text-sm">
              You don't have any elders linked to your account yet.
              Please contact support to set up family links.
            </p>
          </div>
        </TintedCard>
      </div>
    );
  }

  // >1 Elders: Selection list
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Who are you caring for?</h1>
        <p className="text-muted-foreground mb-8">
          Select an elder to view their dashboard and manage their care.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {elders.map((elder) => (
            <button
              key={elder.id}
              onClick={() => navigate(`/caregiver/dashboard?elder=${elder.id}`)}
              className="text-left transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
            >
              <SolidCard variant="primary" className="h-full cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  {elder.avatar_url ? (
                    <img
                      src={elder.avatar_url}
                      alt={elder.full_name || 'Elder'}
                      className="w-16 h-16 rounded-full mb-3 object-cover border-2 border-primary-foreground/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full mb-3 bg-primary-foreground/20 flex items-center justify-center">
                      <User size={32} className="text-primary-foreground opacity-60" />
                    </div>
                  )}
                  <h2 className="text-xl font-semibold text-primary-foreground mb-1">
                    {elder.full_name || 'Unnamed Elder'}
                  </h2>
                  <p className="text-sm text-primary-foreground opacity-80">
                    View Dashboard →
                  </p>
                </div>
              </SolidCard>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElderSelector;
