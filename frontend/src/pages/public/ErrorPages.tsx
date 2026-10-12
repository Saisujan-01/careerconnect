import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">403 — Access Denied</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          You do not have the required permissions or role privileges to view this page.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="outline" size="sm" className="w-full sm:w-auto" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Return Home
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              Switch Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <span className="text-6xl font-black text-indigo-600 block">404</span>
        <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          The page you are trying to access does not exist or may have been relocated.
        </p>
        <div className="pt-4">
          <Link to="/">
            <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
