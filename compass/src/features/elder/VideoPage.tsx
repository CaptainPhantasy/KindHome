/**
 * ELDER VIDEO PAGE
 * Phase 3.3: Video Bridge - LiveKit Integration (Elder-Friendly)
 * 
 * Custom elder-friendly video interface with huge touch targets.
 * Room name: video-{currentUserId}
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { LiveKitRoom, useLocalParticipant, useParticipants, VideoTrack, useTracks, useRoomContext } from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import { getToken } from '../../lib/video';
import { supabase } from '../../lib/supabase';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

/**
 * Elder-Friendly Video Controls Component
 * Renders inside LiveKitRoom context
 */
interface ElderVideoControlsProps {
  isDevMode: boolean;
}

const ElderVideoControlsWithRoom = ({ isDevMode }: ElderVideoControlsProps) => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const cameraTracks = useTracks([Track.Source.Camera]);

  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // Auto-answer: Listen for participants joining (incoming calls)
  useEffect(() => {
    if (!room) return;

    const handleParticipantConnected = () => {
      // Auto-answer: When someone joins, ensure we're ready
      // The room is already connected, so this is automatic
      console.log('Participant joined - call answered automatically');
    };

    const handleParticipantDisconnected = () => {
      console.log('Participant left');
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [room]);

  // Update mic/video state based on actual track state
  useEffect(() => {
    if (localParticipant) {
      const micPub = Array.from(localParticipant.audioTrackPublications.values())[0];
      const videoPub = Array.from(localParticipant.videoTrackPublications.values())[0];
      setIsMicEnabled(micPub?.isMuted === false);
      setIsVideoEnabled(videoPub?.isMuted === false);
    }
  }, [localParticipant]);

  const toggleMic = async () => {
    if (!localParticipant) return;
    
    const enabled = !isMicEnabled;
    await localParticipant.setMicrophoneEnabled(enabled);
    setIsMicEnabled(enabled);
  };

  const toggleVideo = async () => {
    if (!localParticipant) return;
    
    const enabled = !isVideoEnabled;
    await localParticipant.setCameraEnabled(enabled);
    setIsVideoEnabled(enabled);
  };

  const handleEndCall = () => {
    room?.disconnect();
    window.location.href = '/elder/today';
  };

  // Get remote participants (excluding self)
  const remoteParticipants = participants.filter((p) => p.identity !== localParticipant?.identity);

  // Get local video track
  const localVideoTrack = cameraTracks.find(
    (trackRef) => trackRef.participant.identity === localParticipant?.identity
  );

  return (
    <div className="h-screen w-screen bg-background flex flex-col" data-mode="elder">
      {/* DEV MODE Badge */}
      {isDevMode && (
        <div className="absolute top-4 left-4 z-50 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-card-depth border-2 border-accent-foreground" style={{ transform: 'translateZ(15px)' }}>
          <p className="text-lg font-bold">DEV MODE: Using Test Identity</p>
        </div>
      )}
      {/* Video Grid */}
      <div className="flex-1 p-4 grid gap-4" style={{ gridTemplateColumns: remoteParticipants.length === 0 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Local Video */}
        {localParticipant && (
          <div className="relative bg-card rounded-xl overflow-hidden border-2 border-primary shadow-card-depth" style={{ transform: 'translateZ(15px)' }}>
            {localVideoTrack && isVideoEnabled ? (
              <VideoTrack trackRef={localVideoTrack} />
            ) : (
              <div className="w-full h-full bg-card flex items-center justify-center min-h-[300px]">
                <VideoOff size={64} className="text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-primary/80 text-primary-foreground px-3 py-1 rounded-lg text-lg font-semibold">
              You
            </div>
          </div>
        )}

        {/* Remote Participants */}
        {remoteParticipants.map((participant) => {
          const remoteVideoTrack = cameraTracks.find(
            (trackRef) => trackRef.participant.identity === participant.identity
          );

          return (
            <div key={participant.identity} className="relative bg-card rounded-xl overflow-hidden border-2 border-secondary shadow-card-depth" style={{ transform: 'translateZ(15px)' }}>
              {remoteVideoTrack ? (
                <VideoTrack trackRef={remoteVideoTrack} />
              ) : (
                <div className="w-full h-full bg-card flex items-center justify-center min-h-[300px]">
                  <VideoOff size={64} className="text-muted-foreground" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-lg text-lg font-semibold">
                {participant.name || 'Caller'}
              </div>
            </div>
          );
        })}

        {/* Empty state when no remote participants */}
        {remoteParticipants.length === 0 && (
          <div className="flex items-center justify-center bg-card rounded-xl border-2 border-muted shadow-card-depth" style={{ transform: 'translateZ(15px)' }}>
            <div className="text-center p-8">
              <p className="text-2xl text-foreground font-semibold mb-2">Waiting for caller...</p>
              <p className="text-xl text-muted-foreground">Your video is ready</p>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="p-6 bg-card border-t-2 border-primary">
        <div className="flex justify-center gap-6">
          {/* Microphone Toggle */}
          <button
            type="button"
            onClick={toggleMic}
            className={`h-24 w-24 rounded-full flex items-center justify-center transition-all shadow-realistic active:scale-95 ${
              isMicEnabled
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-destructive text-destructive-foreground hover:opacity-90'
            }`}
            aria-label={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isMicEnabled ? <Mic size={48} /> : <MicOff size={48} />}
          </button>

          {/* Video Toggle */}
          <button
            type="button"
            onClick={toggleVideo}
            className={`h-24 w-24 rounded-full flex items-center justify-center transition-all shadow-realistic active:scale-95 ${
              isVideoEnabled
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-muted text-muted-foreground hover:opacity-90'
            }`}
            aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video size={48} /> : <VideoOff size={48} />}
          </button>

          {/* End Call */}
          <button
            type="button"
            onClick={handleEndCall}
            className="h-24 w-24 rounded-full flex items-center justify-center bg-destructive text-destructive-foreground hover:opacity-90 transition-all shadow-realistic active:scale-95"
            aria-label="End call"
          >
            <PhoneOff size={48} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Get or generate a dev user ID for testing
 */
const getDevUserId = (publicIdParam: string | null): string => {
  const STORAGE_KEY = 'kind_home_dev_elder_id';
  
  // Priority 1: URL parameter
  if (publicIdParam) {
    localStorage.setItem(STORAGE_KEY, publicIdParam);
    return publicIdParam;
  }
  
  // Priority 2: Existing localStorage value
  const storedId = localStorage.getItem(STORAGE_KEY);
  if (storedId) {
    return storedId;
  }
  
  // Priority 3: Generate new ID
  const newId = `dev-elder-${Math.random().toString(36).substring(2, 11)}`;
  localStorage.setItem(STORAGE_KEY, newId);
  return newId;
};

/**
 * Main Video Page Component
 */
const VideoPage = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);

  const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;
  const publicIdParam = searchParams.get('publicId');

  useEffect(() => {
    if (!import.meta.env.VITE_LIVEKIT_URL) {
      setError('Video service not configured');
      setIsLoading(false);
      return;
    }

    const initializeVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Attempt to get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        let currentUserId: string;
        let participantName: string;
        
        if (user && !authError) {
          // Production mode: Use authenticated user
          currentUserId = user.id;
          participantName = user.email || user.id;
          setIsDevMode(false);
        } else {
          // Development mode: Use dev identity
          currentUserId = getDevUserId(publicIdParam);
          participantName = `dev-elder-${currentUserId}`;
          setIsDevMode(true);
          console.log('DEV MODE: Using test identity', currentUserId);
        }

        // Generate room name and participant name
        const roomName = `video-${currentUserId}`;

        // Fetch token
        const fetchedToken = await getToken(roomName, participantName);
        setToken(fetchedToken);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize video';
        setError(errorMessage);
        console.error('Video initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicIdParam]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-mode="elder">
        <div className="text-center p-8">
          <p className="text-3xl text-foreground font-semibold mb-4">Connecting...</p>
          <p className="text-xl text-muted-foreground">Setting up your video call</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8" data-mode="elder">
        <div className="text-center max-w-md">
          <p className="text-3xl text-foreground font-semibold mb-4">Connection Error</p>
          <p className="text-xl text-muted-foreground mb-6">{error || 'Failed to initialize video'}</p>
          <a
            href="/elder/today"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-xl text-2xl font-semibold hover:opacity-90 transition-opacity"
          >
            Go Back
          </a>
        </div>
      </div>
    );
  }

  // Video room - Auto-answer: Connect immediately when token is ready
  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={livekitUrl}
      data-lk-theme="default"
      style={{ height: '100vh', width: '100vw' }}
      connectOptions={{
        autoSubscribe: true,
      }}
    >
      <ElderVideoControlsWithRoom isDevMode={isDevMode} />
    </LiveKitRoom>
  );
};

export default VideoPage;

