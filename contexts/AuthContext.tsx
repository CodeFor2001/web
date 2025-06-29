import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginCredentials, LoginResponse } from '../types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for development
const mockUsers = [
  {
    id: '1',
    email: 'superadmin@vigilix.tech',
    password: 'Vigilix@123',
    name: 'Super Admin',
    role: 'superadmin' as const,
  },
  {
    id: '2',
    email: 'admin@vigilix.tech',
    password: 'Vigilix@123',
    name: 'Restaurant Admin',
    role: 'admin' as const,
    restaurantId: 'rest1',
    restaurantName: 'Demo Restaurant',
    subscriptionType: 'sensor-based' as const,
  },
  {
    id: '3',
    email: 'user@vigilix.tech',
    password: 'Vigilix@123',
    name: 'Restaurant User',
    role: 'user' as const,
    restaurantId: 'rest1',
    restaurantName: 'Demo Restaurant',
    subscriptionType: 'sensor-based' as const,
  },
  {
    id: '4',
    email: 'admin-nonsensor@vigilix.tech',
    password: 'Vigilix@123',
    name: 'Non-Sensor Admin',
    role: 'admin' as const,
    restaurantId: 'rest2',
    restaurantName: 'Non-Sensor Restaurant',
    subscriptionType: 'non-sensor-based' as const,
  },
  {
    id: '5',
    email: 'user-nonsensor@vigilix.tech',
    password: 'Vigilix@123',
    name: 'Non-Sensor User',
    role: 'user' as const,
    restaurantId: 'rest2',
    restaurantName: 'Non-Sensor Restaurant',
    subscriptionType: 'non-sensor-based' as const,
  }
];

const getStorageItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await AsyncStorage.getItem(key);
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

const removeStorageItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await getStorageItem('auth_token');
      const userStr = await getStorageItem('auth_user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      // Mock API call - replace with real API
      const mockUser = mockUsers.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (!mockUser) {
        throw new Error('Invalid credentials');
      }

      const { password, ...user } = mockUser;
      const token = `mock_jwt_token_${user.id}_${Date.now()}`;

      const response: LoginResponse = { user, token };

      await setStorageItem('auth_token', token);
      await setStorageItem('auth_user', JSON.stringify(user));

      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await removeStorageItem('auth_token');
      await removeStorageItem('auth_user');
      
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshToken = async () => {
    // Mock refresh token logic
    console.log('Refreshing token...');
  };

  const getToken = () => {
    return authState.token;
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshToken,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}