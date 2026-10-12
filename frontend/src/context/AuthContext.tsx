import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService, LoginParams, RegisterParams } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isCandidate: boolean;
  isRecruiter: boolean;
  isAdmin: boolean;
  login: (params: LoginParams) => Promise<User>;
  register: (params: RegisterParams) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('careerconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('careerconnect_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('careerconnect_token');
      if (storedToken) {
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('careerconnect_user', JSON.stringify(freshUser));
        } catch {
          // Token invalid or expired
          localStorage.removeItem('careerconnect_token');
          localStorage.removeItem('careerconnect_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (params: LoginParams): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await authService.login(params);
      localStorage.setItem('careerconnect_token', data.token);
      localStorage.setItem('careerconnect_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.fullName}!`);
      return data.user;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: RegisterParams): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await authService.register(params);
      localStorage.setItem('careerconnect_token', data.token);
      localStorage.setItem('careerconnect_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      toast.success('Registration successful! Welcome to CareerConnect.');
      return data.user;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    toast.success('Signed out safely.');
  };

  const refreshUser = async () => {
    try {
      const fresh = await authService.getCurrentUser();
      setUser(fresh);
      localStorage.setItem('careerconnect_user', JSON.stringify(fresh));
    } catch {
      // Ignored
    }
  };

  const isCandidate = user?.role === 'CANDIDATE';
  const isRecruiter = user?.role === 'RECRUITER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isCandidate,
        isRecruiter,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
