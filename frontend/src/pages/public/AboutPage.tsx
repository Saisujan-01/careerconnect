import React from 'react';
import { Briefcase, Code, ShieldCheck, Database, Layers, CheckCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
          About The Platform
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Architected for Production Recruitment
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          CareerConnect is a modern, full-stack recruitment portal engineered as a capstone project for Java Full Stack Development training.
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Code className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Modern Frontend</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Built with React 18, TypeScript, Tailwind CSS, Vite, and React Router. Featuring type-safe forms, Recharts metrics, and responsive SaaS design tokens.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Java 21 & Spring Boot 3</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Stateless JWT authentication, BCrypt password hashing, Spring Security role hierarchies, and layered clean architecture (Controllers, Services, Repositories).
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Relational Database</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Relational schema with foreign keys, unique constraints, Flyway database version control, and multi-step transaction integrity.
          </p>
        </div>
      </div>

      {/* Feature Checklist */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Demonstrated Engineering Capabilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
          {[
            'Stateless JWT access tokens with role enforcement',
            'Full job search engine with multi-facet filtering',
            'Candidate resume uploads with traversal protection',
            'Profile completion scoring with real database attributes',
            'Recruiter candidate pipeline management & audit histories',
            'Duplicate application & withdrawal constraint prevention',
            'Admin dashboard metrics with real database calculations',
            'Unit and integration tests with JUnit 5 & MockMvc',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
