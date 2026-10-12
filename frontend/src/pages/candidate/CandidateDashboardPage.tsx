import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  User,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { CandidateDashboard } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { JobCard } from '../../components/jobs/JobCard';

export const CandidateDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<CandidateDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await candidateService.getDashboard();
        setDashboard(data);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading your candidate dashboard...</p>
      </div>
    );
  }

  if (!dashboard) return null;

  const {
    profile,
    completionPercentage,
    totalApplications,
    pendingApplications,
    shortlistedApplications,
    selectedApplications,
    savedJobsCount,
    recentApplications,
    recommendedJobs,
  } = dashboard;

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Profile Completion Progress */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
              Candidate Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {profile.fullName}!
            </h1>
            <p className="text-indigo-100 text-sm max-w-xl">
              {profile.headline || 'Full Stack Software Engineer'} • {profile.location || 'Location Not Set'}
            </p>
          </div>

          {/* Profile Completion Indicator */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span>Profile Strength</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            {completionPercentage < 100 && (
              <Link
                to="/candidate/profile"
                className="mt-3 block text-right text-xs font-semibold text-white hover:underline"
              >
                Complete missing fields →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Applied</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalApplications}</p>
          <p className="text-[11px] text-slate-400">Total applications</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">In Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingApplications}</p>
          <p className="text-[11px] text-slate-400">Pending review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Shortlisted</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{shortlistedApplications}</p>
          <p className="text-[11px] text-slate-400">Interview stage</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Selected</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{selectedApplications}</p>
          <p className="text-[11px] text-slate-400">Offers extended</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Bookmarks</span>
            <Bookmark className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{savedJobsCount}</p>
          <p className="text-[11px] text-slate-400">Saved vacancies</p>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            <p className="text-xs text-slate-500">Track current status of your submitted job applications.</p>
          </div>
          <Link to="/candidate/applications">
            <Button variant="outline" size="sm">
              View All Applications
            </Button>
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            You haven't submitted any job applications yet.{' '}
            <Link to="/jobs" className="text-indigo-600 font-semibold hover:underline">
              Browse open roles
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Job Title</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <Link to={`/jobs/${app.jobId}`} className="hover:text-indigo-600">
                        {app.jobTitle}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">{app.companyName}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/candidate/applications"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Timeline →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recommended Jobs for Candidate */}
      {recommendedJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Recommended for Your Profile
              </h2>
              <p className="text-xs text-slate-500">Positions matched using your skills and category preferences.</p>
            </div>
            <Link to="/jobs">
              <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                Explore more →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
