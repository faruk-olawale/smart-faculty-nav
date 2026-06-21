import { routeApi } from './api';
import type { RouteResult, TravelMode } from '../types';

const SPEEDS_MS: Record<TravelMode, number> = {
  foot: 5 / 3.6,
  bike: 15 / 3.6,
  car: 40 / 3.6,
};

export function getDuration(distanceMeters: number, mode: TravelMode): number {
  return distanceMeters / SPEEDS_MS[mode];
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 1) return '< 1 min';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

export function getRemainingDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getBearing(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x =
    Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

export function isOffRoute(
  userLat: number, userLng: number,
  routeCoords: number[][],
  thresholdMeters = 30
): boolean {
  let minDist = Infinity;
  for (const coord of routeCoords) {
    const dist = getRemainingDistance(userLat, userLng, coord[1], coord[0]);
    if (dist < minDist) minDist = dist;
  }
  return minDist > thresholdMeters;
}

export async function calculateRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  mode: TravelMode = 'foot'
): Promise<RouteResult> {
  // Always try real API first
  try {
    const res = await routeApi.calculate(
      startLat, startLng,
      endLat, endLng,
      mode
    );
    if (res.data) {
      console.log('✅ Real road route from OSRM');
      return res.data;
    }
  } catch (e) {
    console.warn('⚠️ OSRM failed, using straight line fallback:', e);
  }

  // Fallback straight line
  const dist = getRemainingDistance(startLat, startLng, endLat, endLng);
  const routeDist = dist * 1.3;
  const duration = getDuration(routeDist, mode);

  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;

  return {
    geometry: {
      type: 'LineString',
      coordinates: [
        [startLng, startLat],
        [startLng + (endLng - startLng) * 0.3, startLat + (endLat - startLat) * 0.4],
        [midLng, midLat],
        [startLng + (endLng - startLng) * 0.7, startLat + (endLat - startLat) * 0.6],
        [endLng, endLat],
      ],
    },
    distance: routeDist,
    duration,
    distanceText: formatDistance(routeDist),
    durationText: formatDuration(duration),
    steps: [
      {
        instruction: `Head towards ${mode === 'foot' ? 'destination on foot' : mode === 'bike' ? 'destination by bike' : 'destination by car'}`,
        distance: routeDist * 0.5,
        duration: getDuration(routeDist * 0.5, mode),
        name: '',
        maneuver: {
          type: 'depart',
          bearing_after: 0,
          bearing_before: 0,
          location: [startLng, startLat] as [number, number],
        },
      },
      {
        instruction: 'Continue straight ahead',
        distance: routeDist * 0.3,
        duration: getDuration(routeDist * 0.3, mode),
        name: '',
        maneuver: {
          type: 'continue',
          bearing_after: 0,
          bearing_before: 0,
          location: [midLng, midLat] as [number, number],
        },
      },
      {
        instruction: 'You have arrived at your destination',
        distance: routeDist * 0.2,
        duration: getDuration(routeDist * 0.2, mode),
        name: '',
        maneuver: {
          type: 'arrive',
          bearing_after: 0,
          bearing_before: 0,
          location: [endLng, endLat] as [number, number],
        },
      },
    ],
    mode,
  };
}
