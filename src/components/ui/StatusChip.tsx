import React from 'react';

interface StatusChipProps {
  status: string;
  minute?: number;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, minute, className = '' }) => {
  switch (status) {
    case 'IN_PLAY':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E90052] text-white shadow-sm ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          {minute ? `${minute}'` : 'LIVE'}
        </span>
      );
    case 'PAUSED':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider border border-[#B9A9BB]/40 text-[#B9A9BB] ${className}`}>
          HT
        </span>
      );
    case 'POSTPONED':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider bg-white/10 text-[#B9A9BB] ${className}`}>
          PPD
        </span>
      );
    case 'SUSPENDED':
    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider bg-[#E90052]/20 text-[#E90052] ${className}`}>
          {status}
        </span>
      );
    case 'FINISHED':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide bg-white/5 text-[#B9A9BB] ${className}`}>
          FT
        </span>
      );
    default:
      return null;
  }
};
