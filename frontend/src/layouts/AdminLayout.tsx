import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Briefcase,
  Building2,
  FileText,
  LogOut,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: ShieldAlert },
    { label: 'User Governance', path: '/admin/users', icon: Users },
    { label: 'Job Moderation', path: '/admin/jobs', icon: Briefcase },
    { label: 'Companies Registry', path: '/admin/companies', icon: Building2 },
    { label: 'Platform Applications', path: '/admin/applications', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 text-white">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white font-bold">
            <Briefcase className="h-4 w-4" />
          </div>
          <span className="font-bold">CareerConnect Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar (Dark themed for administrative distinction) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-1/2 md:translate-x-0 hidden md:flex'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-sm shadow-indigo-500/20">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-white">
                Career<span className="text-indigo-400">Connect</span>
              </span>
            </Link>
          </div>

          {/* Admin Tag */}
          <div className="p-4 mx-3 my-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-sm">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-indigo-400 font-medium">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <Link
            to="/jobs"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-colors"
          >
            <Compass className="h-4 w-4" />
            Public Portal View
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
