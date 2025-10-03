import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import useLocation from '../../hooks/useLocation';

const LocationInitializer = () => {
  const { refreshLocation } = useLocation();

  useEffect(() => {
    // Handle app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // App came to foreground
        refreshLocation();
      }
    });

    // Initial location request when component mounts
    refreshLocation();

    return () => {
      subscription.remove();
    };
  }, [refreshLocation]);

  return null; // This component doesn't render anything
};

export default LocationInitializer;