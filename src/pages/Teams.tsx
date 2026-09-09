import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { CrestImage } from '../components/ui/CrestImage';
import { FormDots } from '../components/ui/FormDots';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { TeamDetailPanel } from '../components/teams/TeamDetailPanel';
import { useStandings } from '../hooks/useStandings';
import { useAppStore } from '../store/useAppStore';
import { CLUB_DATA } from '../constants/clubs';

export const Teams: React.FC = () => {
  const { data: standingsData, isLoading, refetch, isFetching } = useStandings();
  const { addRecentTeam } = useAppStore();
  const [selectedTla, setSelectedTla] = useState<string | null>(null);

  const table = standingsData?.standings?.[0]?.table || [];

  return (
    <PageWrapper
      title="Premier League Clubs"
      subtitle="2026/27 20-Club Profiles, Form Telemetry & Squads"
      onRefresh={refetch}
      isFetching={isFetching}
    >
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CLUB_DATA.map((club) => {
            const standing = table.find(
              (t) => t.team?.tla === club.tla || t.team?.name?.toLowerCase().includes(club.short.toLowerCase())
            );
            const rank = standing?.position ?? '-';
            const form = standing?.form || 'WWDWL';
            const points = standing?.points ?? 0;

            return (
              <div
                key={club.tla}
                onClick={() => {
                  setSelectedTla(club.tla);
                  addRecentTeam(club.tla);
                }}
                className="bg-[#4A0050] hover:bg-[#4A0050]/80 rounded-2xl p-4 transition-all cursor-pointer shadow-md hover:shadow-xl relative overflow-hidden group border border-white/5"
                style={{
                  borderLeft: `4px solid ${club.primary}`,
                }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <CrestImage tla={club.tla} alt={club.name} size="lg" className="group-hover:scale-105 transition-transform" />
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-black/40 text-[#00FF85] border border-white/5">
                    #{rank}
                  </span>
                </div>

                {/* Club Titles */}
                <div className="mb-3">
                  <h3 className="font-black text-sm sm:text-base text-white group-hover:text-[#04F5FF] transition-colors truncate uppercase font-sans">
                    {club.name}
                  </h3>
                  <p className="text-xs text-[#B9A9BB]">
                    {points} points &bull; 2026/27
                  </p>
                </div>

                {/* Form dots */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-[#B9A9BB] uppercase font-semibold">Form</span>
                  <FormDots form={form} count={5} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Detail Panel */}
      {selectedTla && (
        <TeamDetailPanel tla={selectedTla} onClose={() => setSelectedTla(null)} />
      )}
    </PageWrapper>
  );
};
