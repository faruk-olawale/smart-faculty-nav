import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calculate bearing between two GPS points (degrees 0-360)
export function calculateBearing(
  userLat: number, userLng: number,
  targetLat: number, targetLng: number
): number {
  const dLng = (targetLng - userLng) * Math.PI / 180;
  const lat1 = userLat * Math.PI / 180;
  const lat2 = targetLat * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

// Calculate distance in metres
export function calculateDistance(
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

// Format distance nicely
export function formatARDistance(metres: number): string {
  if (metres < 10) return 'You are here';
  if (metres < 1000) return `${Math.round(metres)}m`;
  return `${(metres / 1000).toFixed(1)}km`;
}

// Calculate relative bearing (how far left/right from where user faces)
export function getRelativeBearing(
  compassHeading: number,
  targetBearing: number
): number {
  let relative = targetBearing - compassHeading;
  if (relative > 180) relative -= 360;
  if (relative < -180) relative += 360;
  return relative;
}

// Convert relative bearing to screen X position
export function bearingToScreenX(relativeBearing: number): number {
  // Field of view ~60 degrees
  const FOV = 60;
  const normalized = relativeBearing / FOV;
  const x = SCREEN_WIDTH / 2 + normalized * SCREEN_WIDTH;
  return Math.max(-100, Math.min(SCREEN_WIDTH + 100, x));
}

// Get arrow direction label
export function getDirectionLabel(relativeBearing: number): string {
  if (relativeBearing > -15 && relativeBearing < 15) return '↑';
  if (relativeBearing >= 15 && relativeBearing < 60) return '↗';
  if (relativeBearing >= 60) return '→';
  if (relativeBearing <= -15 && relativeBearing > -60) return '↖';
  if (relativeBearing <= -60) return '←';
  return '↑';
}

// Is target visible in camera view?
export function isInView(relativeBearing: number): boolean {
  return Math.abs(relativeBearing) < 70;
}

export { SCREEN_WIDTH, SCREEN_HEIGHT };
