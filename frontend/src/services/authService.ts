import api from './api';
import { ApiResponse, User } from '../types';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
  role: 'CANDIDATE' | 'RECRUITER';
  termsAccepted: boolean;
}

export interface AuthResponseData {
  token: string;
  tokenType: string;
  user: User;
}

export const authService = {
  login: async (params: LoginParams): Promise<AuthResponseData> => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login', params);
    return res.data.data;
  },

  register: async (params: RegisterParams): Promise<AuthResponseData> => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/register', params);
    return res.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post<ApiResponse<void>>('/auth/change-password', { currentPassword, newPassword });
  },

  logout: async (): Promise<void> => {
    try {
      await api.post<ApiResponse<void>>('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('careerconnect_token');
      localStorage.removeItem('careerconnect_user');
    }
  },
};
