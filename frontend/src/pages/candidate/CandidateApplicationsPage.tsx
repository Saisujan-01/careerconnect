import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  Building2,
  MapPin,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { JobApplication, PagedResponse } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const CandidateApplicationsPage: React.FC = () => {
  const [applicationsData, setApplicationsData] = useState<PagedResponse<JobApplication>>({
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    isLast: true,
  });
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Status History Modal
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Withdraw Modal
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [appToWithdraw, setAppToWithdraw] = useState<JobApplication | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchApplications = async (pageNum = 0) => {
    setIsLoading(true);
    try {
      const data = await candidateService.getApplications(pageNum, 10);
      setApplicationsData(data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(page);
  }, [page]);

  const handleWithdrawClick = (app: JobApplication) => {
    setAppToWithdraw(app);
    setWithdrawModalOpen(true);
  };

  const confirmWithdraw = async () => {
    if (!appToWithdraw) return;
    setIsWithdrawing(true);
    try {
      await candidateService.withdrawApplication(appToWithdraw.id);
      toast.success('Application withdrawn successfully');
      setWithdrawModalOpen(false);
      fetchApplications(page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to withdraw application');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const openHistoryModal = (app: JobApplication) => {
    setSelectedApp(app);
    setHistoryModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Job Applications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track real-time hiring progress, review feedback notes, and view status timelines.
          </p>
        </div>
        <Link to="/jobs">
          <Button variant="primary" size="sm">
            Find New Opportunities
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-3" />
          Loading your applications...
        </div>
      ) : applicationsData.content.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-10 w-10 text-slate-400" />}
          title="No job applications submitted"
          description="Browse thousands of verified engineering and product positions and apply in one click."
          actionText="Browse Open Jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Job Vacancy</th>
                  <th className="py-4 px-6">Employer</th>
                  <th className="py-4 px-6">Applied Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicationsData.content.map((app) => {
                  const canWithdraw = app.status === 'APPLIED' || app.status === 'UNDER_REVIEW';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          to={`/jobs/${app.jobId}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                        >
                          {app.jobTitle}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.jobLocation}
                          </span>
                          <span>•</span>
                          <span>{app.workplaceType.replace('_', ' ')}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-800">
                        {app.companyName}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(app.appliedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={app.status} />
                          {app.statusNotes && (
                            <span className="text-[11px] text-slate-400 italic line-clamp-1 max-w-xs">
                              "{app.statusNotes}"
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openHistoryModal(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            title="View Status History Timeline"
                          >
                            <History className="h-3.5 w-3.5 text-indigo-600" />
                            Timeline
                          </button>

                          {canWithdraw && (
                            <button
                              onClick={() => handleWithdrawClick(app)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={applicationsData.page}
              totalPages={applicationsData.totalPages}
              totalElements={applicationsData.totalElements}
              pageSize={applicationsData.size}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}

      {/* Status History Timeline Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Application Status Timeline"
        maxWidth="md"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-900 text-sm">{selectedApp.jobTitle}</h4>
              <p className="text-xs text-slate-500">{selectedApp.companyName}</p>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
              {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 ? (
                selectedApp.statusHistory.map((item, idx) => (
                  <div key={item.id || idx} className="relative">
                    <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600 ring-2 ring-indigo-200" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {item.newStatus.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Changed by: <span className="font-medium text-slate-700">{item.changedByName}</span>
                      </p>
                      {item.notes && (
                        <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No recorded status events yet.</p>
              )}
            </div>

            {selectedApp.coverLetter && (
              <div className="pt-4 border-t border-slate-100 space-y-1">
                <span className="text-xs font-bold text-slate-700 uppercase">Cover Letter</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                  {selectedApp.coverLetter}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setHistoryModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Withdraw Application"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Are you sure you want to withdraw?</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Withdrawing your application for <span className="font-semibold text-slate-800">{appToWithdraw?.jobTitle}</span> will remove your candidate candidacy from the recruiter's active review list.
          </p>

          <div className="flex gap-2 justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWithdrawModalOpen(false)}
              disabled={isWithdrawing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmWithdraw}
              isLoading={isWithdrawing}
            >
              Confirm Withdrawal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
