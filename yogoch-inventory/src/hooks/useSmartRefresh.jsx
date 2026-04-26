import { useEffect, useCallback, useRef, useState } from 'react';
import { useRefresh } from '../contexts/RefreshContext';

export const useSmartRefresh = (callback, options = {}) => {
  const { 
    interval = 30000,           // Auto-refresh interval
    enabled = true,             // Enable/disable auto-refresh
    onVisibilityChange = true,  // Refresh when tab becomes visible
    onFocus = true,             // Refresh when window gets focus
    immediate = true,           // Run immediately on mount
    dependencyCheck = null,     // Additional dependencies to watch
    blockOnModal = false        // Block when modal is open
  } = options;

  const { refreshTrigger, registerRefresh } = useRefresh();
  const [isBlocked, setIsBlocked] = useState(false);
  
  const callbackRef = useRef(callback);
  const intervalRef = useRef(null);
  const isMounted = useRef(false);

  callbackRef.current = callback;

  // Execute the callback
  const execute = useCallback(async () => {
    if (isBlocked && blockOnModal) {
      console.log('[SmartRefresh] Blocked - modal is open');
      return;
    }
    
    try {
      await callbackRef.current();
    } catch (error) {
      console.error('[SmartRefresh] Execution error:', error);
    }
  }, [isBlocked, blockOnModal]);

  // Start interval
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (enabled && interval > 0) {
      intervalRef.current = setInterval(execute, interval);
    }
  }, [enabled, interval, execute]);

  // Stop interval
  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Block/unblock refreshing
  const block = useCallback(() => setIsBlocked(true), []);
  const unblock = useCallback(() => {
    setIsBlocked(false);
    // Refresh immediately after unblocking
    execute();
  }, [execute]);

  // Initial setup
  useEffect(() => {
    isMounted.current = true;
    
    if (immediate && isMounted.current) {
      execute();
    }
    
    startInterval();

    return () => {
      isMounted.current = false;
      stopInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to refreshTrigger changes (event-based refresh)
  useEffect(() => {
    if (refreshTrigger > 0) {
      execute();
    }
  }, [refreshTrigger, execute]);

  // React to dependency changes
  useEffect(() => {
    if (dependencyCheck !== null) {
      execute();
    }
  }, [dependencyCheck, execute]);

  // Visibility change
  useEffect(() => {
    if (!onVisibilityChange) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        execute();
        startInterval();
      } else {
        stopInterval();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onVisibilityChange, execute, startInterval, stopInterval]);

  // Window focus
  useEffect(() => {
    if (!onFocus) return;

    const handleFocus = () => {
      execute();
      startInterval();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [onFocus, execute, startInterval]);

  // Restart interval when enabled/interval changes
  useEffect(() => {
    if (enabled) {
      startInterval();
    } else {
      stopInterval();
    }
    
    return () => stopInterval();
  }, [enabled, interval, startInterval, stopInterval]);

  return { 
    refresh: execute, 
    startInterval, 
    stopInterval,
    block,
    unblock,
    isBlocked 
  };
};

export default useSmartRefresh;
