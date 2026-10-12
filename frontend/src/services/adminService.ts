import api from './api';
import { AdminDashboard, ApiResponse, AuditLog, Job, JobApplication, PagedResponse, UserDetail } from '../types';

export const adminService = {
  getDashboard: async (): Promise<AdminDashboard> => {
    const res = await api.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
    return res.data.data;
  },

  getUsers: async (role?: string, keyword?: string, page = 0, size = 10): Promise<PagedResponse<UserDetail>> => {
    const res = await api.get<ApiResponse<PagedResponse<UserDetail>>>('/admin/users', {
      params: { role, keyword, page, size },
    });
    return res.data.data;
  },

  updateUserStatus: async (userId: number, isActive: boolean, reason?: string): Promise<void> => {
    await api.patch<ApiResponse<void>>(`/admin/users/${userId}/status`, { isActive, reason });
  },

  getJobs: async (
    keyword?: string,
    status?: string,
    moderationStatus?: string,
    page = 0,
    size = 10
  ): Promise<PagedResponse<Job>> => {
    const res = await api.get<ApiResponse<PagedResponse<Job>>>('/admin/jobs', {
      params: { keyword, status, moderationStatus, page, size },
    });
    return res.data.data;
  },

  moderateJob: async (jobId: number, moderationStatus: string, moderationNotes?: string): Promise<Job> => {
    const res = await api.patch<ApiResponse<Job>>(`/admin/jobs/${jobId}/moderation`, {
      moderationStatus,
      moderationNotes,
    });
    return res.data.data;
  },

  getAllApplications: async (page = 0, size = 10): Promise<PagedResponse<JobApplication>> => {
    const res = await api.get<ApiResponse<PagedResponse<JobApplication>>>('/admin/applications', {
      params: { page, size },
    });
    return res.data.data;
  },

  getAuditLogs: async (action?: string, entityType?: string, page = 0, size = 15): Promise<PagedResponse<AuditLog>> => {
    const res = await api.get<ApiResponse<PagedResponse<AuditLog>>>('/admin/audit-logs', {
      params: { action, entityType, page, size },
    });
    return res.data.data;
  },
};
