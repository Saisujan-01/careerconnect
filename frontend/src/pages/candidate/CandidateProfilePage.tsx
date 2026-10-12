import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Link2, Globe, CheckCircle2, Sparkles } from 'lucide-react';
import { candidateService, ProfileFormData } from '../../services/candidateService';
import { CandidateProfile } from '../../types';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export const CandidateProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<ProfileFormData>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await candidateService.getProfile();
        setProfile(data);
        reset({
          phone: data.phone || '',
          location: data.location || '',
          headline: data.headline || '',
          summary: data.summary || '',
          skills: data.skills || '',
          education: data.education || '',
          experience: data.experience || '',
          linkedinUrl: data.linkedinUrl || '',
          portfolioUrl: data.portfolioUrl || '',
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (values: ProfileFormData) => {
    setIsSaving(true);
    try {
      const updated = await candidateService.updateProfile(values);
      setProfile(updated);
      toast.success('Profile saved successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading profile details...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-2xl shadow-md shadow-indigo-100">
            {profile.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{profile.fullName}</h1>
            <p className="text-sm text-slate-500">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Job Seeker
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {profile.completionPercentage}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Completion Meter */}
        <div className="w-full sm:w-48 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Profile Strength</span>
            <span className="text-indigo-600 font-bold">{profile.completionPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${profile.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Professional Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-600" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Professional Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Java & React Developer"
                {...register('headline')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA or Remote"
                {...register('location')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+1 (555) 012-3456"
                {...register('phone')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Key Skills (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="Java, Spring Boot, React, TypeScript, MySQL, Docker"
                {...register('skills')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Professional Summary
            </label>
            <textarea
              rows={4}
              placeholder="Highlight your key achievements, years of experience, core technologies, and goals..."
              {...register('summary')}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Education & Experience */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            Background & Qualifications
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Experience History
              </label>
              <textarea
                rows={4}
                placeholder="Company, Role, Dates, and core impact delivered..."
                {...register('experience')}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Education & Certifications
              </label>
              <textarea
                rows={3}
                placeholder="Degree, University, Graduation Year, Licenses..."
                {...register('education')}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Social & Portfolio Links */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-600" />
            Web & Portfolio Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                {...register('linkedinUrl')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Personal Portfolio or GitHub URL
              </label>
              <input
                type="url"
                placeholder="https://myportfolio.dev"
                {...register('portfolioUrl')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            className="rounded-xl px-8 shadow-md shadow-indigo-200"
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
