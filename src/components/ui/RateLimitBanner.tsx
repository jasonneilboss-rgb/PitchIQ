import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const RateLimitBanner: React.FC = () => {
  const countdown = useAppStore((s) => s.rateLimitCountdown);

  if (!countdown) return null;

  return (
    <div className="bg-[#E90052]/20 border-b border-[#E90052]/40 px-4 py-2 text-xs text-white flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[#E90052] shrink-0" />
        <span>
          <strong className="font-semibold text-[#E90052]">API Rate Limit (429):</strong> Football-Data free tier quota reached (10 req/min). Serving cached data.
        </span>
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[#04F5FF] font-semibold bg-[#2B002E] px-2.5 py-0.5 rounded-full border border-white/10">
        <Clock className="w-3 h-3 text-[#04F5FF]" />
        <span>{countdown}s remaining</span>
      </div>
    </div>
  );
};
