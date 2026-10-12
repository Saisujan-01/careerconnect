import React, { useEffect, useState } from 'react';
import { Bookmark, Search } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { Job, PagedResponse } from '../../types';
import { JobCard } from '../../components/jobs/JobCard';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const CandidateSavedJobsPage: React.FC = () => {
  const [savedData, setSavedData] = useState<PagedResponse<Job>>({
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    isLast: true,
  });
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedJobs = async (pageNum = 0) => {
    setIsLoading(true);
    try {
      const data = await candidateService.getSavedJobs(pageNum, 10);
      setSavedData(data);
    } catch {
      toast.error('Failed to load saved jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs(page);
  }, [page]);

  const handleSaveToggle = (jobId: number, isSaved: boolean) => {
    if (!isSaved) {
      // Remove from list locally
      setSavedData((prev) => ({
        ...prev,
        content: prev.content.filter((j) => j.id !== jobId),
        totalElements: Math.max(0, prev.totalElements - 1),
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Jobs</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Review bookmarked vacancies and apply when you are ready.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-3" />
          Loading your saved jobs...
        </div>
      ) : savedData.content.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-10 w-10 text-slate-400" />}
          title="No saved jobs yet"
          description="Browse open roles and click the bookmark icon on any job card to save it for later."
          actionText="Browse Open Jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedData.content.map((job) => (
              <JobCard key={job.id} job={job} onSaveToggle={handleSaveToggle} />
            ))}
          </div>

          <Pagination
            currentPage={savedData.page}
            totalPages={savedData.totalPages}
            totalElements={savedData.totalElements}
            pageSize={savedData.size}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};
