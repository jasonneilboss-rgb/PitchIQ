import React from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface StalenessBarProps {
  onRefresh?: () => void;
  isFetching?: boolean;
}

export const StalenessBar: React.FC<StalenessBarProps> = ({ onRefresh, isFetching }) => {
  const isStale = useAppStore((s) => s.isStaleData);

  if (!isStale) return null;

  return (
    <div className="bg-[#4A0050]/80 border-b border-[#04F5FF]/20 px-4 py-2 text-xs text-[#B9A9BB] flex items-center justify-between backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <CloudOff className="w-3.5 h-3.5 text-[#04F5FF] shrink-0" />
        <span>
          <strong className="text-white font-medium">Cached EPL Data:</strong> Showing cached 2026/27 intelligence. Live sync paused or offline.
        </span>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="flex items-center gap-1 text-[#04F5FF] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      )}
    </div>
  );
};
