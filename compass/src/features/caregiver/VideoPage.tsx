/**
 * CAREGIVER VIDEO PAGE
 * Phase 3.3: Video Bridge - LiveKit Integration
 * 
 * Reads elderId from URL query parameter and connects to video room.
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { getToken } from '../../lib/video';
import { supabase } from '../../lib/supabase';
import { TintedCard } from '../../components/theme/TintedCard';
import { ArrowLeft } from 'lucide-react';

const VideoPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const elderId = searchParams.get('elder');
  
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;

  useEffect(() => {
    if (!elderId) {
      setError('No elder selected');
      setIsLoading(false);
      return;
    }

    if (!import.meta.env.VITE_LIVEKIT_URL) {
      setError('LiveKit URL not configured');
      setIsLoading(false);
      return;
    }

    const fetchToken = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Attempt to get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        // Use authenticated user if available, otherwise use dev identity
        const participantName = (user && !authError) 
          ? (user.email || user.id || 'caregiver')
          : 'Dev Caregiver';
        
        if (!user || authError) {
          console.log('DEV MODE: Using test caregiver identity');
        }
        
        const roomName = `video-${elderId}`;
        const fetchedToken = await getToken(roomName, participantName);
        setToken(fetchedToken);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize video';
        setError(errorMessage);
        console.error('Token fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [elderId]);

  // No elder selected
  if (!elderId) {
    return (
      <div className="space-y-4 p-6">
        <TintedCard variant="accent">
          <div className="text-center py-4">
            <p className="text-foreground font-semibold mb-2">No Elder Selected</p>
            <p className="text-foreground text-sm mb-4">
              Please select an elder to start a video call.
            </p>
            <button
              type="button"
              onClick={() => navigate('/caregiver')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-realistic active:scale-95"
            >
              <ArrowLeft size={16} />
              Select Elder
            </button>
          </div>
        </TintedCard>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-lg">Connecting to video room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <TintedCard variant="destructive">
          <div className="text-center">
            <p className="text-foreground font-semibold mb-2">Connection Error</p>
            <p className="text-foreground text-sm mb-4">{error || 'Failed to initialize video'}</p>
            <button
              type="button"
              onClick={() => navigate('/caregiver')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-realistic active:scale-95"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </TintedCard>
      </div>
    );
  }

  // Video room
  return (
    <div className="h-screen w-screen">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={livekitUrl}
        data-lk-theme="default"
        style={{ height: '100vh', width: '100vw' }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default VideoPage;

