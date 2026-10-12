import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
  Bookmark,
  Share2,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FileText,
  Upload,
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import { candidateService } from '../../services/candidateService';
import { Job } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { JobCard } from '../../components/jobs/JobCard';
import toast from 'react-hot-toast';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isCandidate } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Application Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [useSavedResume, setUseSavedResume] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  // Save state
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await jobService.getJobById(Number(id));
        setJob(data);
        setIsSaved(!!data.isSaved);

        // Fetch related jobs in the same category
        const related = await jobService.getRelatedJobs(Number(id));
        setRelatedJobs(related);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Job not found.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in as a candidate to apply.');
      navigate(`/login?redirect=${encodeURIComponent(`/jobs/${id}`)}`);
      return;
    }
    if (!isCandidate) {
      toast.error('Only candidates can submit job applications.');
      return;
    }
    setApplyModalOpen(true);
  };

  const handleSaveToggle = async () => {
    if (!job) return;
    if (!isAuthenticated) {
      toast.error('Please sign in to save jobs.');
      navigate(`/login?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`);
      return;
    }
    if (!isCandidate) {
      toast.error('Only candidates can save jobs.');
      return;
    }

    try {
      if (isSaved) {
        await candidateService.unsaveJob(job.id);
        setIsSaved(false);
        toast.success('Removed from saved jobs');
      } else {
        await candidateService.saveJob(job.id);
        setIsSaved(true);
        toast.success('Job bookmarked!');
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsSubmittingApp(true);
    try {
      let uploadedResumePath: string | undefined;
      let uploadedResumeName: string | undefined;

      // If user uploaded a new resume
      if (!useSavedResume && resumeFile) {
        const prof = await candidateService.uploadResume(resumeFile);
        uploadedResumePath = prof.resumeFilePath;
        uploadedResumeName = prof.resumeFileName;
      }

      await jobService.applyForJob(job.id, {
        coverLetter: coverLetter.trim() || undefined,
        resumeFilePath: uploadedResumePath,
        resumeFileName: uploadedResumeName,
        useSavedResume,
      });

      toast.success('Application submitted successfully!');
      setApplyModalOpen(false);
      // Mark job as applied locally
      setJob({ ...job, hasApplied: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Competitive';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    return formatter.format(min || max || 0);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Job Not Found</h2>
        <p className="text-slate-500 text-sm">
          This job vacancy may have closed or been archived.
        </p>
        <Link to="/jobs">
          <Button variant="primary">Browse Open Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all listings
      </Link>

      {/* Main Job Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xl shadow-md shadow-indigo-100">
              {job.company.logoUrl && job.company.logoUrl.length <= 4
                ? job.company.logoUrl
                : job.company.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <Link
                  to={`/companies/${job.company.id}`}
                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {job.company.name}
                </Link>
                <span>•</span>
                <span>{job.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveToggle}
              className={`p-2.5 rounded-xl border transition-colors ${
                isSaved
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Saved' : 'Save Job'}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-indigo-600' : ''}`} />
            </button>

            {job.hasApplied ? (
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Applied
              </span>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleApplyClick}
                className="rounded-xl px-7 shadow-md shadow-indigo-300"
              >
                Apply for this Role
              </Button>
            )}
          </div>
        </div>

        {/* Key Attributes Pills Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 block font-medium">Workplace</span>
            <span className="text-sm font-semibold text-slate-800">
              {job.workplaceType.replace('_', ' ')}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 block font-medium">Employment Type</span>
            <span className="text-sm font-semibold text-slate-800">
              {job.employmentType.replace('_', ' ')}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 block font-medium">Salary Range</span>
            <span className="text-sm font-semibold text-emerald-700">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 block font-medium">Deadline</span>
            <span className="text-sm font-semibold text-slate-800">
              {job.applicationDeadline || 'Rolling Admission'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Details & Company Side Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Responsibilities, Skills */}
        <div className="lg:col-span-2 space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          {/* Job Overview / Description */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Job Overview</h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </section>

          {/* Responsibilities */}
          {job.responsibilities && (
            <section className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Key Responsibilities</h2>
              <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                {job.responsibilities.split('\n').filter(Boolean).map((resp, i) => (
                  <li key={i}>{resp.replace(/^[•\-\*]\s*/, '')}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Required Skills */}
          {job.skillsRequired && (
            <section className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Required Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.split(/[,;\n]/).filter(Boolean).map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-xs border border-indigo-100"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Qualifications */}
          {job.qualifications && (
            <section className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Qualifications</h2>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.qualifications}
              </div>
            </section>
          )}
        </div>

        {/* Right 1 Col: Company Card & Related Jobs */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">About the Employer</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 text-sm">
                {job.company.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{job.company.name}</h4>
                <p className="text-xs text-slate-400">{job.company.industry}</p>
              </div>
            </div>
            {job.company.description && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {job.company.description}
              </p>
            )}
            <div className="pt-2">
              <Link to={`/companies/${job.company.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Company Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Related Jobs */}
          {relatedJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Similar Positions</h3>
              <div className="space-y-3">
                {relatedJobs.map((relJob) => (
                  <JobCard key={relJob.id} job={relJob} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
        maxWidth="lg"
      >
        <form onSubmit={handleApplicationSubmit} className="space-y-5">
          <div>
            <p className="text-xs text-slate-500 mb-3">
              Submitting application to <span className="font-semibold text-slate-800">{job.company.name}</span>.
            </p>

            {/* Resume Selection */}
            <div className="space-y-2 mb-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Resume Attachment
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="resumeChoice"
                    checked={useSavedResume}
                    onChange={() => setUseSavedResume(true)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Use saved resume from your profile
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="resumeChoice"
                    checked={!useSavedResume}
                    onChange={() => setUseSavedResume(false)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Upload a new resume (PDF or DOCX)
                </label>
              </div>

              {!useSavedResume && (
                <div className="mt-2 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    required={!useSavedResume}
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">PDF or DOCX, max 10MB.</p>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cover Letter / Personal Statement
              </label>
              <textarea
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Describe why your experience matches this opportunity and what value you'll deliver..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setApplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingApp}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
