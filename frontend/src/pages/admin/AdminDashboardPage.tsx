import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  ShieldCheck,
  Activity,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { adminService } from '../../services/adminService';
import { AdminDashboard } from '../../types';
import { Button } from '../../components/common/Button';

export const AdminDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const data = await adminService.getDashboard();
        setDashboard(data);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 text-sm">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-3" />
        Loading administrative telemetry...
      </div>
    );
  }

  if (!dashboard) return null;

  const {
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalJobs,
    totalActiveJobs,
    totalApplications,
    totalCompanies,
    applicationsByStatus,
    recentAuditLogs,
  } = dashboard;

  const chartData = [
    { name: 'Applied', count: applicationsByStatus['APPLIED'] || 0, fill: '#6366f1' },
    { name: 'In Review', count: applicationsByStatus['UNDER_REVIEW'] || 0, fill: '#f59e0b' },
    { name: 'Shortlisted', count: applicationsByStatus['SHORTLISTED'] || 0, fill: '#8b5cf6' },
    { name: 'Selected', count: applicationsByStatus['SELECTED'] || 0, fill: '#10b981' },
    { name: 'Rejected', count: applicationsByStatus['REJECTED'] || 0, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Governance & Governance Controls
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            System Administration Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Real-time platform activity metrics, user governance, and audit trails.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users">
            <Button variant="outline" size="sm">
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/jobs">
            <Button variant="primary" size="sm">
              Moderate Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{totalUsers}</p>
          <p className="text-xs text-slate-400">
            {totalCandidates} Candidates • {totalRecruiters} Recruiters
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Job Vacancies</span>
            <Briefcase className="h-4 w-4 text-violet-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{totalJobs}</p>
          <p className="text-xs text-emerald-600 font-medium">
            {totalActiveJobs} Active Published
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Applications</span>
            <FileText className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{totalApplications}</p>
          <p className="text-xs text-slate-400">Total submitted across portal</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Employers</span>
            <Building2 className="h-4 w-4 text-sky-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{totalCompanies}</p>
          <p className="text-xs text-slate-400">Registered hiring entities</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Platform-Wide Application Distribution</h2>
          <p className="text-xs text-slate-500">Live breakdown calculated directly from relational database records.</p>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

      {/* Audit Log Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              Recent Administrative & System Audit Logs
            </h2>
            <p className="text-xs text-slate-500">Security event history and system lifecycle actions.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Triggered By</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 rounded-r-xl">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">{log.action}</td>
                  <td className="py-3 px-4 font-medium text-indigo-600">{log.entityType}</td>
                  <td className="py-3 px-4 text-slate-600">{log.userFullName || 'System'}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{log.details || '—'}</td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
