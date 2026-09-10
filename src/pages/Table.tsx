import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { CrestImage } from '../components/ui/CrestImage';
import { FormDots } from '../components/ui/FormDots';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { TeamDetailPanel } from '../components/teams/TeamDetailPanel';
import { useStandings } from '../hooks/useStandings';
import { useTopScorers } from '../hooks/useTopScorers';
import { useAppStore } from '../store/useAppStore';
import { Trophy, Award } from 'lucide-react';

export const Table: React.FC = () => {
  const { data: standingsData, isLoading, refetch, isFetching } = useStandings();
  const { data: scorersData } = useTopScorers();
  const { addRecentTeam } = useAppStore();
  const [selectedTla, setSelectedTla] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<'TOTAL' | 'HOME' | 'AWAY'>('TOTAL');

  // Table rows based on filter
  const standings = standingsData?.allStandings || standingsData?.standings || [];
  const selectedStandings = standings.find((s) => s.type === viewFilter) || standings[0];
  const tableRows = selectedStandings?.table || [];
  const topScorers = scorersData?.scorers || [];

  const getPositionBorderColor = (position: number) => {
    if (position <= 4) return 'border-l-4 border-l-[#00FF85]'; // Champions League
    if (position === 5) return 'border-l-4 border-l-[#04F5FF]'; // Europa League
    if (position === 6) return 'border-l-4 border-l-[#7B2D8E]'; // Conference League
    if (position >= 18) return 'border-l-4 border-l-[#E90052]'; // Relegation
    return 'border-l-4 border-l-transparent';
  };

  return (
    <PageWrapper
      title="Premier League Table"
      subtitle="2026/27 Official Standings, Qualification Zones & Golden Boot Race"
      onRefresh={refetch}
      isFetching={isFetching}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Standings Table (Span 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* View Filter Toggle (Overall / Home / Away) */}
          <div className="flex items-center justify-between bg-[#4A0050] rounded-2xl p-2.5 border border-white/5">
            <div className="flex items-center gap-2">
              {(['TOTAL', 'HOME', 'AWAY'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setViewFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    viewFilter === filter
                      ? 'bg-[#E90052] text-white shadow-md'
                      : 'text-[#B9A9BB] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {filter === 'TOTAL' ? 'Overall' : filter}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#B9A9BB]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00FF85]" /> UCL (1-4)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#04F5FF]" /> UEL (5)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E90052]" /> Rel (18-20)
              </span>
            </div>
          </div>

          {isLoading ? (
            <SkeletonCard lines={10} />
          ) : (
            <div className="bg-[#4A0050] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#38003C] text-[#B9A9BB] font-semibold border-b border-white/10 uppercase tracking-wider">
                      <th className="py-3 px-3 text-center w-10">Pos</th>
                      <th className="py-3 px-3">Club</th>
                      <th className="py-3 px-2 text-center w-8">P</th>
                      <th className="py-3 px-2 text-center w-8">W</th>
                      <th className="py-3 px-2 text-center w-8">D</th>
                      <th className="py-3 px-2 text-center w-8">L</th>
                      <th className="py-3 px-2 text-center w-9 hidden sm:table-cell">GF</th>
                      <th className="py-3 px-2 text-center w-9 hidden sm:table-cell">GA</th>
                      <th className="py-3 px-2 text-center w-10">GD</th>
                      <th className="py-3 px-3 text-center w-12 font-bold text-white">Pts</th>
                      <th className="py-3 px-4 text-center hidden md:table-cell">Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableRows.map((row) => (
                      <tr
                        key={row.position}
                        onClick={() => {
                          setSelectedTla(row.team.tla);
                          addRecentTeam(row.team.tla);
                        }}
                        className={`hover:bg-white/5 transition-colors cursor-pointer group ${getPositionBorderColor(
                          row.position
                        )}`}
                      >
                        <td className="py-3 px-3 text-center font-mono font-bold text-white/90">
                          {row.position}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <CrestImage
                              tla={row.team.tla}
                              alt={row.team.name}
                              size="sm"
                              className="group-hover:scale-110 transition-transform"
                            />
                            <span className="font-bold text-white group-hover:text-[#04F5FF] transition-colors truncate">
                              {row.team.shortName || row.team.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-white/80">{row.playedGames}</td>
                        <td className="py-3 px-2 text-center font-mono text-white/80">{row.won}</td>
                        <td className="py-3 px-2 text-center font-mono text-white/80">{row.draw}</td>
                        <td className="py-3 px-2 text-center font-mono text-white/80">{row.lost}</td>
                        <td className="py-3 px-2 text-center font-mono text-[#B9A9BB] hidden sm:table-cell">
                          {row.goalsFor}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-[#B9A9BB] hidden sm:table-cell">
                          {row.goalsAgainst}
                        </td>
                        <td
                          className={`py-3 px-2 text-center font-mono font-bold ${
                            row.goalDifference > 0
                              ? 'text-[#00FF85]'
                              : row.goalDifference < 0
                              ? 'text-[#E90052]'
                              : 'text-white'
                          }`}
                        >
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-extrabold text-white text-sm">
                          {row.points}
                        </td>
                        <td className="py-3 px-4 text-center hidden md:table-cell">
                          <div className="flex justify-center">
                            <FormDots form={row.form || 'WWDWL'} count={5} size="sm" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Top Scorers Widget (Side Panel) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#4A0050] rounded-2xl p-5 border border-white/5 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <Award className="w-5 h-5 text-[#00FF85]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Golden Boot Race
              </h3>
            </div>

            <div className="space-y-3">
              {topScorers.map((scorer, idx) => (
                <div
                  key={scorer.player.id}
                  className="bg-[#38003C] rounded-xl p-3 flex items-center justify-between border border-white/5 hover:border-[#04F5FF]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-[#04F5FF] w-4">
                      {idx + 1}
                    </span>
                    <CrestImage tla={scorer.team.tla} alt={scorer.team.name} size="sm" />
                    <div>
                      <span className="font-bold text-xs text-white block truncate max-w-[110px]">
                        {scorer.player.name}
                      </span>
                      <span className="text-[10px] text-[#B9A9BB]">
                        {scorer.team.shortName || scorer.team.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-base font-black text-[#00FF85]">
                      {scorer.goals}
                    </span>
                    <span className="text-[10px] text-[#B9A9BB] block">goals</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Detail Panel */}
      {selectedTla && (
        <TeamDetailPanel tla={selectedTla} onClose={() => setSelectedTla(null)} />
      )}
    </PageWrapper>
  );
};
