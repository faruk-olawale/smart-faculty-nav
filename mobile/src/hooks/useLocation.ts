import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { useAppStore } from '../store/useAppStore';

export function useLocation() {
  const { setUserLocation, setIsTrackingLocation, isTrackingLocation } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Location permission denied');
      return false;
    }
    return true;
  }, []);

  const getCurrentLocation = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) return null;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const userLoc = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        heading: location.coords.heading ?? undefined,
        speed: location.coords.speed ?? undefined,
        timestamp: location.timestamp,
      };
      setUserLocation(userLoc);
      return userLoc;
    } catch (e) {
      setError('Could not get location');
      return null;
    }
  }, []);

  const startTracking = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) return;

    setIsTrackingLocation(true);
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (location) => {
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined,
          heading: location.coords.heading ?? undefined,
          speed: location.coords.speed ?? undefined,
          timestamp: location.timestamp,
        });
      }
    );
    setSubscription(sub);
  }, []);

  const stopTracking = useCallback(() => {
    subscription?.remove();
    setSubscription(null);
    setIsTrackingLocation(false);
  }, [subscription]);

  useEffect(() => {
    return () => { subscription?.remove(); };
  }, [subscription]);

  return {
    getCurrentLocation,
    startTracking,
    stopTracking,
    isTracking: isTrackingLocation,
    error,
  };
}
