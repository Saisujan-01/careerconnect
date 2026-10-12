import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, Search, SlidersHorizontal, CheckCircle2, FileText, ArrowRight, Download } from 'lucide-react';
import { recruiterService } from '../../services/recruiterService';
import { JobApplication, PagedResponse, ApplicationStatus, Job } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const RecruiterApplicantsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') ? Number(searchParams.get('jobId')) : undefined;

  const [jobId, setJobId] = useState<number | undefined>(initialJobId);
  const [status, setStatus] = useState<string>(searchParams.get('status') || '');
  const [keyword, setKeyword] = useState<string>(searchParams.get('keyword') || '');
  const [page, setPage] = useState<number>(0);

  const [applicantsData, setApplicantsData] = useState<PagedResponse<JobApplication>>({
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    isLast: true,
  });
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Status Update Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [appToUpdate, setAppToUpdate] = useState<JobApplication | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('UNDER_REVIEW');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch recruiter's jobs for the dropdown
  useEffect(() => {
    recruiterService.getMyJobs(undefined, 0, 50).then((res) => {
      setMyJobs(res.content);
    });
  }, []);

  const fetchApplicants = async () => {
    setIsLoading(true);
    try {
      const data = await recruiterService.searchApplicants(
        jobId,
        status || undefined,
        keyword || undefined,
        page,
        10
      );
      setApplicantsData(data);
    } catch {
      toast.error('Failed to load applicants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId, status, keyword, page]);

  const openStatusModal = (app: JobApplication) => {
    setAppToUpdate(app);
    setNewStatus(app.status);
    setStatusNotes(app.statusNotes || '');
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appToUpdate) return;
    setIsUpdating(true);
    try {
      await recruiterService.updateApplicantStatus(appToUpdate.id, newStatus, statusNotes);
      toast.success(`Application updated to ${newStatus}`);
      setStatusModalOpen(false);
      fetchApplicants();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Applicants</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Review candidate qualifications, cover letters, and manage hiring pipeline stages.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder="Search candidate name, email, or skills..."
            className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Filter by Job */}
        <select
          value={jobId || ''}
          onChange={(e) => {
            setJobId(e.target.value ? Number(e.target.value) : undefined);
            setPage(0);
          }}
          className="w-full md:w-56 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">All Job Vacancies</option>
          {myJobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>

        {/* Filter by Status */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="w-full md:w-44 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">All Statuses</option>
          <option value="APPLIED">Applied</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="SELECTED">Selected</option>
          <option value="REJECTED">Rejected</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto mb-3" />
          Loading applicants...
        </div>
      ) : applicantsData.content.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10 text-slate-400" />}
          title="No applicants found"
          description="Try broadening your search criteria or selecting a different job vacancy."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Applied Vacancy</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicantsData.content.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{app.candidateName}</p>
                      <p className="text-xs text-slate-500">{app.candidateEmail}</p>
                      {app.candidateHeadline && (
                        <p className="text-xs text-indigo-600 mt-0.5 line-clamp-1">
                          {app.candidateHeadline}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <Link
                        to={`/jobs/${app.jobId}`}
                        className="font-medium text-slate-800 hover:text-violet-600 line-clamp-1"
                      >
                        {app.jobTitle}
                      </Link>
                      <span className="text-xs text-slate-400">{app.jobLocation}</span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => openStatusModal(app)}
                        className="text-left group cursor-pointer"
                        title="Click to update status"
                      >
                        <StatusBadge status={app.status} />
                        <span className="block text-[11px] text-slate-400 group-hover:text-violet-600 mt-0.5">
                          Change stage ✎
                        </span>
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.resumeFilePath && (
                          <a
                            href={`/api/files/download/${app.resumeFilePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            title="Download Candidate Resume"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}

                        <Link
                          to={`/recruiter/applicants/${app.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 font-semibold text-xs hover:bg-violet-100"
                        >
                          View Profile
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={applicantsData.page}
              totalPages={applicantsData.totalPages}
              totalElements={applicantsData.totalElements}
              pageSize={applicantsData.size}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}

      {/* Quick Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Candidate Stage"
        maxWidth="md"
      >
        {appToUpdate && (
          <form onSubmit={handleStatusSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-semibold text-slate-900">{appToUpdate.candidateName}</p>
              <p className="text-xs text-slate-500">Applying for: {appToUpdate.jobTitle}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Application Stage
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted (Interview Round)</option>
                <option value="SELECTED">Selected (Offer Stage)</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Feedback Notes & Reason (Optional)
              </label>
              <textarea
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add internal feedback or rationale for status transition..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUpdating}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Save Status Transition
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
