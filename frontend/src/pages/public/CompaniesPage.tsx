import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Globe, Search } from 'lucide-react';
import { companyService } from '../../services/companyService';
import { CompanySummary, PagedResponse } from '../../types';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';

export const CompaniesPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [companiesData, setCompaniesData] = useState<PagedResponse<CompanySummary>>({
    content: [],
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    isLast: true,
  });
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = async (searchKw = '', pageNum = 0) => {
    setIsLoading(true);
    try {
      const data = await companyService.getCompanies(searchKw || undefined, pageNum, 12);
      setCompaniesData(data);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(keyword, page);
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchCompanies(keyword, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Top Hiring Companies
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover verified companies hiring across technology, product, and data intelligence.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search companies by name or industry..."
              className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-3" />
          Loading company profiles...
        </div>
      ) : companiesData.content.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-10 w-10 text-slate-400" />}
          title="No companies found"
          description="Try a different search keyword or clear filters."
          actionText="Clear Search"
          onAction={() => {
            setKeyword('');
            fetchCompanies('', 0);
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companiesData.content.map((company) => (
              <div
                key={company.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-lg shadow-sm">
                      {company.logoUrl && company.logoUrl.length <= 4
                        ? company.logoUrl
                        : company.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">{company.name}</h3>
                      <p className="text-xs text-indigo-600 font-medium">{company.industry}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{company.location || 'Multiple Locations'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {company.description || 'Enterprise technology organization.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Website
                    </a>
                  ) : (
                    <span />
                  )}
                  <Link to={`/companies/${company.id}`}>
                    <Button variant="outline" size="sm">
                      View Profile →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={companiesData.page}
            totalPages={companiesData.totalPages}
            totalElements={companiesData.totalElements}
            pageSize={companiesData.size}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};
