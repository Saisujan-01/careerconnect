import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Briefcase,
  DollarSign,
  Building,
  RotateCcw,
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import { Job, PagedResponse } from '../../types';
import { JobCard } from '../../components/jobs/JobCard';
import { JobCardSkeleton } from '../../components/common/Skeleton';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';

export const JobListingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States initialized from URL params
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [workplaceType, setWorkplaceType] = useState(searchParams.get('workplaceType') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));

  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [jobsData, setJobsData] = useState<PagedResponse<Job> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    jobService.getCategories().then(setCategoriesList).catch(() => {});
  }, []);

  // Fetch jobs whenever query changes
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await jobService.searchJobs({
        keyword: keyword || undefined,
        location: location || undefined,
        category: category || undefined,
        workplaceType: workplaceType || undefined,
        employmentType: employmentType || undefined,
        minSalary: minSalary ? Number(minSalary) : undefined,
        sortBy,
        page,
        size: 9,
      });
      setJobsData(data);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, [keyword, location, category, workplaceType, employmentType, minSalary, sortBy, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Synchronize state back to URL searchParams
  const updateUrlParams = (newParams: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) {
        nextParams.set(k, v);
      } else {
        nextParams.delete(k);
      }
    });
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    updateUrlParams({
      keyword,
      location,
      category,
      workplaceType,
      employmentType,
      minSalary,
      sortBy,
      page: '0',
    });
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setCategory('');
    setWorkplaceType('');
    setEmploymentType('');
    setMinSalary('');
    setSortBy('newest');
    setPage(0);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = [
    category,
    workplaceType,
    employmentType,
    minSalary,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Main Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explore Open Job Vacancies
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search verified positions across technology, finance, design, and product engineering.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by job title, skills, or company name..."
              className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative md:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <MapPin className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State, or 'Remote'"
              className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Button type="submit" variant="primary" className="rounded-xl px-6">
            Find Jobs
          </Button>

          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </form>
      </div>

      {/* Main Grid: Sidebar Filters + Job Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside
          className={`lg:block ${
            showMobileFilters ? 'block' : 'hidden'
          } bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 h-fit`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              Filter Results
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset All
              </button>
            )}
          </div>

          {/* Job Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
                updateUrlParams({ category: e.target.value, page: '0' });
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Workplace Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Workplace
            </label>
            <div className="space-y-1.5">
              {[
                { label: 'All Workplaces', value: '' },
                { label: 'Remote', value: 'REMOTE' },
                { label: 'Hybrid', value: 'HYBRID' },
                { label: 'On-Site', value: 'ON_SITE' },
              ].map((item) => (
                <label
                  key={item.value}
                  className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="workplaceType"
                    checked={workplaceType === item.value}
                    onChange={() => {
                      setWorkplaceType(item.value);
                      setPage(0);
                      updateUrlParams({ workplaceType: item.value, page: '0' });
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Employment Type
            </label>
            <div className="space-y-1.5">
              {[
                { label: 'All Types', value: '' },
                { label: 'Full-time', value: 'FULL_TIME' },
                { label: 'Part-time', value: 'PART_TIME' },
                { label: 'Contract', value: 'CONTRACT' },
                { label: 'Internship', value: 'INTERNSHIP' },
              ].map((item) => (
                <label
                  key={item.value}
                  className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="employmentType"
                    checked={employmentType === item.value}
                    onChange={() => {
                      setEmploymentType(item.value);
                      setPage(0);
                      updateUrlParams({ employmentType: item.value, page: '0' });
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Salary Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Minimum Salary ($/yr)
            </label>
            <select
              value={minSalary}
              onChange={(e) => {
                setMinSalary(e.target.value);
                setPage(0);
                updateUrlParams({ minSalary: e.target.value, page: '0' });
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Any Salary</option>
              <option value="60000">$60,000+ / yr</option>
              <option value="90000">$90,000+ / yr</option>
              <option value="120000">$120,000+ / yr</option>
              <option value="150000">$150,000+ / yr</option>
            </select>
          </div>
        </aside>

        {/* Results Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Sort & Results Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-sm">
            <p className="text-slate-600">
              Found{' '}
              <span className="font-bold text-slate-900">
                {jobsData?.totalElements ?? 0}
              </span>{' '}
              open positions
            </p>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(0);
                  updateUrlParams({ sortBy: e.target.value, page: '0' });
                }}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="salaryHigh">Salary: High to Low</option>
                <option value="salaryLow">Salary: Low to High</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Job Cards or Loading / Empty states */}
          {isLoading ? (
            <div className="space-y-4">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          ) : !jobsData || jobsData.content.length === 0 ? (
            <EmptyState
              title="No jobs matching your criteria"
              description="Try adjusting your keyword, relaxing salary requirements, or clearing active filters."
              actionText="Reset All Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="space-y-4">
              {jobsData.content.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}

              <Pagination
                currentPage={jobsData.page}
                totalPages={jobsData.totalPages}
                totalElements={jobsData.totalElements}
                pageSize={jobsData.size}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
