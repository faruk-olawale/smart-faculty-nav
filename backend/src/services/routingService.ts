import axios from 'axios';
import { TravelMode, RouteRequest, RouteResponse, RouteStep } from '../types';

const OSRM_BASE = process.env.OSRM_API_URL || 'https://router.project-osrm.org';

const PROFILES: Record<TravelMode, string> = {
  foot: 'foot',
  bike: 'bike',
  car: 'car',
};

const SPEEDS_MS: Record<TravelMode, number> = {
  foot: 5 / 3.6,
  bike: 15 / 3.6,
  car: 40 / 3.6,
};

export function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export function formatDuration(s: number): string {
  const mins = Math.round(s / 60);
  if (mins < 1) return '< 1 min';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

function buildInstruction(step: any): string {
  const type: string = step.maneuver?.type || '';
  const mod: string = step.maneuver?.modifier || '';
  const road = step.name ? `onto ${step.name}` : '';
  const dist = formatDistance(step.distance);

  const map: Record<string, string> = {
    depart: `Head ${mod} ${road}`,
    arrive: 'You have arrived at your destination',
    turn: `Turn ${mod} ${road}`,
    'new name': `Continue ${road}`,
    continue: `Continue straight ${road}`,
    merge: `Merge ${mod} ${road}`,
    roundabout: `Enter the roundabout`,
    fork: `Take the ${mod} fork ${road}`,
    'end of road': `Turn ${mod} at the end of road`,
  };

  return `${(map[type] || `Continue ${road}`).trim()} (${dist})`;
}

export async function calculateRoute(req: RouteRequest): Promise<RouteResponse> {
  const { startLat, startLng, endLat, endLng, mode } = req;
  const profile = PROFILES[mode];

  const url = `${OSRM_BASE}/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}`;

  try {
    const { data } = await axios.get(url, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: true,
        annotations: false,
      },
      timeout: 15000,
    });

    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error('No route found');
    }

    const route = data.routes[0];

    // Use mode-specific speed for duration
    const duration = route.distance / SPEEDS_MS[mode];

    const steps: RouteStep[] = route.legs.flatMap((leg: any) =>
      (leg.steps || []).map((s: any) => ({
        distance: s.distance,
        duration: s.distance / SPEEDS_MS[mode],
        instruction: buildInstruction(s),
        name: s.name || '',
        maneuver: {
          type: s.maneuver?.type || 'straight',
          modifier: s.maneuver?.modifier,
          bearing_after: s.maneuver?.bearing_after || 0,
          bearing_before: s.maneuver?.bearing_before || 0,
          location: s.maneuver?.location || [0, 0],
        },
      }))
    );

    return {
      geometry: route.geometry,
      distance: route.distance,
      duration,
      distanceText: formatDistance(route.distance),
      durationText: formatDuration(duration),
      steps,
      mode,
    };
  } catch (error: any) {
    console.error('OSRM error:', error.message);
    throw new Error(
      'Could not calculate road route. Check your internet connection.'
    );
  }
}
