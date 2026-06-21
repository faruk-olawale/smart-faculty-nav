import { create } from 'zustand';
import type {
  Building, Faculty, RouteResult,
  SearchResult, UserLocation, TravelMode, AIResponse
} from '../types';

type AppMode = 'map' | 'navigate' | 'ar' | 'qr' | 'assistant' | 'search';

interface AppState {
  // Mode
  mode: AppMode;
  setMode: (m: AppMode) => void;

  // Data
  buildings: Building[];
  faculties: Faculty[];
  setBuildings: (b: Building[]) => void;
  setFaculties: (f: Faculty[]) => void;

  // Selected building
  selectedBuilding: Building | null;
  setSelectedBuilding: (b: Building | null) => void;

  // Navigation
  route: RouteResult | null;
  travelMode: TravelMode;
  routeStart: { lat: number; lng: number; name: string } | null;
  routeEnd: { lat: number; lng: number; name: string } | null;
  isCalculatingRoute: boolean;
  setRoute: (r: RouteResult | null) => void;
  setTravelMode: (m: TravelMode) => void;
  setRouteStart: (s: { lat: number; lng: number; name: string } | null) => void;
  setRouteEnd: (e: { lat: number; lng: number; name: string } | null) => void;
  setIsCalculatingRoute: (v: boolean) => void;
  clearRoute: () => void;

  // User location
  userLocation: UserLocation | null;
  isTrackingLocation: boolean;
  setUserLocation: (loc: UserLocation | null) => void;
  setIsTrackingLocation: (v: boolean) => void;

  // Search
  searchResults: SearchResult[];
  searchQuery: string;
  recentSearches: SearchResult[];
  setSearchResults: (r: SearchResult[]) => void;
  setSearchQuery: (q: string) => void;
  addRecentSearch: (r: SearchResult) => void;

  // AI
  aiHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    response?: AIResponse;
  }>;
  addAiMessage: (
    role: 'user' | 'assistant',
    content: string,
    response?: AIResponse
  ) => void;
  clearAiHistory: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: 'map',
  setMode: (mode) => set({ mode }),

  buildings: [],
  faculties: [],
  setBuildings: (buildings) => set({ buildings }),
  setFaculties: (faculties) => set({ faculties }),

  selectedBuilding: null,
  setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),

  route: null,
  travelMode: 'foot',
  routeStart: null,
  routeEnd: null,
  isCalculatingRoute: false,
  setRoute: (route) => set({ route }),
  setTravelMode: (travelMode) => set({ travelMode }),
  setRouteStart: (routeStart) => set({ routeStart }),
  setRouteEnd: (routeEnd) => set({ routeEnd }),
  setIsCalculatingRoute: (isCalculatingRoute) => set({ isCalculatingRoute }),
  clearRoute: () => set({ route: null, routeStart: null, routeEnd: null }),

  userLocation: null,
  isTrackingLocation: false,
  setUserLocation: (userLocation) => set({ userLocation }),
  setIsTrackingLocation: (isTrackingLocation) => set({ isTrackingLocation }),

  searchResults: [],
  searchQuery: '',
  recentSearches: [],
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  addRecentSearch: (result) => {
    const current = get().recentSearches;
    const filtered = current.filter((r) => r.id !== result.id);
    set({ recentSearches: [result, ...filtered].slice(0, 5) });
  },

  aiHistory: [],
  addAiMessage: (role, content, response) =>
    set((s) => ({
      aiHistory: [...s.aiHistory, { role, content, response }],
    })),
  clearAiHistory: () => set({ aiHistory: [] }),
}));
