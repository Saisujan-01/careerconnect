import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Lock, Mail, Briefcase, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const user = await login({ email: values.email || '', password: values.password || '' });
      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch {
      // Error toast handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click quick login demo helper
  const handleQuickDemo = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
    onSubmit({ email, password: pass });
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-100">
              <Briefcase className="h-6 w-6" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Welcome back to CareerConnect
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your recruitment portal or candidate dashboard.
          </p>
        </div>

        {/* 1-Click Demo Accounts Pill Bar (Essential for Technical Training Presentations) */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            Quick Demo Accounts (1-Click Sign In)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('candidate.alex@example.com', 'Candidate@123')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-indigo-200/80 hover:border-indigo-400 hover:shadow-sm text-center transition-all group"
            >
              <UserCheck className="h-4 w-4 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-800">Candidate</span>
              <span className="text-[10px] text-slate-400">Alex Morgan</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('recruiter.sarah@techcorp.com', 'Recruiter@123')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-indigo-200/80 hover:border-indigo-400 hover:shadow-sm text-center transition-all group"
            >
              <Briefcase className="h-4 w-4 text-violet-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-800">Recruiter</span>
              <span className="text-[10px] text-slate-400">TechCorp</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin@careerconnect.com', 'Admin@123')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-indigo-200/80 hover:border-indigo-400 hover:shadow-sm text-center transition-all group"
            >
              <ShieldCheck className="h-4 w-4 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-800">Admin</span>
              <span className="text-[10px] text-slate-400">Platform</span>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className={`w-full rounded-xl border pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    errors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full rounded-xl border pl-9 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    errors.password ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 rounded-xl shadow-md shadow-indigo-200"
              isLoading={isSubmitting}
            >
              Sign In to Account
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
