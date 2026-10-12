import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Globe, ArrowLeft, Briefcase } from 'lucide-react';
import { companyService, CompanyDetailResponse } from '../../services/companyService';
import { JobCard } from '../../components/jobs/JobCard';
import { Button } from '../../components/common/Button';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CompanyDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      try {
        const res = await companyService.getCompanyById(Number(id));
        setData(res);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-3" />
        Loading company details...
      </div>
    );
  }

  if (!data || !data.company) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Company Not Found</h2>
        <Link to="/companies">
          <Button variant="primary">Browse All Companies</Button>
        </Link>
      </div>
    );
  }

  const { company, activeJobs, totalJobsCount } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/companies"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all companies
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-2xl shadow-md">
            {company.logoUrl && company.logoUrl.length <= 4
              ? company.logoUrl
              : company.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {company.name}
            </h1>
            <p className="text-sm font-semibold text-indigo-600">{company.industry}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {company.location || 'Multiple Locations'}
              </span>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {company.website}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="sm:text-right">
          <span className="text-xs text-slate-400 block font-medium">Active Openings</span>
          <span className="text-2xl font-black text-slate-900">{totalJobsCount}</span>
        </div>
      </div>

      {/* About Company & Open Vacancies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm h-fit space-y-3">
          <h2 className="text-base font-bold text-slate-900">About {company.name}</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {company.description || 'Enterprise employer partnering with CareerConnect for tech hiring.'}
          </p>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-600" />
            Open Vacancies at {company.name} ({activeJobs.length})
          </h2>

          {activeJobs.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
              No open vacancies currently listed for this employer.
            </div>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
