import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Github, Linkedin, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Career<span className="text-indigo-600">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Enterprise recruitment platform bridging world-class talent with leading engineering and product teams.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-600 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-slate-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-slate-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/jobs" className="hover:text-indigo-600 transition-colors">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-indigo-600 transition-colors">
                  Browse Companies
                </Link>
              </li>
              <li>
                <Link to="/jobs?category=Software+Development" className="hover:text-indigo-600 transition-colors">
                  Software Engineering
                </Link>
              </li>
              <li>
                <Link to="/jobs?workplaceType=REMOTE" className="hover:text-indigo-600 transition-colors">
                  Remote Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-4">Employers</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/register" className="hover:text-indigo-600 transition-colors">
                  Post a Job Opening
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-600 transition-colors">
                  Recruiter Sign In
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-indigo-600 transition-colors">
                  Recruitment Solutions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-600 transition-colors">
                  Request Enterprise Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-4">Platform & Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-indigo-600 transition-colors">
                  About CareerConnect
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-600 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Systems Operational
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareerConnect Inc. Built for Java Full Stack Architecture Demo.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> using Java 21, Spring Boot 3 & React
          </p>
        </div>
      </div>
    </footer>
  );
};
