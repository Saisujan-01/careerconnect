import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Clock,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { recruiterService } from '../../services/recruiterService';
import { RecruiterDashboard } from '../../types';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';

export const RecruiterDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<RecruiterDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await recruiterService.getDashboard();
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
      <div className="text-center py-20 text-slate-500 text-sm">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto mb-3" />
        Loading recruiter analytics...
      </div>
    );
  }

  if (!dashboard) return null;

  const {
    totalJobs,
    totalActiveJobs,
    totalApplicationsReceived,
    jobsNearingDeadline,
    applicationsByStatus,
    recentApplicants,
  } = dashboard;

  // Prepare chart data from real database status metrics
  const statusChartData = [
    { name: 'Applied', count: applicationsByStatus['APPLIED'] || 0, fill: '#6366f1' },
    { name: 'Under Review', count: applicationsByStatus['UNDER_REVIEW'] || 0, fill: '#f59e0b' },
    { name: 'Shortlisted', count: applicationsByStatus['SHORTLISTED'] || 0, fill: '#8b5cf6' },
    { name: 'Selected', count: applicationsByStatus['SELECTED'] || 0, fill: '#10b981' },
    { name: 'Rejected', count: applicationsByStatus['REJECTED'] || 0, fill: '#f43f5e' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
            Employer Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Recruiter Dashboard & Pipeline
          </h1>
          <p className="text-sm text-slate-500">
            Monitor talent acquisition pipelines, active job vacancies, and applicant stages.
          </p>
        </div>
        <Link to="/recruiter/jobs/new">
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="h-4 w-4" />}
            className="bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-200"
          >
            Post a New Job
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
            <Briefcase className="h-4 w-4 text-violet-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{totalActiveJobs}</p>
          <p className="text-xs text-slate-400">Of {totalJobs} total postings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Applicants</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{totalApplicationsReceived}</p>
          <p className="text-xs text-slate-400">Total received to date</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Shortlisted</span>
            <FileCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {applicationsByStatus['SHORTLISTED'] || 0}
          </p>
          <p className="text-xs text-slate-400">In interview stages</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Due Soon</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{jobsNearingDeadline}</p>
          <p className="text-xs text-slate-400">Deadlines within 14 days</p>
        </div>
      </div>

      {/* Visual Chart: Applicants by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Candidate Pipeline Breakdown</h2>
            <p className="text-xs text-slate-500">Distribution of candidates across evaluation stages.</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Recent Applicants Preview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Recruitment Actions</h3>
            <p className="text-xs text-slate-500 mb-4">Quick links to high-frequency recruiter tasks.</p>

            <div className="space-y-2.5">
              <Link
                to="/recruiter/jobs/new"
                className="flex items-center justify-between p-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-900 font-medium text-xs transition-colors"
              >
                <span>Create New Job Posting</span>
                <ArrowRight className="h-3.5 w-3.5 text-violet-600" />
              </Link>

              <Link
                to="/recruiter/applicants"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs transition-colors"
              >
                <span>Review Pending Applicants</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>

              <Link
                to="/recruiter/jobs"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs transition-colors"
              >
                <span>Manage Existing Vacancies</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <span className="font-bold">Security Isolation Active:</span>
            <p className="text-indigo-700 leading-relaxed">
              Your account strictly manages postings and candidate records linked to your authorized recruiter profile.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Applicants */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Candidate Applications</h2>
            <p className="text-xs text-slate-500">Candidates who recently applied to your vacancies.</p>
          </div>
          <Link to="/recruiter/applicants">
            <Button variant="outline" size="sm">
              View All Applicants
            </Button>
          </Link>
        </div>

        {recentApplicants.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No applicants received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Candidate</th>
                  <th className="py-3 px-4">Applied Job</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{app.candidateName}</p>
                      <p className="text-xs text-slate-400">{app.candidateEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{app.jobTitle}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/recruiter/applicants/${app.id}`}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-800"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
