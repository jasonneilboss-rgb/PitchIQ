import React from 'react';
import { RateLimitBanner } from '../ui/RateLimitBanner';
import { StalenessBar } from '../ui/StalenessBar';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  onRefresh?: () => void;
  isFetching?: boolean;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  subtitle,
  action,
  onRefresh,
  isFetching,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between pb-20 md:pb-10">
      <div>
        <RateLimitBanner />
        <StalenessBar onRefresh={onRefresh} isFetching={isFetching} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {(title || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
              <div>
                {title && (
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans uppercase">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-[#B9A9BB] mt-0.5 tracking-wide">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && <div className="flex items-center gap-2">{action}</div>}
            </div>
          )}

          {children}
        </main>
      </div>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 py-6 border-t border-white/5 text-center text-xs text-[#B9A9BB]">
        <p className="font-medium text-white/80">
          GaffersEdge &bull; Premier League Personal Intelligence &bull; Season 2026/27
        </p>
        <p className="mt-1 text-[11px] text-[#B9A9BB]/80 italic">
          Personal analysis only. Not betting advice.
        </p>
      </footer>
    </div>
  );
};
