/**
 * ROOT GATEKEEPER COMPONENT
 * Phase 2: Role-Based Routing & Authentication
 * 
 * Handles authentication and role-based routing:
 * - Unauthenticated: Shows login page
 * - Authenticated Elder: Redirects to /elder
 * - Authenticated Caregiver: Redirects to /caregiver
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/schema';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

const RootGatekeeper = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devRole, setDevRole] = useState<'elder' | 'caregiver'>('elder');

  // Check if we're in development mode
  const isDevMode = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     import.meta.env.DEV;

  useEffect(() => {
    // DEV MODE: Skip authentication entirely
    if (isDevMode) {
      console.log('🔧 DEV MODE: Bypassing authentication');
      setDevMode(true);
      setIsLoading(false);
      return;
    }

    // PRODUCTION MODE: Check authentication
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check authentication state
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        // Handle missing session gracefully - this is normal when not logged in
        if (authError) {
          // Check if it's a "missing session" error (normal state)
          const isMissingSession = authError.message?.toLowerCase().includes('session') || 
                                  authError.message?.toLowerCase().includes('jwt') ||
                                  authError.message?.toLowerCase().includes('token');
          
          if (isMissingSession) {
            // No session is normal - just show login page
            setUser(null);
            setProfile(null);
            setIsLoading(false);
            return;
          }
          
          // Other auth errors are real problems
          throw new Error(`Authentication error: ${authError.message}`);
        }

        if (!authUser) {
          // No authenticated user - show login page
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        setUser(authUser);

        // Fetch user profile to determine role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          // Profile might not exist yet - that's okay, we'll show login
          console.warn('Profile not found:', profileError.message);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        setProfile(profileData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('RootGatekeeper error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        // Fetch profile again
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profileData) {
          setProfile(profileData);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDevMode]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-foreground text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8">
          <p className="text-foreground font-semibold mb-2">Authentication Error</p>
          <p className="text-foreground text-sm mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // DEV MODE: Show role selector and bypass auth
  if (devMode) {
    // Auto-redirect once role is selected
    if (devRole === 'elder') {
      return <Navigate to="/elder" replace />;
    }
    if (devRole === 'caregiver') {
      return <Navigate to="/caregiver" replace />;
    }
    
    // Show role selector
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 max-w-md w-full space-y-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Kind Home</h1>
          <p className="text-muted-foreground mb-8">
            Development Mode - Select your role:
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => setDevRole('elder')}
              size="lg"
              className="w-full shadow-realistic active:scale-95"
              variant={devRole === 'elder' ? 'default' : 'outline'}
            >
              Elder Mode
            </Button>
            <Button
              onClick={() => setDevRole('caregiver')}
              size="lg"
              className="w-full shadow-realistic active:scale-95"
              variant={devRole === 'caregiver' ? 'default' : 'outline'}
            >
              Caregiver Mode
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            🔧 Development mode - authentication bypassed
          </p>
        </div>
      </div>
    );
  }

  // Authenticated - redirect based on role
  if (user && profile) {
    if (profile.role === 'elder') {
      return <Navigate to="/elder" replace />;
    }
    if (profile.role === 'caregiver') {
      return <Navigate to="/caregiver" replace />;
    }
    // Role is null or unknown - show login
  }

  // Unauthenticated - show login page (PRODUCTION ONLY)
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-foreground mb-4">Kind Home</h1>
        <p className="text-muted-foreground mb-8">
          Please sign in to access your dashboard.
        </p>
        <p className="text-sm text-muted-foreground">
          Authentication required in production mode.
        </p>
      </div>
    </div>
  );
};

export default RootGatekeeper;
