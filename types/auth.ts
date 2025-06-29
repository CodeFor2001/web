export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'user';
  restaurantId?: string;
  restaurantName?: string;
  subscriptionType?: 'sensor-based' | 'non-sensor-based';
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  adminId?: string;
  adminEmail?: string;
  subscriptionType: 'sensor-based' | 'non-sensor-based';
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}