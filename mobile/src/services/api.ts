import axios from 'axios';
import { API_BASE_URL } from '../constants';
import type {
  Building, Faculty, Department,
  RouteResult, SearchResult, AIResponse, TravelMode
} from '../types';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

client.interceptors.response.use(
  (r) => r.data,
  (e) => Promise.reject(e.response?.data?.error || e.message)
);

type Res<T> = { success: boolean; data: T };

export const buildingApi = {
  getAll: (params?: Record<string, string>) =>
    client.get<never, Res<Building[]>>('/buildings', { params }),
  getById: (id: string) =>
    client.get<never, Res<Building>>(`/buildings/${id}`),
  getEmergency: () =>
    client.get<never, Res<Building[]>>('/buildings/emergency'),
};

export const facultyApi = {
  getAll: () =>
    client.get<never, Res<Faculty[]>>('/faculties'),
  getById: (id: string) =>
    client.get<never, Res<Faculty>>(`/faculties/${id}`),
};

export const departmentApi = {
  getAll: (facultyId?: string) =>
    client.get<never, Res<Department[]>>('/departments', {
      params: facultyId ? { facultyId } : {},
    }),
};

export const routeApi = {
  calculate: (
    startLat: number, startLng: number,
    endLat: number, endLng: number,
    mode: TravelMode = 'foot'
  ) =>
    client.post<never, Res<RouteResult>>('/route', {
      startLat, startLng, endLat, endLng, mode,
    }),
};

export const searchApi = {
  query: (q: string) =>
    client.get<never, Res<SearchResult[]>>('/search', { params: { q } }),
};

export const assistantApi = {
  query: (message: string, context?: { userLat?: number; userLng?: number }) =>
    client.post<never, Res<AIResponse>>('/assistant', { message, context }),
};

export const qrApi = {
  scan: (qrCode: string) =>
    client.post<never, Res<{ building: Building; userPosition: { lat: number; lng: number } }>>('/qr/scan', { qrCode }),
  generate: (qrLocationId: string) =>
    client.get<never, Res<{ qrDataUrl: string; qrLocation: any }>>(`/qr/${qrLocationId}/generate`),
};
