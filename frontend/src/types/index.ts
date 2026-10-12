export type Role = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export type WorkplaceType = 'ON_SITE' | 'HYBRID' | 'REMOTE';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type ModerationStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export type ApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'REJECTED' | 'SELECTED' | 'WITHDRAWN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
}

export interface CompanySummary {
  id: number;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  location?: string;
  logoUrl?: string;
}

export interface Job {
  id: number;
  title: string;
  company: CompanySummary;
  recruiterId: number;
  recruiterName: string;
  description: string;
  responsibilities?: string;
  skillsRequired?: string;
  qualifications?: string;
  category: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  isSalaryNegotiable?: boolean;
  status: JobStatus;
  moderationStatus: ModerationStatus;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
  isSaved?: boolean;
  hasApplied?: boolean;
  applicantCount?: number;
}

export interface ApplicationStatusHistory {
  id: number;
  previousStatus?: string;
  newStatus: string;
  changedByUserId: number;
  changedByName: string;
  notes?: string;
  createdAt: string;
}

export interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  jobLocation: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateLocation?: string;
  candidateHeadline?: string;
  candidateSkills?: string;
  coverLetter?: string;
  resumeFilePath?: string;
  resumeFileName?: string;
  status: ApplicationStatus;
  statusNotes?: string;
  appliedAt: string;
  updatedAt: string;
  statusHistory?: ApplicationStatusHistory[];
}

export interface CandidateProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  skills?: string;
  education?: string;
  experience?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeFilePath?: string;
  resumeFileName?: string;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateDashboard {
  profile: CandidateProfile;
  completionPercentage: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  selectedApplications: number;
  rejectedApplications: number;
  savedJobsCount: number;
  recentApplications: JobApplication[];
  recommendedJobs: Job[];
}

export interface MonthlyApplicationCount {
  month: string;
  count: number;
}

export interface RecruiterDashboard {
  totalJobs: number;
  totalActiveJobs: number;
  totalApplicationsReceived: number;
  jobsNearingDeadline: number;
  applicationsByStatus: Record<string, number>;
  monthlyApplications: MonthlyApplicationCount[];
  recentApplicants: JobApplication[];
  activeJobListings: Job[];
}

export interface RecruiterProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
  company?: CompanySummary;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number;
  userEmail?: string;
  userFullName?: string;
  action: string;
  entityType: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AdminDashboard {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalJobs: number;
  totalActiveJobs: number;
  totalApplications: number;
  totalCompanies: number;
  applicationsByStatus: Record<string, number>;
  recentAuditLogs: AuditLog[];
}

export interface UserDetail {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
  jobPostingCount: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}
