import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  calculateRoute,
  getRemainingDistance,
  isOffRoute,
  formatDistance,
  formatDuration,
} from '../services/routeService';
import type { Building, RouteResult } from '../types';

export function useNavigation() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState<string>('');
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [hasArrived, setHasArrived] = useState(false);
  const offRouteCount = useRef(0);

  const {
    route, setRoute, clearRoute,
    routeStart, routeEnd,
    setRouteStart, setRouteEnd,
    travelMode, setTravelMode,
    userLocation,
    isCalculatingRoute, setIsCalculatingRoute,
  } = useAppStore();

  // Update remaining distance as user moves
  useEffect(() => {
    if (!userLocation || !routeEnd || !route) return;

    const dist = getRemainingDistance(
      userLocation.lat, userLocation.lng,
      routeEnd.lat, routeEnd.lng
    );

    setRemainingDistance(formatDistance(dist));

    // Check if arrived (within 15 metres)
    if (dist < 15) {
      setHasArrived(true);
      return;
    }

    // Estimate remaining time based on travel mode
    const speeds = { foot: 5/3.6, bike: 15/3.6, car: 40/3.6 };
    const speed = speeds[travelMode] || speeds.foot;
    setRemainingTime(formatDuration(dist / speed));

    // Check if off route
    if (isOffRoute(userLocation.lat, userLocation.lng, route.geometry.coordinates)) {
      offRouteCount.current += 1;
      if (offRouteCount.current >= 3) {
        offRouteCount.current = 0;
        recalculate();
      }
    } else {
      offRouteCount.current = 0;
    }

    // Advance step
    if (route.steps && currentStepIndex < route.steps.length - 1) {
      const nextStep = route.steps[currentStepIndex + 1];
      if (nextStep?.maneuver?.location) {
        const [lng, lat] = nextStep.maneuver.location;
        const distToNext = getRemainingDistance(
          userLocation.lat, userLocation.lng, lat, lng
        );
        if (distToNext < 20) {
          setCurrentStepIndex(prev => prev + 1);
        }
      }
    }
  }, [userLocation]);

  const startNavigation = useCallback(async (
    destination: Building,
    userLat: number,
    userLng: number
  ) => {
    setIsCalculating(true);
    setIsCalculatingRoute(true);
    setError(null);
    setHasArrived(false);
    setCurrentStepIndex(0);
    offRouteCount.current = 0;

    const start = { lat: userLat, lng: userLng, name: 'My Location' };
    const end = {
      lat: destination.latitude,
      lng: destination.longitude,
      name: destination.name,
    };

    setRouteStart(start);
    setRouteEnd(end);

    try {
      const result = await calculateRoute(
        userLat, userLng,
        destination.latitude, destination.longitude,
        travelMode
      );
      setRoute(result);
      setRemainingDistance(result.distanceText);
      setRemainingTime(result.durationText);
    } catch (e: any) {
      setError(e.message || 'Could not calculate route');
    } finally {
      setIsCalculating(false);
      setIsCalculatingRoute(false);
    }
  }, [travelMode]);

  const recalculate = useCallback(async () => {
    if (!userLocation || !routeEnd) return;
    try {
      const result = await calculateRoute(
        userLocation.lat, userLocation.lng,
        routeEnd.lat, routeEnd.lng,
        travelMode
      );
      setRoute(result);
      setCurrentStepIndex(0);
    } catch {}
  }, [userLocation, routeEnd, travelMode]);

  const stopNavigation = useCallback(() => {
    clearRoute();
    setCurrentStepIndex(0);
    setRemainingDistance('');
    setRemainingTime('');
    setHasArrived(false);
    setError(null);
    offRouteCount.current = 0;
  }, []);

  const currentStep = route?.steps?.[currentStepIndex] || null;

  return {
    isCalculating,
    error,
    currentStep,
    currentStepIndex,
    totalSteps: route?.steps?.length || 0,
    remainingDistance,
    remainingTime,
    hasArrived,
    travelMode,
    setTravelMode,
    startNavigation,
    stopNavigation,
    recalculate,
    route,
  };
}
