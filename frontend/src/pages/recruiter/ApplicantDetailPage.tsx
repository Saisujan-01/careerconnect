import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Download,
  History,
  CheckCircle2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { recruiterService } from '../../services/recruiterService';
import { JobApplication, ApplicationStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export const ApplicantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<JobApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status update
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('UNDER_REVIEW');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApplicant = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await recruiterService.getApplicantDetails(Number(id));
      setApp(data);
      setSelectedStatus(data.status);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Access denied or applicant not found');
      navigate('/recruiter/applicants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicant();
  }, [id]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    setIsUpdating(true);
    try {
      const updated = await recruiterService.updateApplicantStatus(app.id, selectedStatus, statusNotes);
      setApp(updated);
      setStatusNotes('');
      toast.success(`Applicant moved to ${selectedStatus}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update applicant status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 text-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto mb-3" />
        Loading candidate submission...
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/recruiter/applicants"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-violet-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to applicants list
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-2xl shadow-md">
            {app.candidateName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">{app.candidateName}</h1>
            <p className="text-sm text-slate-500">{app.candidateEmail}</p>
            {app.candidateHeadline && (
              <p className="text-xs text-indigo-600 font-semibold">{app.candidateHeadline}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              {app.candidatePhone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {app.candidatePhone}
                </span>
              )}
              {app.candidateLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {app.candidateLocation}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Current Status:</span>
            <StatusBadge status={app.status} />
          </div>
          {app.resumeFilePath && (
            <a
              href={`/api/files/download/${app.resumeFilePath}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                className="mt-1"
              >
                Download Resume
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Grid: Details & Status Transition Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Position Info & Cover Letter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Role Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Application Scope
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <Link
                  to={`/jobs/${app.jobId}`}
                  className="font-bold text-base text-slate-900 hover:text-violet-600"
                >
                  {app.jobTitle}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-medium text-slate-700">
                {app.workplaceType.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Candidate Skills */}
          {app.candidateSkills && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Candidate Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {app.candidateSkills.split(/[,;\n]/).filter(Boolean).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100"
                  >
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-violet-600" />
              Cover Letter & Statement
            </h2>
            {app.coverLetter ? (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {app.coverLetter}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No cover letter submitted with this application.</p>
            )}
          </div>

          {/* Transition Audit History */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-4 w-4 text-violet-600" />
              Application Audit Log & History
            </h2>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-violet-100">
              {app.statusHistory && app.statusHistory.length > 0 ? (
                app.statusHistory.map((item, idx) => (
                  <div key={item.id || idx} className="relative">
                    <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-violet-600 ring-2 ring-violet-200" />
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{item.newStatus.replace('_', ' ')}</span>
                        <span className="text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Updated by: <span className="font-medium text-slate-700">{item.changedByName}</span>
                      </p>
                      {item.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No status logs recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Status Transition Action Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Update Application Stage</h3>
            <p className="text-xs text-slate-500">
              Advance candidate through recruitment rounds or reject application.
            </p>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Stage
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
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
                  Transition Notes (Logged to Audit History)
                </label>
                <textarea
                  rows={4}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Completed technical round with positive feedback..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl"
                isLoading={isUpdating}
              >
                Confirm Stage Transition
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
