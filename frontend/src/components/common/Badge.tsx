import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    primary: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/60',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'APPLIED':
      return <Badge variant="info">Applied</Badge>;
    case 'UNDER_REVIEW':
      return <Badge variant="warning">Under Review</Badge>;
    case 'SHORTLISTED':
      return <Badge variant="primary">Shortlisted</Badge>;
    case 'SELECTED':
      return <Badge variant="success">Selected / Offer</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">Not Selected</Badge>;
    case 'WITHDRAWN':
      return <Badge variant="neutral">Withdrawn</Badge>;
    case 'PUBLISHED':
      return <Badge variant="success">Active</Badge>;
    case 'DRAFT':
      return <Badge variant="neutral">Draft</Badge>;
    case 'CLOSED':
      return <Badge variant="danger">Closed</Badge>;
    case 'ARCHIVED':
      return <Badge variant="neutral">Archived</Badge>;
    case 'APPROVED':
      return <Badge variant="success">Approved</Badge>;
    case 'PENDING':
      return <Badge variant="warning">Pending Moderation</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};
