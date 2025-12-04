import { createContext, useState, useContext, type ReactNode } from 'react';
import api from '../api/axios';
import { AxiosError } from 'axios';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  confimpassword: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (userData: SignupData) => Promise<AuthResponse>;
  login: (credentials: LoginData) => Promise<AuthResponse>;
  logout: () => Promise<{ success: boolean }>;
  checkAuth: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  const checkAuth = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      setUser(response.data.user);
      console.log('✅ User authenticated:', response.data.user);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status !== 401) {
        console.error('❌ Auth check failed:', axiosError);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<AuthResponse> => {
    try {
      console.log('📤 Signup request:', { ...userData, password: '[REDACTED]' });
      const response = await api.post<{ message: string; user: User }>('/auth/signup', userData);
      setUser(response.data.user);
      console.log('✅ Signup successful:', response.data.user);
      return { 
        success: true, 
        message: response.data.message,
        user: response.data.user 
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error('❌ Signup failed:', axiosError.response?.data);
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const login = async (credentials: LoginData): Promise<AuthResponse> => {
    try {
      console.log('📤 Login request for:', credentials.email);
      const response = await api.post<{ message: string; user: User }>('/auth/login', credentials);
      setUser(response.data.user);
      console.log('✅ Login successful:', response.data.user);
      return { 
        success: true, 
        message: response.data.message,
        user: response.data.user 
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error('❌ Login failed:', axiosError.response?.data);
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async (): Promise<{ success: boolean }> => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout failed:', error);
      return { success: false };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signup,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};