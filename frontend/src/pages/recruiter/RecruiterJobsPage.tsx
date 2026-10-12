import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, Edit3, Trash2, Eye, Users, AlertTriangle } from 'lucide-react';
import { recruiterService } from '../../services/recruiterService';
import { jobService } from '../../services/jobService';
import { Job, PagedResponse } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const RecruiterJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobsData, setJobsData] = useState<PagedResponse<Job>>({
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    isLast: true,
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchJobs = async (status = '', pageNum = 0) => {
    setIsLoading(true);
    try {
      const data = await recruiterService.getMyJobs(status || undefined, pageNum, 10);
      setJobsData(data);
    } catch {
      toast.error('Failed to load job postings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(statusFilter, page);
  }, [statusFilter, page]);

  const handleStatusToggle = async (job: Job) => {
    const nextStatus = job.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      await jobService.updateJobStatus(job.id, nextStatus);
      toast.success(`Job marked as ${nextStatus}`);
      fetchJobs(statusFilter, page);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      await jobService.deleteJob(jobToDelete.id);
      toast.success('Job removed or archived safely.');
      setDeleteModalOpen(false);
      fetchJobs(statusFilter, page);
    } catch {
      toast.error('Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manage Job Postings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create, update, and manage the publishing lifecycle of your organization's job vacancies.
          </p>
        </div>
        <Link to="/recruiter/jobs/new">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlusCircle className="h-4 w-4" />}
            className="bg-violet-600 hover:bg-violet-700 shadow-sm"
          >
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        {[
          { label: 'All Jobs', value: '' },
          { label: 'Active (Published)', value: 'PUBLISHED' },
          { label: 'Closed / Inactive', value: 'CLOSED' },
          { label: 'Drafts', value: 'DRAFT' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === tab.value
                ? 'bg-violet-100 text-violet-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto mb-3" />
          Loading your job postings...
        </div>
      ) : jobsData.content.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-10 w-10 text-slate-400" />}
          title="No job postings found"
          description="Create your first job posting to start receiving applicants from our talent network."
          actionText="Create New Job"
          onAction={() => navigate('/recruiter/jobs/new')}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Job Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Applicants</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobsData.content.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-semibold text-slate-900 hover:text-violet-600 transition-colors line-clamp-1"
                      >
                        {job.title}
                      </Link>
                      <span className="text-xs text-slate-400">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-700">{job.category}</td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      {job.location} ({job.workplaceType.replace('_', ' ')})
                    </td>

                    <td className="py-4 px-6">
                      <Link
                        to={`/recruiter/applicants?jobId=${job.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100"
                      >
                        <Users className="h-3.5 w-3.5" />
                        {job.applicantCount ?? 0} Candidates
                      </Link>
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={job.status} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          title="View Public Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <Link
                          to={`/recruiter/jobs/${job.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-violet-700 hover:bg-violet-50"
                          title="Edit Job"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>

                        <button
                          onClick={() => handleStatusToggle(job)}
                          className="px-2 py-1 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          {job.status === 'PUBLISHED' ? 'Close' : 'Publish'}
                        </button>

                        <button
                          onClick={() => handleDeleteClick(job)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete / Archive Job"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={jobsData.page}
              totalPages={jobsData.totalPages}
              totalElements={jobsData.totalElements}
              pageSize={jobsData.size}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}

      {/* Delete/Archive Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Job Posting"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Confirm Deletion or Archival</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to remove <span className="font-semibold text-slate-800">{jobToDelete?.title}</span>? If candidates have already applied, the job will be safely archived to protect application records.
          </p>

          <div className="flex gap-2 justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              Confirm Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
