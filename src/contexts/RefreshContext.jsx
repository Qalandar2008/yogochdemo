import { createContext, useContext, useState, useCallback, useRef } from 'react';

const RefreshContext = createContext(null);

export const RefreshProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const refreshCallbacks = useRef(new Set());

  // Register a callback to be called when refresh is triggered
  const registerRefresh = useCallback((callback) => {
    refreshCallbacks.current.add(callback);
    return () => refreshCallbacks.current.delete(callback);
  }, []);

  // Trigger refresh for all registered callbacks
  const triggerRefresh = useCallback((source = 'manual') => {
    console.log(`[Refresh] Triggered by: ${source}`);
    setRefreshTrigger(prev => prev + 1);
    setLastRefreshTime(Date.now());
    
    // Call all registered callbacks
    refreshCallbacks.current.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Refresh callback error:', error);
      }
    });
  }, []);

  const value = {
    refreshTrigger,
    lastRefreshTime,
    triggerRefresh,
    registerRefresh
  };

  return (
    <RefreshContext.Provider value={value}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within RefreshProvider');
  }
  return context;
};

export default RefreshContext;
