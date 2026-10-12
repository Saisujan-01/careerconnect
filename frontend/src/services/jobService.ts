import api from './api';
import { ApiResponse, Job, JobApplication, PagedResponse } from '../types';

export interface JobFilterParams {
  keyword?: string;
  location?: string;
  category?: string;
  workplaceType?: string;
  employmentType?: string;
  minSalary?: number;
  maxSalary?: number;
  sortBy?: string;
  page?: number;
  size?: number;
}

export interface JobFormData {
  title: string;
  companyId?: number;
  companyName?: string;
  description: string;
  responsibilities?: string;
  skillsRequired?: string;
  qualifications?: string;
  category: string;
  location: string;
  workplaceType: string;
  employmentType: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  isSalaryNegotiable?: boolean;
  applicationDeadline?: string;
}

export const jobService = {
  searchJobs: async (params: JobFilterParams): Promise<PagedResponse<Job>> => {
    const res = await api.get<ApiResponse<PagedResponse<Job>>>('/jobs', { params });
    return res.data.data;
  },

  getFeaturedJobs: async (): Promise<Job[]> => {
    const res = await api.get<ApiResponse<Job[]>>('/jobs/featured');
    return res.data.data;
  },

  getCategories: async (): Promise<string[]> => {
    const res = await api.get<ApiResponse<string[]>>('/jobs/categories');
    return res.data.data;
  },

  getJobById: async (id: number): Promise<Job> => {
    const res = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return res.data.data;
  },

  getRelatedJobs: async (id: number): Promise<Job[]> => {
    const res = await api.get<ApiResponse<Job[]>>(`/jobs/${id}/related`);
    return res.data.data;
  },

  createJob: async (data: JobFormData): Promise<Job> => {
    const res = await api.post<ApiResponse<Job>>('/jobs', data);
    return res.data.data;
  },

  updateJob: async (id: number, data: JobFormData): Promise<Job> => {
    const res = await api.put<ApiResponse<Job>>(`/jobs/${id}`, data);
    return res.data.data;
  },

  updateJobStatus: async (id: number, status: string): Promise<Job> => {
    const res = await api.patch<ApiResponse<Job>>(`/jobs/${id}/status`, { status });
    return res.data.data;
  },

  deleteJob: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/jobs/${id}`);
  },

  applyForJob: async (
    jobId: number,
    data: { coverLetter?: string; resumeFilePath?: string; resumeFileName?: string; useSavedResume?: boolean }
  ): Promise<JobApplication> => {
    const res = await api.post<ApiResponse<JobApplication>>(`/jobs/${jobId}/applications`, data);
    return res.data.data;
  },
};
