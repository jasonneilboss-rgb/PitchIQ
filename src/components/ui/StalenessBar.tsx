import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface StalenessBarProps {
  onRefresh?: () => void;
  isFetching?: boolean;
}

export const StalenessBar: React.FC<StalenessBarProps> = ({ onRefresh, isFetching }) => {
  const isStale = useAppStore((s) => s.isStaleData);
  const staleReason = useAppStore((s) => s.staleReason);

  // If not stale: Hide the banner entirely
  if (!isStale) return null;

  const useMock = import.meta.env.VITE_USE_MOCK === 'true';
  const apiKey = import.meta.env.VITE_FOOTBALL_DATA_KEY;

  let message = '⚠ Live sync failed — showing cached data · Tap to retry';
  let isRetryable = true;

  if (useMock || staleReason === 'mock_mode') {
    message = '⚠ Mock mode active — showing sample data';
    isRetryable = false;
  } else if (!apiKey || staleReason === 'no_key') {
    message = '⚠ API key not configured — showing cached data';
    isRetryable = false;
  } else {
    // If isStale and API key present but request failed:
    message = '⚠ Live sync failed — showing cached data · Tap to retry';
    isRetryable = true;
  }

  const handleTriggerRefresh = () => {
    if (onRefresh && !isFetching) {
      onRefresh();
    }
  };

  return (
    <div
      onClick={isRetryable && onRefresh ? handleTriggerRefresh : undefined}
      className={`bg-[#4A0050]/90 border-b border-[#E90052]/30 px-4 py-2 text-xs text-[#B9A9BB] flex items-center justify-between backdrop-blur-sm ${
        isRetryable && onRefresh ? 'cursor-pointer hover:bg-[#4A0050]' : ''
      }`}
      role={isRetryable && onRefresh ? 'button' : undefined}
      tabIndex={isRetryable && onRefresh ? 0 : undefined}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-white/95">{message}</span>
      </div>
      {onRefresh && isRetryable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTriggerRefresh();
          }}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-[#04F5FF] hover:text-white transition-colors cursor-pointer disabled:opacity-50 font-medium"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

