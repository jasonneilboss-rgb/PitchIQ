import React from 'react';

interface ConfidenceChipProps {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  className?: string;
}

export const ConfidenceChip: React.FC<ConfidenceChipProps> = ({ level, className = '' }) => {
  let color = 'bg-[#B9A9BB]/20 text-[#B9A9BB] border-[#B9A9BB]/30';

  if (level === 'HIGH') {
    color = 'bg-[#00FF85]/15 text-[#00FF85] border-[#00FF85]/40';
  } else if (level === 'MEDIUM') {
    color = 'bg-[#04F5FF]/15 text-[#04F5FF] border-[#04F5FF]/40';
  } else if (level === 'LOW') {
    color = 'bg-[#E90052]/15 text-[#E90052] border-[#E90052]/40';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase border ${color} ${className}`}
    >
      {level} CONFIDENCE
    </span>
  );
};
