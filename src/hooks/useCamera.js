// useCamera.js — getUserMedia, device enumeration, stream lifecycle
import { useEffect, useRef, useState, useCallback } from 'react';

export function useCamera(deviceId, resolution, flipH) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const [w, h] = resolution?.split('x').map(Number) || [640, 480];

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setReady(false);
  }, []);

  const startStream = useCallback(async () => {
    stopStream();
    setError(null);
    try {
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: w },
          height: { ideal: h },
          facingMode: deviceId ? undefined : 'user',
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.transform = flipH ? 'scaleX(-1)' : 'none';
        await videoRef.current.play();
        setReady(true);
      }
    } catch (err) {
      setError(err.message || 'Camera access denied');
    }
  }, [deviceId, w, h, flipH, stopStream]);

  // Enumerate devices
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then(devs => {
      setDevices(devs.filter(d => d.kind === 'videoinput'));
    }).catch(() => {});
  }, []);

  // Start camera on mount / when deviceId/resolution changes
  useEffect(() => {
    startStream();
    return stopStream;
  }, [startStream]);

  return { videoRef, devices, error, ready, restart: startStream };
}
