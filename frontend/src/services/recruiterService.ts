import api from './api';
import { ApiResponse, Job, JobApplication, PagedResponse, RecruiterDashboard, RecruiterProfile } from '../types';

export interface RecruiterProfileFormData {
  phone?: string;
  title?: string;
  department?: string;
  companyName?: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyIndustry?: string;
  companyLocation?: string;
  companyLogoUrl?: string;
}

export const recruiterService = {
  getProfile: async (): Promise<RecruiterProfile> => {
    const res = await api.get<ApiResponse<RecruiterProfile>>('/recruiter/profile');
    return res.data.data;
  },

  updateProfile: async (data: RecruiterProfileFormData): Promise<RecruiterProfile> => {
    const res = await api.put<ApiResponse<RecruiterProfile>>('/recruiter/profile', data);
    return res.data.data;
  },

  getDashboard: async (): Promise<RecruiterDashboard> => {
    const res = await api.get<ApiResponse<RecruiterDashboard>>('/recruiter/dashboard');
    return res.data.data;
  },

  getMyJobs: async (status?: string, page = 0, size = 10): Promise<PagedResponse<Job>> => {
    const res = await api.get<ApiResponse<PagedResponse<Job>>>('/recruiter/jobs', {
      params: { status, page, size },
    });
    return res.data.data;
  },

  searchApplicants: async (
    jobId?: number,
    status?: string,
    keyword?: string,
    page = 0,
    size = 10
  ): Promise<PagedResponse<JobApplication>> => {
    const res = await api.get<ApiResponse<PagedResponse<JobApplication>>>('/recruiter/applicants', {
      params: { jobId, status, keyword, page, size },
    });
    return res.data.data;
  },

  getApplicantDetails: async (applicationId: number): Promise<JobApplication> => {
    const res = await api.get<ApiResponse<JobApplication>>(`/recruiter/applicants/${applicationId}`);
    return res.data.data;
  },

  updateApplicantStatus: async (
    applicationId: number,
    status: string,
    notes?: string
  ): Promise<JobApplication> => {
    const res = await api.patch<ApiResponse<JobApplication>>(`/recruiter/applicants/${applicationId}/status`, {
      status,
      notes,
    });
    return res.data.data;
  },
};
