import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { getRemainingDistance, formatDistance } from '../services/routeService';

export function useGPSTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingDistance, setRemainingDistance] = useState<string | null>(null);
  const [hasArrived, setHasArrived] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const {
    setUserLocation,
    userLocation,
    routeEnd,
    setIsTrackingLocation,
  } = useAppStore();

  // Update remaining distance when user moves
  useEffect(() => {
    if (!userLocation || !routeEnd) {
      setRemainingDistance(null);
      setHasArrived(false);
      return;
    }
    const dist = getRemainingDistance(
      userLocation.lat, userLocation.lng,
      routeEnd.lat, routeEnd.lng
    );
    setRemainingDistance(formatDistance(dist));
    setHasArrived(dist < 15);
  }, [userLocation, routeEnd]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      // Check current permission status first
      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync();

      if (existingStatus === 'granted') {
        setPermissionGranted(true);
        return true;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        setPermissionGranted(true);
        return true;
      }

      // Permission denied
      setError('Location permission denied');
      Alert.alert(
        'Location Permission Required',
        'Please allow location access in your phone Settings to use navigation.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => Location.requestForegroundPermissionsAsync(),
          },
        ]
      );
      return false;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  }, []);

  const startTracking = useCallback(async () => {
    setError(null);

    const granted = await requestPermissions();
    if (!granted) return;

    try {
      setIsTracking(true);
      setIsTrackingLocation(true);

      // Get current position immediately
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const loc = {
        lat: initial.coords.latitude,
        lng: initial.coords.longitude,
        accuracy: initial.coords.accuracy ?? undefined,
        heading: initial.coords.heading ?? undefined,
        speed: initial.coords.speed ?? undefined,
        timestamp: initial.timestamp,
      };

      setUserLocation(loc);
      setAccuracy(initial.coords.accuracy);
      setHeading(initial.coords.heading);

      // Start watching
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (location) => {
          const updated = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy ?? undefined,
            heading: location.coords.heading ?? undefined,
            speed: location.coords.speed ?? undefined,
            timestamp: location.timestamp,
          };
          setUserLocation(updated);
          setAccuracy(location.coords.accuracy);
          setSpeed(location.coords.speed);
          setHeading(location.coords.heading);
        }
      );
    } catch (e: any) {
      console.error('GPS error:', e);
      setError('GPS unavailable. Check that location is enabled on your phone.');
      setIsTracking(false);
      setIsTrackingLocation(false);

      // Use demo location at ICT faculty for testing
      Alert.alert(
        'GPS Unavailable',
        'Using demo location at ICT Faculty for testing.',
        [
          {
            text: 'Use Demo Location',
            onPress: () => {
              const demoLoc = {
                lat: 8.723479 + (Math.random() - 0.5) * 0.0002,
                lng: 4.482587 + (Math.random() - 0.5) * 0.0002,
                accuracy: 10,
                timestamp: Date.now(),
              };
              setUserLocation(demoLoc);
              setIsTracking(true);
              setIsTrackingLocation(true);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  }, []);

  const stopTracking = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setIsTracking(false);
    setIsTrackingLocation(false);
    setAccuracy(null);
    setSpeed(null);
    setHeading(null);
  }, []);

  const getOnce = useCallback(async () => {
    const granted = await requestPermissions();
    if (!granted) return null;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const loc = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        heading: location.coords.heading ?? undefined,
        speed: location.coords.speed ?? undefined,
        timestamp: location.timestamp,
      };
      setUserLocation(loc);
      return loc;
    } catch (e: any) {
      console.error('getOnce error:', e);

      // Demo fallback
      const demoLoc = {
        lat: 8.723479,
        lng: 4.482587,
        accuracy: 15,
        timestamp: Date.now(),
      };
      setUserLocation(demoLoc);
      return demoLoc;
    }
  }, []);

  useEffect(() => {
    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  const speedKmh = speed != null && speed > 0
    ? `${(speed * 3.6).toFixed(1)} km/h`
    : null;

  const accuracyLabel = accuracy != null
    ? accuracy < 5 ? '🟢 Excellent'
      : accuracy < 10 ? '🟡 Good'
      : accuracy < 20 ? '🟠 Fair'
      : '🔴 Poor'
    : null;

  return {
    isTracking,
    permissionGranted,
    error,
    accuracy,
    accuracyLabel,
    speed: speedKmh,
    heading,
    remainingDistance,
    hasArrived,
    startTracking,
    stopTracking,
    getOnce,
  };
}
