import api from './api';
import { ApiResponse, CompanySummary, Job, PagedResponse } from '../types';

export interface CompanyDetailResponse {
  company: CompanySummary;
  activeJobs: Job[];
  totalJobsCount: number;
}

export const companyService = {
  getCompanies: async (keyword?: string, page = 0, size = 12): Promise<PagedResponse<CompanySummary>> => {
    const res = await api.get<ApiResponse<PagedResponse<CompanySummary>>>('/companies', {
      params: { keyword, page, size },
    });
    return res.data.data;
  },

  getCompanyById: async (id: number): Promise<CompanyDetailResponse> => {
    const res = await api.get<ApiResponse<CompanyDetailResponse>>(`/companies/${id}`);
    return res.data.data;
  },
};
