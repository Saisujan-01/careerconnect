import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { CandidateLayout } from './layouts/CandidateLayout';
import { RecruiterLayout } from './layouts/RecruiterLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { JobListingsPage } from './pages/public/JobListingsPage';
import { JobDetailPage } from './pages/public/JobDetailPage';
import { CompaniesPage } from './pages/public/CompaniesPage';
import { CompanyDetailPage } from './pages/public/CompanyDetailPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { UnauthorizedPage, NotFoundPage } from './pages/public/ErrorPages';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Candidate Pages
import { CandidateDashboardPage } from './pages/candidate/CandidateDashboardPage';
import { CandidateProfilePage } from './pages/candidate/CandidateProfilePage';
import { CandidateApplicationsPage } from './pages/candidate/CandidateApplicationsPage';
import { CandidateSavedJobsPage } from './pages/candidate/CandidateSavedJobsPage';
import { CandidateResumePage } from './pages/candidate/CandidateResumePage';

// Recruiter Pages
import { RecruiterDashboardPage } from './pages/recruiter/RecruiterDashboardPage';
import { RecruiterJobsPage } from './pages/recruiter/RecruiterJobsPage';
import { JobFormPage } from './pages/recruiter/JobFormPage';
import { RecruiterApplicantsPage } from './pages/recruiter/RecruiterApplicantsPage';
import { ApplicantDetailPage } from './pages/recruiter/ApplicantDetailPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminJobsPage } from './pages/admin/AdminJobsPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with PublicLayout (Navbar & Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobListingsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Candidate Portal (Protected - CANDIDATE) */}
      <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
        <Route path="/candidate" element={<CandidateLayout />}>
          <Route index element={<Navigate to="/candidate/dashboard" replace />} />
          <Route path="dashboard" element={<CandidateDashboardPage />} />
          <Route path="profile" element={<CandidateProfilePage />} />
          <Route path="applications" element={<CandidateApplicationsPage />} />
          <Route path="saved-jobs" element={<CandidateSavedJobsPage />} />
          <Route path="resume" element={<CandidateResumePage />} />
        </Route>
      </Route>

      {/* Recruiter Portal (Protected - RECRUITER) */}
      <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
          <Route path="dashboard" element={<RecruiterDashboardPage />} />
          <Route path="jobs" element={<RecruiterJobsPage />} />
          <Route path="jobs/new" element={<JobFormPage />} />
          <Route path="jobs/:id/edit" element={<JobFormPage />} />
          <Route path="applicants" element={<RecruiterApplicantsPage />} />
          <Route path="applicants/:id" element={<ApplicantDetailPage />} />
        </Route>
      </Route>

      {/* Administrator Portal (Protected - ADMIN) */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="companies" element={<AdminCompaniesPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
