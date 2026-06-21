export type TravelMode = 'foot' | 'bike' | 'car';

export interface RouteRequest {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  mode: TravelMode;
}

export interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    bearing_after: number;
    bearing_before: number;
    location: [number, number];
  };
}

export interface RouteResponse {
  geometry: {
    type: string;
    coordinates: number[][];
  };
  distance: number;
  duration: number;
  distanceText: string;
  durationText: string;
  steps: RouteStep[];
  mode: TravelMode;
}

export interface SearchResult {
  id: string;
  name: string;
  type: 'building' | 'faculty' | 'department';
  subtitle?: string;
  latitude?: number;
  longitude?: number;
  buildingId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AIQueryRequest {
  message: string;
  context?: {
    userLat?: number;
    userLng?: number;
  };
}

export interface AIQueryResponse {
  reply: string;
  action?: {
    type: 'navigate' | 'show_building' | 'show_faculty' | 'emergency';
    targetId?: string;
    targetLat?: number;
    targetLng?: number;
    name?: string;
  };
  suggestions?: string[];
}
