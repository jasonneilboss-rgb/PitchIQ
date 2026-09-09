import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { CrestImage } from '../components/ui/CrestImage';
import { StatusChip } from '../components/ui/StatusChip';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { MatchDetailModal } from '../components/matches/MatchDetailModal';
import { useFixtures } from '../hooks/useFixtures';
import { useStandings } from '../hooks/useStandings';
import { useAppStore } from '../store/useAppStore';
import { formatToSAST, formatToLondonTime, formatMatchDateSAST } from '../utils/date';
import { Match } from '../types';

export const Matches: React.FC = () => {
  const { selectedMatchweek, setSelectedMatchweek, addRecentTeam } = useAppStore();
  const { data: standingsData } = useStandings();

  // Set default matchweek from standings response if available
  useEffect(() => {
    if (standingsData?.currentMatchday && !selectedMatchweek) {
      setSelectedMatchweek(standingsData.currentMatchday);
    }
  }, [standingsData, selectedMatchweek, setSelectedMatchweek]);

  const { data: fixturesData, isLoading, refetch, isFetching } = useFixtures(selectedMatchweek);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const matches = fixturesData?.matches || [];

  // Group fixtures under sticky date headers
  const groupedMatches = matches.reduce<Record<string, Match[]>>((acc, match) => {
    const dateKey = formatMatchDateSAST(match.utcDate);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {});

  return (
    <PageWrapper
      title="Fixtures & Results"
      subtitle="2026/27 English Premier League Schedule & Telemetry"
      onRefresh={refetch}
      isFetching={isFetching}
    >
      <div className="space-y-6">
        {/* Matchweek Horizontal Scrolling Chip Row (MW 1-38) */}
        <div className="bg-[#4A0050] rounded-2xl p-3 border border-white/5 shadow-md">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {Array.from({ length: 38 }, (_, i) => i + 1).map((mw) => {
              const isActive = mw === selectedMatchweek;
              return (
                <button
                  key={mw}
                  onClick={() => setSelectedMatchweek(mw)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#E90052] text-white shadow-md shadow-[#E90052]/20 scale-105'
                      : 'bg-[#38003C] text-[#B9A9BB] hover:text-white hover:bg-[#38003C]/80'
                  }`}
                >
                  MW {mw}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fixtures List with Sticky Date Headers */}
        {isLoading ? (
          <div className="space-y-4">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
        ) : Object.keys(groupedMatches).length === 0 ? (
          <div className="bg-[#4A0050] rounded-2xl p-10 text-center text-[#B9A9BB]">
            No matches scheduled for Matchweek {selectedMatchweek}.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMatches).map(([dateHeader, matchList]) => (
              <div key={dateHeader} className="space-y-2">
                {/* Sticky Date Header */}
                <div className="sticky top-16 z-10 bg-[#2B002E]/95 backdrop-blur-sm py-2 px-3 border-l-2 border-[#E90052] flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#04F5FF]">
                    {dateHeader}
                  </span>
                  <span className="text-[11px] text-[#B9A9BB]">
                    {matchList.length} {matchList.length === 1 ? 'Fixture' : 'Fixtures'}
                  </span>
                </div>

                {/* Fixture Rows */}
                <div className="space-y-2">
                  {matchList.map((m) => {
                    const isFinished = m.status === 'FINISHED';
                    const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED';
                    const hasScore = m.score?.fullTime?.home !== null && m.score?.fullTime?.home !== undefined;

                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMatch(m);
                          addRecentTeam(m.homeTeam.tla);
                          addRecentTeam(m.awayTeam.tla);
                        }}
                        className={`bg-[#4A0050] hover:bg-[#4A0050]/80 rounded-2xl p-4 border transition-all cursor-pointer shadow-md flex items-center justify-between group ${
                          isLive
                            ? 'border-[#E90052] shadow-lg shadow-[#E90052]/10'
                            : 'border-white/5 hover:border-[#04F5FF]/30'
                        }`}
                      >
                        {/* Home Team */}
                        <div className="flex-1 flex items-center justify-end gap-3 text-right pr-2 sm:pr-4">
                          <span className="font-bold text-xs sm:text-sm text-white group-hover:text-[#04F5FF] transition-colors truncate">
                            {m.homeTeam.shortName || m.homeTeam.name}
                          </span>
                          <CrestImage tla={m.homeTeam.tla} alt={m.homeTeam.name} size="md" />
                        </div>

                        {/* Center Score / Kickoff Time (Fixed Width) */}
                        <div className="w-24 sm:w-28 text-center shrink-0 py-1 px-2 rounded-xl bg-[#38003C] border border-white/5">
                          {hasScore ? (
                            <div>
                              <div className="font-mono text-sm sm:text-base font-black text-white">
                                {m.score.fullTime.home} – {m.score.fullTime.away}
                              </div>
                              <span className="text-[10px] text-[#B9A9BB] uppercase">
                                {isFinished ? 'FT' : isLive ? 'LIVE' : ''}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <div className="font-mono text-xs sm:text-sm font-bold text-[#00FF85]">
                                {formatToSAST(m.utcDate, 'HH:mm')}
                              </div>
                              <span className="text-[9px] text-[#04F5FF] uppercase font-bold block">
                                SAST
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex items-center justify-start gap-3 text-left pl-2 sm:pr-4">
                          <CrestImage tla={m.awayTeam.tla} alt={m.awayTeam.name} size="md" />
                          <span className="font-bold text-xs sm:text-sm text-white group-hover:text-[#04F5FF] transition-colors truncate">
                            {m.awayTeam.shortName || m.awayTeam.name}
                          </span>
                        </div>

                        {/* Status Chip / Time subline */}
                        <div className="hidden sm:flex items-center justify-end w-20 shrink-0">
                          {isLive ? (
                            <StatusChip status={m.status} minute={m.minute} />
                          ) : isFinished ? (
                            <span className="text-[11px] font-mono text-[#B9A9BB]">
                              Finished
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#B9A9BB] font-mono">
                              {formatToLondonTime(m.utcDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </PageWrapper>
  );
};
