export type BuildingType =
  | 'FACULTY' | 'DEPARTMENT' | 'LIBRARY' | 'HOSPITAL'
  | 'SPORTS_CENTER' | 'HOSTEL' | 'ADMIN' | 'CAFETERIA'
  | 'SECURITY' | 'PARKING' | 'LAB' | 'LECTURE_HALL' | 'OTHER';

export type TravelMode = 'foot' | 'bike' | 'car';

export interface Faculty {
  id: string;
  name: string;
  code: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  dean?: string;
  email?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  departments?: Department[];
  buildings?: Building[];
}

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  facultyId: string;
  buildingId?: string;
  hod?: string;
  email?: string;
  phone?: string;
  floor?: number;
  roomNumber?: string;
  faculty?: Faculty;
  building?: Building;
}

export interface Building {
  id: string;
  name: string;
  shortName?: string;
  type: BuildingType;
  description?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  address?: string;
  openingHours?: string;
  phone?: string;
  email?: string;
  floor?: number;
  isEmergency: boolean;
  isAccessible: boolean;
  facultyId?: string;
  faculty?: Faculty;
  departments?: Department[];
  qrLocations?: QRLocation[];
}

export interface QRLocation {
  id: string;
  buildingId: string;
  label: string;
  qrCode: string;
  latitude: number;
  longitude: number;
  description?: string;
  isActive: boolean;
  scanCount: number;
  building?: Building;
}

export interface RouteResult {
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

export interface SearchResult {
  id: string;
  name: string;
  type: 'building' | 'faculty' | 'department';
  subtitle?: string;
  latitude?: number;
  longitude?: number;
  buildingId?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface AIResponse {
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
