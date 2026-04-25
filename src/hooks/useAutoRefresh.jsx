import { useEffect, useCallback, useRef } from 'react';

export const useAutoRefresh = (callback, interval = 30000, options = {}) => {
  const { 
    enabled = true, 
    onVisibilityChange = true,
    onFocus = true 
  } = options;
  
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  const intervalRef = useRef(null);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, interval);
  }, [interval]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initial start and cleanup
  useEffect(() => {
    if (!enabled) return;
    
    startInterval();
    return () => stopInterval();
  }, [enabled, startInterval, stopInterval]);

  // Refresh when tab becomes visible
  useEffect(() => {
    if (!enabled || !onVisibilityChange) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        callbackRef.current();
        startInterval();
      } else {
        stopInterval();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, onVisibilityChange, startInterval, stopInterval]);

  // Refresh when window gets focus
  useEffect(() => {
    if (!enabled || !onFocus) return;

    const handleFocus = () => {
      callbackRef.current();
      startInterval();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, onFocus, startInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    callbackRef.current();
  }, []);

  return { refresh, startInterval, stopInterval };
};

export default useAutoRefresh;
