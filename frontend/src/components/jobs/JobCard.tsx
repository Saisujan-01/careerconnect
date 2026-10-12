import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Building2, MapPin, DollarSign, Clock, Briefcase } from 'lucide-react';
import { Job } from '../../types';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';
import toast from 'react-hot-toast';

interface JobCardProps {
  job: Job;
  onSaveToggle?: (jobId: number, isSaved: boolean) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSaveToggle }) => {
  const { isAuthenticated, isCandidate } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState<boolean>(!!job.isSaved);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in as a candidate to save jobs.');
      navigate('/login?redirect=' + encodeURIComponent(`/jobs/${job.id}`));
      return;
    }

    if (!isCandidate) {
      toast.error('Only candidates can save jobs.');
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await candidateService.unsaveJob(job.id);
        setIsSaved(false);
        toast.success('Job removed from saved list');
        onSaveToggle?.(job.id, false);
      } else {
        await candidateService.saveJob(job.id);
        setIsSaved(true);
        toast.success('Job saved to your bookmarks!');
        onSaveToggle?.(job.id, true);
      }
    } catch {
      toast.error('Failed to update bookmark');
    } finally {
      setIsSaving(false);
    }
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Competitive';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    });
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    return formatter.format(min || max || 0);
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header: Company logo & initials, Title, Save button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-base shadow-sm shadow-indigo-100">
              {job.company.logoUrl && job.company.logoUrl.length <= 4 ? (
                job.company.logoUrl
              ) : (
                getCompanyInitials(job.company.name)
              )}
            </div>
            <div>
              <Link
                to={`/jobs/${job.id}`}
                className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1"
              >
                {job.title}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Link
                  to={`/companies/${job.company.id}`}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {job.company.name}
                </Link>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">{job.category}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            title={isSaved ? 'Remove from saved jobs' : 'Save job'}
            className={`rounded-lg p-2 transition-colors ${
              isSaved
                ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Badges: Location, Workplace, Employment, Salary */}
        <div className="flex flex-wrap items-center gap-2.5 mt-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/70 font-medium">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50/70 border border-indigo-100 text-indigo-700 font-medium">
            <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
            {job.workplaceType.replace('_', ' ')}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/70 font-medium">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {job.employmentType.replace('_', ' ')}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-semibold">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </span>
        </div>

        {/* Short Description */}
        <p className="mt-4 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Footer: Date & Details Button */}
      <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors gap-1"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};
