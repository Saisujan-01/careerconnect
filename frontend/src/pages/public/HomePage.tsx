import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Code2,
  Database,
  Palette,
  Megaphone,
  CircleDollarSign,
  Users2,
  Headphones,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Building,
  UserCheck,
  Star,
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import { Job } from '../../types';
import { JobCard } from '../../components/jobs/JobCard';
import { JobCardSkeleton } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const jobs = await jobService.getFeaturedJobs();
        setFeaturedJobs(jobs);
      } catch {
        // Fallback
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (location.trim()) params.append('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const categories = [
    { title: 'Software Development', icon: Code2, count: '350+ openings', color: 'from-blue-500 to-indigo-600' },
    { title: 'Data Science', icon: Database, count: '180+ openings', color: 'from-indigo-500 to-purple-600' },
    { title: 'Design', icon: Palette, count: '120+ openings', color: 'from-pink-500 to-rose-600' },
    { title: 'Marketing', icon: Megaphone, count: '95+ openings', color: 'from-amber-500 to-orange-600' },
    { title: 'Finance', icon: CircleDollarSign, count: '140+ openings', color: 'from-emerald-500 to-teal-600' },
    { title: 'Human Resources', icon: Users2, count: '80+ openings', color: 'from-violet-500 to-purple-600' },
    { title: 'Sales', icon: TrendingUp, count: '160+ openings', color: 'from-sky-500 to-blue-600' },
    { title: 'Customer Support', icon: Headphones, count: '90+ openings', color: 'from-cyan-500 to-teal-600' },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold tracking-wide">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
              Modern Recruitment SaaS Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Discover Opportunities. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
                Build Your Future.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              CareerConnect seamlessly bridges high-impact talent with progressive engineering, product, and leadership teams.
            </p>

            {/* Job Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 p-2.5 sm:p-3 bg-white rounded-2xl shadow-xl shadow-indigo-100/70 border border-slate-200/80 flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto"
            >
              <div className="relative flex-1 w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Job title, skills (e.g. Java, React, DevOps)..."
                  className="w-full rounded-xl pl-10 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="hidden md:block h-8 w-px bg-slate-200" />

              <div className="relative flex-1 w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location or 'Remote'..."
                  className="w-full rounded-xl pl-10 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full md:w-auto px-7 rounded-xl font-semibold shadow-md shadow-indigo-300"
              >
                Search Jobs
              </Button>
            </form>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Popular:</span>
              {['Java Developer', 'Frontend Developer', 'Data Analyst', 'Full Stack', 'Remote'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    navigate(`/jobs?keyword=${encodeURIComponent(tag)}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Platform Metric Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-center p-3">
            <p className="text-3xl font-extrabold text-indigo-600">2,500+</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Verified Vacancies</p>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <p className="text-3xl font-extrabold text-slate-900">1,200+</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Hiring Employers</p>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <p className="text-3xl font-extrabold text-indigo-600">45,000+</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Job Seekers</p>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <p className="text-3xl font-extrabold text-emerald-600">96%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Interview Match Rate</p>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section (Real DB Records) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Top Openings</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Featured Job Opportunities</h2>
            <p className="text-sm text-slate-500 mt-1">Hand-picked active roles from verified industry recruiters.</p>
          </div>
          <Link to="/jobs">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore All Jobs
            </Button>
          </Link>
        </div>

        {isLoadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Career Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Popular Fields</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Browse by Career Category</h2>
          <p className="text-sm text-slate-500 mt-1">Explore specialized sectors aligned with your expertise.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                to={`/jobs?category=${encodeURIComponent(cat.title)}`}
                className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${cat.color} text-white shadow-sm mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Effortless Process</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">How CareerConnect Works</h2>
            <p className="text-sm text-slate-500 mt-1">Three streamlined steps from discovering a vacancy to signing your offer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-md shadow-indigo-200">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Build Your Candidate Profile</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Add your skills, work history, and upload your resume in PDF/DOCX format. Profile completion indicators guide you to standout quality.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white font-bold text-lg shadow-md shadow-violet-200">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Explore & Filter Matches</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter by workplace type, salary brackets, experience level, and industry. Receive intelligent job suggestions matched to your skill set.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-md shadow-emerald-200">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Apply & Track Status Live</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Submit applications with a personalized cover letter. Track your review progression in real time as recruiters shortlist and extend offers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Illustrative Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Candidate & Employer Stories</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Loved by Candidates & Teams</h2>
          <p className="text-xs text-slate-400 mt-1">(Illustrative sample feedback from platform pilot users)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-600 italic">
              "CareerConnect's direct application tracking gave me complete clarity on each stage. I received my Senior Java role offer within 2 weeks."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                AM
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Alex Morgan</p>
                <p className="text-xs text-slate-400">Software Engineer</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-600 italic">
              "The applicant status pipeline and resume authorization workflow makes managing hundreds of tech applicants straightforward and secure."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="h-9 w-9 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs">
                SJ
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Sarah Jenkins</p>
                <p className="text-xs text-slate-400">Lead Recruiter at TechCorp</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-600 italic">
              "Super clean interface without clutter. The filtering options by remote workplace and salary bracket saved hours during job searches."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                PS
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Priya Sharma</p>
                <p className="text-xs text-slate-400">Data Scientist</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter / Employer CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              For Growing Organizations
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Hiring top-tier engineering or product talent?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Post job openings, review candidate portfolios, manage application progression pipelines, and schedule interviews with verified professionals.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md">
                  Post a Job Opening
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-slate-700 text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl">
                  Contact Sales Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
