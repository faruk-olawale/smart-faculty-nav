export type BuildingType =
  | 'FACULTY' | 'DEPARTMENT' | 'LIBRARY' | 'HOSPITAL'
  | 'SPORTS_CENTER' | 'HOSTEL' | 'ADMIN' | 'CAFETERIA'
  | 'SECURITY' | 'PARKING' | 'LAB' | 'LECTURE_HALL' | 'OTHER';

export type TravelMode = 'foot' | 'bike' | 'car';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
