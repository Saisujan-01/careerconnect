import api from './api';
import { ApiResponse, CandidateDashboard, CandidateProfile, Job, JobApplication, PagedResponse } from '../types';

export interface ProfileFormData {
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  skills?: string;
  education?: string;
  experience?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export const candidateService = {
  getProfile: async (): Promise<CandidateProfile> => {
    const res = await api.get<ApiResponse<CandidateProfile>>('/candidate/profile');
    return res.data.data;
  },

  updateProfile: async (data: ProfileFormData): Promise<CandidateProfile> => {
    const res = await api.put<ApiResponse<CandidateProfile>>('/candidate/profile', data);
    return res.data.data;
  },

  uploadResume: async (file: File): Promise<CandidateProfile> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<CandidateProfile>>('/candidate/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  getDashboard: async (): Promise<CandidateDashboard> => {
    const res = await api.get<ApiResponse<CandidateDashboard>>('/candidate/dashboard');
    return res.data.data;
  },

  getApplications: async (page = 0, size = 10): Promise<PagedResponse<JobApplication>> => {
    const res = await api.get<ApiResponse<PagedResponse<JobApplication>>>('/candidate/applications', {
      params: { page, size },
    });
    return res.data.data;
  },

  withdrawApplication: async (id: number): Promise<void> => {
    await api.post<ApiResponse<void>>(`/candidate/applications/${id}/withdraw`);
  },

  getSavedJobs: async (page = 0, size = 10): Promise<PagedResponse<Job>> => {
    const res = await api.get<ApiResponse<PagedResponse<Job>>>('/candidate/saved-jobs', {
      params: { page, size },
    });
    return res.data.data;
  },

  saveJob: async (jobId: number): Promise<void> => {
    await api.post<ApiResponse<void>>(`/candidate/saved-jobs/${jobId}`);
  },

  unsaveJob: async (jobId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/candidate/saved-jobs/${jobId}`);
  },
};
