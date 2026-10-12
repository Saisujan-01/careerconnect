import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Briefcase, DollarSign, Calendar, MapPin } from 'lucide-react';
import { jobService, JobFormData } from '../../services/jobService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

const jobFormSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  workplaceType: z.enum(['ON_SITE', 'HYBRID', 'REMOTE']),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  experienceLevel: z.string().optional(),
  salaryMin: z.coerce.number().positive().optional().or(z.literal('')),
  salaryMax: z.coerce.number().positive().optional().or(z.literal('')),
  salaryCurrency: z.string().default('USD'),
  isSalaryNegotiable: z.boolean().default(false),
  applicationDeadline: z.string().optional(),
  description: z.string().min(20, 'Please provide a comprehensive job overview (minimum 20 characters)'),
  responsibilities: z.string().optional(),
  skillsRequired: z.string().optional(),
  qualifications: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export const JobFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      category: 'Software Development',
      location: 'San Francisco, CA',
      workplaceType: 'HYBRID',
      employmentType: 'FULL_TIME',
      experienceLevel: 'Mid Level',
      salaryCurrency: 'USD',
      isSalaryNegotiable: false,
      description: '',
      responsibilities: '',
      skillsRequired: '',
      qualifications: '',
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      jobService
        .getJobById(Number(id))
        .then((data) => {
          reset({
            title: data.title,
            category: data.category,
            location: data.location,
            workplaceType: data.workplaceType,
            employmentType: data.employmentType,
            experienceLevel: data.experienceLevel || 'Mid Level',
            salaryMin: data.salaryMin || '',
            salaryMax: data.salaryMax || '',
            salaryCurrency: data.salaryCurrency || 'USD',
            isSalaryNegotiable: !!data.isSalaryNegotiable,
            applicationDeadline: data.applicationDeadline || '',
            description: data.description,
            responsibilities: data.responsibilities || '',
            skillsRequired: data.skillsRequired || '',
            qualifications: data.qualifications || '',
          });
        })
        .catch(() => {
          toast.error('Failed to load job details');
          navigate('/recruiter/jobs');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditMode, reset, navigate]);

  const onSubmit = async (values: JobFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: JobFormData = {
        title: values.title,
        category: values.category,
        location: values.location,
        workplaceType: values.workplaceType,
        employmentType: values.employmentType,
        experienceLevel: values.experienceLevel,
        salaryMin: values.salaryMin ? Number(values.salaryMin) : undefined,
        salaryMax: values.salaryMax ? Number(values.salaryMax) : undefined,
        salaryCurrency: values.salaryCurrency,
        isSalaryNegotiable: values.isSalaryNegotiable,
        applicationDeadline: values.applicationDeadline || undefined,
        description: values.description,
        responsibilities: values.responsibilities,
        skillsRequired: values.skillsRequired,
        qualifications: values.qualifications,
      };

      if (isEditMode && id) {
        await jobService.updateJob(Number(id), payload);
        toast.success('Job posting updated successfully!');
      } else {
        await jobService.createJob(payload);
        toast.success('Job posting created and published!');
      }
      navigate('/recruiter/jobs');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 text-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto mb-3" />
        Loading posting details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-violet-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my postings
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Job Posting' : 'Create New Job Posting'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provide comprehensive position details to attract qualified candidates.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Job Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Java Cloud Engineer"
                {...register('title')}
                className={`w-full rounded-xl border p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  errors.title ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Job Category *
              </label>
              <select
                {...register('category')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="Software Development">Software Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales">Sales</option>
                <option value="Customer Support">Customer Support</option>
              </select>
            </div>
          </div>

          {/* Location & Workplace */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location *
              </label>
              <input
                type="text"
                placeholder="San Francisco, CA or Remote"
                {...register('location')}
                className={`w-full rounded-xl border p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  errors.location ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Workplace Type *
              </label>
              <select
                {...register('workplaceType')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
                <option value="ON_SITE">On-Site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Employment Type *
              </label>
              <select
                {...register('employmentType')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>

          {/* Salary & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Minimum Salary ($)
              </label>
              <input
                type="number"
                placeholder="100000"
                {...register('salaryMin')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Maximum Salary ($)
              </label>
              <input
                type="number"
                placeholder="140000"
                {...register('salaryMax')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                {...register('applicationDeadline')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Experience Level & Required Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Experience Level
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Level (4+ years)"
                {...register('experienceLevel')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Required Skills (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="Java 21, Spring Boot, MySQL, Docker, React"
                {...register('skillsRequired')}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Detailed Text Sections */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Job Description / Overview *
            </label>
            <textarea
              rows={5}
              placeholder="Outline the mission of the team, role objectives, and daily scope..."
              {...register('description')}
              className={`w-full rounded-xl border p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                errors.description ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Key Responsibilities (One per line)
            </label>
            <textarea
              rows={4}
              placeholder="Architect robust REST APIs in Java Spring Boot&#10;Optimize database query performance&#10;Collaborate in agile sprints"
              {...register('responsibilities')}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Qualifications & Education
            </label>
            <textarea
              rows={3}
              placeholder="Bachelor's degree in Computer Science or equivalent hands-on experience..."
              {...register('qualifications')}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/recruiter/jobs">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="bg-violet-600 hover:bg-violet-700 rounded-xl px-8 shadow-md shadow-violet-200"
            >
              {isEditMode ? 'Update Posting' : 'Publish Job Posting'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
