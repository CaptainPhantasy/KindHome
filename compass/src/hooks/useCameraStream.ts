import { useState, useEffect, useRef, useCallback } from 'react';
import { CameraState } from '../../types';

export const useCameraStream = () => {
  const [cameraState, setCameraState] = useState<CameraState>(CameraState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  // Ref to hold the active stream so stopCamera doesn't need it as a dependency
  const activeStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = useCallback(async () => {
    setCameraState(CameraState.REQUESTING);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const track = stream.getVideoTracks()[0];
      const capabilities =
        (track as MediaStreamTrack & { getCapabilities?: () => MediaTrackCapabilities }).getCapabilities?.() || {};

      const focusModes = (capabilities as Partial<MediaTrackCapabilities> & { focusMode?: string[] }).focusMode;
      if (Array.isArray(focusModes) && focusModes.includes('continuous')) {
        try {
          await track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as unknown as MediaTrackConstraintSet] });
        } catch (focusErr) {
          console.log('Could not apply continuous focus:', focusErr);
        }
      }

      setActiveStream(stream);
      activeStreamRef.current = stream; // Update ref
      setCameraState(CameraState.ACTIVE);
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      console.error('Camera Access Error:', err);
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setCameraState(CameraState.DENIED);
      } else {
        setCameraState(CameraState.ERROR);
        setError(error?.message || 'Could not access camera');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    // Use the ref instead of state to avoid dependency cycle
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      activeStreamRef.current = null;
      setActiveStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState(CameraState.IDLE);
  }, []); // Dependencies removed!


  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    cameraState,
    activeStream,
    error,
    startCamera,
    stopCamera,
  };
};
