import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, ArrowRight, Activity, Flame, ChevronRight } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { CrestImage } from '../components/ui/CrestImage';
import { FormDots } from '../components/ui/FormDots';
import { StatusChip } from '../components/ui/StatusChip';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { MatchDetailModal } from '../components/matches/MatchDetailModal';
import { TeamDetailPanel } from '../components/teams/TeamDetailPanel';
import { useFixtures } from '../hooks/useFixtures';
import { useLiveMatches } from '../hooks/useLiveMatches';
import { useStandings } from '../hooks/useStandings';
import { useAppStore } from '../store/useAppStore';
import { formatToSAST, formatToLondonTime, getTimeRemaining, formatMatchDateSAST } from '../utils/date';
import { generateDailyAiRead } from '../api/gemini';
import { getClubByTlaOrName, CLUB_DATA } from '../constants/clubs';
import { Match } from '../types';

export const Today: React.FC = () => {
  const { data: fixturesData, isLoading: isLoadingFixtures, refetch: refetchFixtures, isFetching } = useFixtures();
  const { data: liveData } = useLiveMatches();
  const { data: standingsData } = useStandings();

  const { recentTeams, addRecentTeam, dailyAiRead, setDailyAiRead } = useAppStore();

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedTeamTla, setSelectedTeamTla] = useState<string | null>(null);
  const [countdownText, setCountdownText] = useState('00d 00h 00m 00s');
  const [isGeneratingAiRead, setIsGeneratingAiRead] = useState(false);

  // Find next upcoming fixture
  const allMatches = fixturesData?.matches || [];
  const nextFixture = allMatches.find(
    (m) => m.status === 'TIMED' || m.status === 'SCHEDULED'
  ) || allMatches[0];

  // Live in-play matches
  const liveMatches = (liveData?.matches || []).filter(
    (m) => m.status === 'IN_PLAY' || m.status === 'PAUSED'
  );

  // Live countdown timer ticking every second
  useEffect(() => {
    if (!nextFixture) return;

    const updateCountdown = () => {
      const remaining = getTimeRemaining(nextFixture.utcDate);
      setCountdownText(remaining.formatted);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextFixture]);

  // Find most interesting fixture (lowest sum of standings positions)
  const standingsTable = standingsData?.standings?.[0]?.table || [];
  const getTeamRank = (tla: string) =>
    standingsTable.find((t) => t.team?.tla === tla)?.position || 10;

  const interestingMatch = [...allMatches]
    .filter((m) => m.status !== 'FINISHED')
    .sort((a, b) => {
      const sumA = getTeamRank(a.homeTeam.tla) + getTeamRank(a.awayTeam.tla);
      const sumB = getTeamRank(b.homeTeam.tla) + getTeamRank(b.awayTeam.tla);
      return sumA - sumB;
    })[0] || nextFixture;

  // Daily AI Read of the Day (Cached by calendar date)
  const todayKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!interestingMatch) return;

    if (dailyAiRead && dailyAiRead.date === todayKey && dailyAiRead.text) {
      return; // Already cached for today
    }

    let isMounted = true;
    const fetchAiRead = async () => {
      setIsGeneratingAiRead(true);
      try {
        const homeRank = getTeamRank(interestingMatch.homeTeam.tla);
        const awayRank = getTeamRank(interestingMatch.awayTeam.tla);
        const text = await generateDailyAiRead(interestingMatch, homeRank, awayRank);
        if (isMounted) {
          setDailyAiRead({ date: todayKey, text });
        }
      } catch {
        // Handled in gemini.ts fallback
      } finally {
        if (isMounted) setIsGeneratingAiRead(false);
      }
    };

    fetchAiRead();
    return () => {
      isMounted = false;
    };
  }, [interestingMatch, dailyAiRead, todayKey]);

  // 6 teams for Form ribbon (from recentTeams or filled from top of standings)
  const ribbonTlas = [...recentTeams];
  if (ribbonTlas.length < 6) {
    const topTlas = standingsTable.slice(0, 6).map((t) => t.team?.tla).filter(Boolean);
    for (const t of topTlas) {
      if (!ribbonTlas.includes(t) && ribbonTlas.length < 6) {
        ribbonTlas.push(t);
      }
    }
  }

  return (
    <PageWrapper
      title="Premier League Intelligence"
      subtitle="Live 2026/27 Matchday Dashboard & AI Telemetry"
      onRefresh={refetchFixtures}
      isFetching={isFetching}
    >
      <div className="space-y-8">
        {/* 1. LIVE STRIP (Visible only when matches are IN_PLAY or PAUSED) */}
        {liveMatches.length > 0 && (
          <div className="bg-[#E90052]/15 border border-[#E90052]/40 rounded-2xl p-4 shadow-lg animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E90052] animate-ping" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#E90052]">
                Live Matches in Progress ({liveMatches.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveMatches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMatch(m);
                    addRecentTeam(m.homeTeam.tla);
                    addRecentTeam(m.awayTeam.tla);
                  }}
                  className="bg-[#2B002E] rounded-xl p-3 flex items-center justify-between border border-white/10 hover:border-[#04F5FF] transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <CrestImage tla={m.homeTeam.tla} alt={m.homeTeam.name} size="sm" />
                    <span className="font-bold text-sm text-white">{m.homeTeam.shortName}</span>
                  </div>
                  <div className="text-center px-3 py-1 bg-[#4A0050] rounded-lg border border-[#E90052]/30">
                    <div className="font-mono text-base font-black text-white">
                      {m.score.fullTime.home ?? 0} - {m.score.fullTime.away ?? 0}
                    </div>
                    <span className="text-[10px] text-[#E90052] font-extrabold uppercase">
                      {m.minute ? `${m.minute}'` : 'LIVE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{m.awayTeam.shortName}</span>
                    <CrestImage tla={m.awayTeam.tla} alt={m.awayTeam.name} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. HERO CARD — NEXT FIXTURE WITH TICKING LIVE COUNTDOWN */}
        {isLoadingFixtures || !nextFixture ? (
          <SkeletonCard lines={4} />
        ) : (
          <div className="relative bg-gradient-to-br from-[#38003C] via-[#4A0050] to-[#2B002E] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E90052]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="w-full md:w-auto text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-[#04F5FF] mb-3">
                  <Activity className="w-3.5 h-3.5 text-[#E90052]" />
                  <span>Next Marquee Fixture &bull; Matchweek {nextFixture.matchday}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-sans">
                  Kickoff Imminent
                </h2>
                <p className="text-xs text-[#B9A9BB] mt-1">
                  {formatMatchDateSAST(nextFixture.utcDate)} &bull; {nextFixture.venue || 'Premier League Stadium'}
                </p>
              </div>

              {/* Countdown badge ticking every second */}
              <div className="bg-[#2B002E]/90 border border-[#04F5FF]/30 rounded-2xl px-5 py-3 text-center shadow-lg">
                <span className="text-[10px] text-[#04F5FF] font-extrabold uppercase tracking-widest block mb-1">
                  Kickoff Countdown
                </span>
                <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight">
                  {countdownText}
                </span>
              </div>
            </div>

            {/* Fixture Matchup Display */}
            <div className="mt-8 grid grid-cols-7 items-center text-center gap-2 bg-[#2B002E]/60 rounded-2xl p-4 sm:p-6 border border-white/5">
              <div
                onClick={() => setSelectedTeamTla(nextFixture.homeTeam.tla)}
                className="col-span-3 flex flex-col items-center cursor-pointer group"
              >
                <CrestImage tla={nextFixture.homeTeam.tla} alt={nextFixture.homeTeam.name} size="xl" className="mb-2 group-hover:scale-105 transition-transform" />
                <span className="font-black text-base sm:text-xl text-white group-hover:text-[#04F5FF] transition-colors uppercase">
                  {nextFixture.homeTeam.shortName || nextFixture.homeTeam.name}
                </span>
                <span className="text-xs text-[#00FF85] font-semibold mt-0.5">
                  Rank #{getTeamRank(nextFixture.homeTeam.tla)}
                </span>
              </div>

              <div className="col-span-1 flex flex-col items-center justify-center">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#00FF85]">
                  {formatToSAST(nextFixture.utcDate, 'HH:mm')}
                </span>
                <span className="text-[10px] text-[#04F5FF] font-extrabold tracking-wider uppercase">
                  SAST
                </span>
                <span className="text-[10px] text-[#B9A9BB] font-mono mt-0.5">
                  {formatToLondonTime(nextFixture.utcDate)}
                </span>
              </div>

              <div
                onClick={() => setSelectedTeamTla(nextFixture.awayTeam.tla)}
                className="col-span-3 flex flex-col items-center cursor-pointer group"
              >
                <CrestImage tla={nextFixture.awayTeam.tla} alt={nextFixture.awayTeam.name} size="xl" className="mb-2 group-hover:scale-105 transition-transform" />
                <span className="font-black text-base sm:text-xl text-white group-hover:text-[#04F5FF] transition-colors uppercase">
                  {nextFixture.awayTeam.shortName || nextFixture.awayTeam.name}
                </span>
                <span className="text-xs text-[#00FF85] font-semibold mt-0.5">
                  Rank #{getTeamRank(nextFixture.awayTeam.tla)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <span className="text-xs text-[#B9A9BB]">
                Times shown in SAST (UTC+2) with London GMT/BST subline
              </span>
              <button
                onClick={() => {
                  setSelectedMatch(nextFixture);
                  addRecentTeam(nextFixture.homeTeam.tla);
                  addRecentTeam(nextFixture.awayTeam.tla);
                }}
                className="bg-[#E90052] hover:bg-[#E90052]/90 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md shadow-[#E90052]/20"
              >
                <span>View Match Intelligence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. AI READ OF THE DAY */}
        <div className="bg-[#4A0050] rounded-3xl p-6 sm:p-7 border border-white/5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E90052] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                AI Read of the Day
              </h3>
              <span className="text-[10px] text-[#00FF85] bg-[#00FF85]/15 border border-[#00FF85]/30 px-2 py-0.5 rounded-full font-mono font-semibold uppercase">
                Gemini 2.5 Flash
              </span>
            </div>
            {interestingMatch && (
              <span className="text-xs text-[#04F5FF] font-semibold hidden sm:inline">
                Focus: {interestingMatch.homeTeam.shortName} vs {interestingMatch.awayTeam.shortName}
              </span>
            )}
          </div>

          {isGeneratingAiRead ? (
            <div className="space-y-2 animate-pulse py-2">
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
              <div className="h-4 bg-white/10 rounded w-4/6" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-white/90">
              {dailyAiRead?.text || 'Loading tactical telemetry...'}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#B9A9BB]">
            <span>Generated once per calendar day ({todayKey})</span>
            <span className="italic">Personal analysis only. Not betting advice.</span>
          </div>
        </div>

        {/* 4. FORM RIBBON (Last 5 results for 6 most recently viewed teams) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#E90052]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#B9A9BB]">
                Form Ribbon &bull; Monitored Clubs
              </h3>
            </div>
            <span className="text-xs text-[#04F5FF]">Last 5 Results</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ribbonTlas.map((tla) => {
              const club = getClubByTlaOrName(tla);
              const rank = getTeamRank(tla);
              const standing = standingsTable.find((t) => t.team?.tla === tla);
              const form = standing?.form || 'WWDWL';

              if (!club) return null;

              return (
                <div
                  key={tla}
                  onClick={() => setSelectedTeamTla(tla)}
                  className="bg-[#4A0050] hover:bg-[#4A0050]/80 rounded-2xl p-3.5 border border-white/5 transition-all cursor-pointer shadow-md flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <CrestImage tla={tla} alt={club.name} size="sm" />
                    <span className="text-[10px] font-mono font-bold text-[#00FF85] bg-black/30 px-1.5 py-0.5 rounded">
                      #{rank}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-bold text-xs text-white group-hover:text-[#04F5FF] transition-colors block truncate">
                      {club.short}
                    </span>
                    <span className="text-[10px] text-[#B9A9BB]">
                      {standing?.points ?? 0} pts
                    </span>
                  </div>
                  <FormDots form={form} count={5} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}

      {/* Team Detail Panel */}
      {selectedTeamTla && (
        <TeamDetailPanel tla={selectedTeamTla} onClose={() => setSelectedTeamTla(null)} />
      )}
    </PageWrapper>
  );
};
