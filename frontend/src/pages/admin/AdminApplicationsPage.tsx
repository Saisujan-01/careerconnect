import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { JobApplication, ApplicationStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Eye, FileText, User, Building2, Calendar, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Detail modal
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  const fetchApplications = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getAllApplications(page, 10);
      setApplications(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
      setCurrentPage(res.page);
    } catch (err: any) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(0);
  }, []);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SELECTED':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 className="w-3 h-3 mr-1 inline" />
            Selected
          </Badge>
        );
      case 'SHORTLISTED':
        return (
          <Badge variant="primary" size="sm">
            <CheckCircle2 className="w-3 h-3 mr-1 inline" />
            Shortlisted
          </Badge>
        );
      case 'UNDER_REVIEW':
        return (
          <Badge variant="warning" size="sm">
            <Clock className="w-3 h-3 mr-1 inline" />
            Under Review
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="danger" size="sm">
            <XCircle className="w-3 h-3 mr-1 inline" />
            Rejected
          </Badge>
        );
      case 'WITHDRAWN':
        return (
          <Badge variant="neutral" size="sm">
            Withdrawn
          </Badge>
        );
      case 'APPLIED':
      default:
        return (
          <Badge variant="neutral" size="sm">
            Applied
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Platform Applications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time feed of all candidate job applications submitted across the CareerConnect network.
          </p>
        </div>
        <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Total Submissions: <span className="font-bold text-navy-900">{totalElements}</span>
        </div>
      </div>

      {/* Applications Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications recorded"
            description="Applications submitted by candidates will appear here."
            icon="file"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Job Position</th>
                  <th className="px-6 py-3.5">Company</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Current Status</th>
                  <th className="px-6 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {app.candidateName ? app.candidateName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div className="font-semibold text-navy-900">{app.candidateName}</div>
                          <div className="text-xs text-slate-500">{app.candidateEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-navy-900">{app.jobTitle}</div>
                      <div className="text-xs text-slate-500">{app.jobLocation} • {app.workplaceType}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {app.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Inspect
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
              onPageChange={(page) => fetchApplications(page)}
            />
          </div>
        )}
      </Card>

      {/* Inspect Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`Application Details — ${selectedApp.candidateName}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200">
              <div>
                <span className="text-slate-400 block mb-0.5">Job Position:</span>
                <strong className="text-navy-900">{selectedApp.jobTitle}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Company:</span>
                <strong className="text-navy-900">{selectedApp.companyName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Candidate Email:</span>
                <span>{selectedApp.candidateEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Current Status:</span>
                {getStatusBadge(selectedApp.status)}
              </div>
            </div>

            {selectedApp.candidateHeadline && (
              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-1">Professional Headline</h4>
                <p className="text-xs text-slate-700 bg-white p-2 border border-slate-200 rounded">
                  {selectedApp.candidateHeadline}
                </p>
              </div>
            )}

            {selectedApp.coverLetter && (
              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-1">Cover Letter</h4>
                <p className="text-xs text-slate-700 bg-white p-2.5 border border-slate-200 rounded whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {selectedApp.coverLetter}
                </p>
              </div>
            )}

            {selectedApp.resumeFilePath && (
              <div className="pt-1">
                <a
                  href={`/api/files/download/${encodeURIComponent(selectedApp.resumeFilePath)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
                >
                  <Download className="w-4 h-4" />
                  Download Resume ({selectedApp.resumeFileName || 'resume.pdf'})
                </a>
              </div>
            )}

            {/* Status Audit History Timeline */}
            {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Status Audit Trail</h4>
                <div className="border-l-2 border-slate-200 ml-2 space-y-3 pl-3 text-xs">
                  {selectedApp.statusHistory.map((h) => (
                    <div key={h.id} className="relative">
                      <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-primary-500 ring-2 ring-white" />
                      <div className="font-semibold text-navy-900">
                        {h.previousStatus ? `${h.previousStatus} → ` : ''}
                        <span className="text-primary-600">{h.newStatus}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        By {h.changedByName} on {new Date(h.createdAt).toLocaleString()}
                      </div>
                      {h.notes && (
                        <div className="text-[11px] text-slate-600 italic mt-0.5">
                          "{h.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <Button variant="outline" size="md" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
