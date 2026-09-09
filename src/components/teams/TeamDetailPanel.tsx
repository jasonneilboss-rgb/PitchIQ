import React, { useState } from 'react';
import { X, Calendar, Users, Info, MapPin, Globe } from 'lucide-react';
import { CrestImage } from '../ui/CrestImage';
import { FormDots } from '../ui/FormDots';
import { getClubByTlaOrName } from '../../constants/clubs';
import { useTeam } from '../../hooks/useTeam';
import { useStandings } from '../../hooks/useStandings';
import { useFixtures } from '../../hooks/useFixtures';
import { formatMatchDateSAST, formatToSAST } from '../../utils/date';
import { SkeletonCard } from '../ui/SkeletonCard';

interface TeamDetailPanelProps {
  tla: string | null;
  onClose: () => void;
}

export const TeamDetailPanel: React.FC<TeamDetailPanelProps> = ({ tla, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'squad' | 'fixtures'>('overview');

  const club = tla ? getClubByTlaOrName(tla) : null;
  const { data: teamData, isLoading } = useTeam(club?.id || 0, club?.short || '', !!club);
  const { data: standingsData } = useStandings();
  const { data: fixturesData } = useFixtures();

  if (!tla || !club) return null;

  // Find standings row for this team
  const standingRow = standingsData?.standings?.[0]?.table?.find(
    (t) => t.team?.tla === tla || t.team?.name?.toLowerCase().includes(club.short.toLowerCase())
  );

  // Filter fixtures for this team
  const teamFixtures = (fixturesData?.matches || []).filter(
    (m) => m.homeTeam.tla === tla || m.awayTeam.tla === tla
  );

  const team = teamData?.team;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-xl h-full bg-[#2B002E] border-l border-[#4A0050] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header with Club Color Wash */}
        <div
          className="relative p-6 border-b border-white/10 shrink-0 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${club.primary}dd 0%, #2B002E 100%)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <CrestImage tla={tla} alt={club.name} size="xl" className="bg-black/20 p-1.5 rounded-2xl border border-white/20" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-white font-sans uppercase">
                  {club.name}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase bg-black/40 text-white">
                  {tla}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5 flex items-center gap-2">
                <span>{team?.venue || `${club.name} Stadium`}</span>
                {standingRow && (
                  <span className="bg-[#00FF85] text-black px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                    Rank #{standingRow.position}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6">
            {(['overview', 'squad', 'fixtures'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-black shadow-md'
                    : 'bg-black/30 text-white/80 hover:bg-black/50 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <SkeletonCard lines={6} />
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Standings Performance Card */}
                  {standingRow && (
                    <div className="bg-[#4A0050] rounded-2xl p-5 border border-white/5 shadow-md">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#04F5FF] mb-3">
                        2026/27 Season Record
                      </h3>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-[#38003C] p-2.5 rounded-xl">
                          <span className="text-[10px] text-[#B9A9BB] uppercase block">Points</span>
                          <span className="text-xl font-extrabold text-[#00FF85] font-mono">{standingRow.points}</span>
                        </div>
                        <div className="bg-[#38003C] p-2.5 rounded-xl">
                          <span className="text-[10px] text-[#B9A9BB] uppercase block">P / W / D / L</span>
                          <span className="text-xs font-bold text-white font-mono mt-1 block">
                            {standingRow.playedGames} &bull; {standingRow.won}-{standingRow.draw}-{standingRow.lost}
                          </span>
                        </div>
                        <div className="bg-[#38003C] p-2.5 rounded-xl">
                          <span className="text-[10px] text-[#B9A9BB] uppercase block">Goals</span>
                          <span className="text-xs font-bold text-white font-mono mt-1 block">
                            {standingRow.goalsFor}:{standingRow.goalsAgainst}
                          </span>
                        </div>
                        <div className="bg-[#38003C] p-2.5 rounded-xl">
                          <span className="text-[10px] text-[#B9A9BB] uppercase block">GD</span>
                          <span className={`text-xl font-extrabold font-mono ${standingRow.goalDifference >= 0 ? 'text-[#00FF85]' : 'text-[#E90052]'}`}>
                            {standingRow.goalDifference > 0 ? `+${standingRow.goalDifference}` : standingRow.goalDifference}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-[#B9A9BB]">Last 5 Match Form</span>
                        <FormDots form={standingRow.form || 'WWDWL'} />
                      </div>
                    </div>
                  )}

                  {/* Club Metadata */}
                  <div className="bg-[#4A0050] rounded-2xl p-5 border border-white/5 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#04F5FF] mb-2 flex items-center gap-1.5">
                      <Info className="w-4 h-4" />
                      Club Intelligence
                    </h3>
                    <div className="text-xs space-y-2 text-[#B9A9BB]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#E90052]" />
                        <span>Venue: <strong className="text-white">{team?.venue || `${club.name} Stadium`}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-[#04F5FF]" />
                        <span>Website: <a href={team?.website} target="_blank" rel="noreferrer" className="text-[#04F5FF] underline">{team?.website || 'Official Site'}</a></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#00FF85]" />
                        <span>Manager / Coach: <strong className="text-white">{team?.coach?.name || 'Tactical Management'}</strong> ({team?.coach?.nationality || 'UK'})</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SQUAD TAB */}
              {activeTab === 'squad' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#04F5FF]">
                    Roster & Squad Members
                  </h3>
                  <div className="space-y-2">
                    {team?.squad && team.squad.length > 0 ? (
                      team.squad.map((player) => (
                        <div
                          key={player.id}
                          className="bg-[#38003C] rounded-xl p-3 flex items-center justify-between border border-white/5 hover:border-[#04F5FF]/30 transition-colors"
                        >
                          <div>
                            <span className="text-sm font-semibold text-white block">{player.name}</span>
                            <span className="text-[11px] text-[#B9A9BB]">{player.nationality}</span>
                          </div>
                          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white/5 text-[#04F5FF]">
                            {player.position}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#B9A9BB]">Squad data updating...</p>
                    )}
                  </div>
                </div>
              )}

              {/* FIXTURES TAB */}
              {activeTab === 'fixtures' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#04F5FF]">
                    Matches & Schedule
                  </h3>
                  {teamFixtures.length > 0 ? (
                    teamFixtures.map((m) => {
                      const isHome = m.homeTeam.tla === tla;
                      const opponent = isHome ? m.awayTeam : m.homeTeam;
                      const scoreStr = m.score?.fullTime?.home !== null
                        ? `${m.score.fullTime.home} - ${m.score.fullTime.away}`
                        : formatToSAST(m.utcDate, 'HH:mm');

                      return (
                        <div
                          key={m.id}
                          className="bg-[#38003C] rounded-xl p-3.5 flex items-center justify-between border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-[#B9A9BB] w-12 font-mono">
                              MW {m.matchday}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">
                                {isHome ? 'vs' : '@'} {opponent.shortName || opponent.name}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-[#00FF85]">{scoreStr}</span>
                            <span className="text-[10px] text-[#B9A9BB] block">
                              {formatMatchDateSAST(m.utcDate)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-[#B9A9BB]">No fixtures loaded.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
