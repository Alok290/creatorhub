import React from 'react';
import { ApplicationStatus, CampaignStatus, PaymentStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus | CampaignStatus | PaymentStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'ACTIVE':
    case 'ACCEPTED':
    case 'PAID':
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'COMPLETED':
      color = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'APPLIED':
    case 'PENDING':
    case 'ESCROWED':
      color = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'CHANGES_REQUESTED':
      color = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      break;
    case 'IN_PROGRESS':
    case 'DELIVERABLES_SUBMITTED':
      color = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'REJECTED':
    case 'CANCELLED':
    case 'CLOSED':
      color = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'PAUSED':
      color = 'bg-gray-100 text-gray-700 border-gray-200';
      break;
  }

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {formatText(status)}
    </span>
  );
};

