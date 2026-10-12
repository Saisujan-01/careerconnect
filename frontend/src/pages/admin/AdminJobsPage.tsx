import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Job, ModerationStatus, JobStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Filter, ExternalLink, ShieldAlert, CheckCircle2, XCircle, Clock, MapPin, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [moderationFilter, setModerationFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Moderation modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [targetModeration, setTargetModeration] = useState<ModerationStatus>('APPROVED');
  const [moderationNotes, setModerationNotes] = useState<string>('');
  const [moderating, setModerating] = useState<boolean>(false);

  const fetchJobs = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getJobs(
        search.trim() || undefined,
        statusFilter || undefined,
        moderationFilter || undefined,
        page,
        10
      );
      setJobs(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
      setCurrentPage(res.page);
    } catch (err: any) {
      toast.error('Failed to load jobs for moderation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(0);
  }, [statusFilter, moderationFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(0);
  };

  const handleOpenModeration = (job: Job) => {
    setSelectedJob(job);
    setTargetModeration(job.moderationStatus || 'APPROVED');
    setModerationNotes('');
  };

  const handleSaveModeration = async () => {
    if (!selectedJob) return;
    setModerating(true);
    try {
      await adminService.moderateJob(selectedJob.id, targetModeration, moderationNotes);
      toast.success(`Job "${selectedJob.title}" marked as ${targetModeration}`);
      setSelectedJob(null);
      fetchJobs(currentPage);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update job moderation status');
    } finally {
      setModerating(false);
    }
  };

  const getModerationBadge = (mod: ModerationStatus) => {
    switch (mod) {
      case 'APPROVED':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 className="w-3 h-3 mr-1 inline" />
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="danger" size="sm">
            <XCircle className="w-3 h-3 mr-1 inline" />
            Rejected
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge variant="warning" size="sm">
            <Clock className="w-3 h-3 mr-1 inline" />
            Pending Review
          </Badge>
        );
    }
  };

  const getStatusBadge = (st: JobStatus) => {
    switch (st) {
      case 'PUBLISHED':
        return <Badge variant="primary" size="sm">Published</Badge>;
      case 'CLOSED':
        return <Badge variant="neutral" size="sm">Closed</Badge>;
      case 'DRAFT':
        return <Badge variant="warning" size="sm">Draft</Badge>;
      case 'ARCHIVED':
        return <Badge variant="neutral" size="sm">Archived</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Job Moderation & Listings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review recruiter postings, enforce quality standards, and moderate content across the portal.
          </p>
        </div>
        <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Total Postings: <span className="font-bold text-navy-900">{totalElements}</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job title, company, or category..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={moderationFilter}
                onChange={(e) => setModerationFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Moderation</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending Review</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Jobs Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No job postings found"
            description="Try modifying your keyword search or moderation filters."
            icon="briefcase"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
                <tr>
                  <th className="px-6 py-3.5">Job Title & Company</th>
                  <th className="px-6 py-3.5">Location & Type</th>
                  <th className="px-6 py-3.5">Posting Status</th>
                  <th className="px-6 py-3.5">Moderation</th>
                  <th className="px-6 py-3.5">Applicants</th>
                  <th className="px-6 py-3.5">Posted On</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-navy-900 flex items-center gap-1.5">
                          {j.title}
                          <Link
                            to={`/jobs/${j.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-primary-600 transition-colors"
                            title="Open public job page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {j.company?.name || 'Unknown Company'} • By {j.recruiterName || 'Recruiter'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {j.location}
                      </div>
                      <div className="text-slate-400 mt-0.5">
                        {j.workplaceType} • {j.employmentType.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(j.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getModerationBadge(j.moderationStatus)}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-navy-900">
                      {j.applicantCount || 0}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(j.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModeration(j)}
                      >
                        <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                        Moderate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={10}
              onPageChange={(page) => fetchJobs(page)}
            />
          </div>
        )}
      </Card>

      {/* Moderation Modal */}
      {selectedJob && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedJob(null)}
          title={`Moderate Job: ${selectedJob.title}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <div><strong>Company:</strong> {selectedJob.company?.name}</div>
              <div><strong>Recruiter:</strong> {selectedJob.recruiterName}</div>
              <div><strong>Category:</strong> {selectedJob.category}</div>
              <div><strong>Current Status:</strong> {selectedJob.status} / {selectedJob.moderationStatus}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Moderation Action
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetModeration('APPROVED')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    targetModeration === 'APPROVED'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setTargetModeration('PENDING')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    targetModeration === 'PENDING'
                      ? 'border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setTargetModeration('REJECTED')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    targetModeration === 'REJECTED'
                      ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Reject
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Moderation Feedback / Notes
              </label>
              <textarea
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                placeholder="Explain the reason for rejection or special approval instructions..."
                rows={3}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" size="md" onClick={() => setSelectedJob(null)} disabled={moderating}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSaveModeration} isLoading={moderating}>
                Submit Moderation Decision
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
