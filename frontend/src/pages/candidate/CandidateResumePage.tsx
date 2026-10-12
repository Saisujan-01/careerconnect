import React, { useEffect, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Download, Trash2 } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { CandidateProfile } from '../../types';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export const CandidateResumePage: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await candidateService.getProfile();
      setProfile(data);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (10 MB = 10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File exceeds maximum allowed size (10 MB).');
      return;
    }

    // Check extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      toast.error('Only PDF and DOCX files are permitted.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const updated = await candidateService.uploadResume(selectedFile);
      setProfile(updated);
      setSelectedFile(null);
      toast.success('Resume uploaded and verified successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Resume upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 text-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-3" />
        Loading resume settings...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resume & Documents</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Attach your standardized PDF or Word resume used for one-click job applications.
        </p>
      </div>

      {/* Current Active Resume Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          Active Primary Resume
        </h2>

        {profile?.resumeFilePath ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {profile.resumeFileName || 'Resume.pdf'}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified Document
                  </span>
                  <span>•</span>
                  <span>Ready for 1-click apply</span>
                </div>
              </div>
            </div>

            <a
              href={`/api/files/download/${profile.resumeFilePath}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" variant="outline" leftIcon={<Download className="h-4 w-4" />}>
                Download Document
              </Button>
            </a>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
            <h3 className="text-sm font-bold text-amber-900">No Resume Uploaded</h3>
            <p className="text-xs text-amber-700 max-w-sm mx-auto">
              You haven't uploaded an active resume yet. Upload one below to apply to jobs without needing to upload every time.
            </p>
          </div>
        )}
      </div>

      {/* Upload New Resume */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Upload className="h-5 w-5 text-indigo-600" />
          Upload New Version
        </h2>

        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
          <input
            type="file"
            id="resumeUpload"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="resumeUpload" className="cursor-pointer block space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Click to browse or drag and drop your document
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: PDF or DOCX (Maximum file size: 10 MB)
              </p>
            </div>
          </label>

          {selectedFile && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between text-left">
              <div>
                <p className="text-xs font-semibold text-indigo-900">{selectedFile.name}</p>
                <p className="text-[11px] text-indigo-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpload}
                isLoading={isUploading}
              >
                Upload File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
