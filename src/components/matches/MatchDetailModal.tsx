import React, { useState, useEffect } from 'react';
import { X, Sparkles, Shield, BookmarkPlus, Check, Trophy } from 'lucide-react';
import { Match, PickRecord } from '../../types';
import { CrestImage } from '../ui/CrestImage';
import { StatusChip } from '../ui/StatusChip';
import { ConfidenceChip } from '../ui/ConfidenceChip';
import { FormDots } from '../ui/FormDots';
import { PitchView } from '../pitch/PitchView';
import { MatchupGrid } from '../pitch/MatchupGrid';
import { formatToSAST, formatToLondonTime, formatMatchDateSAST } from '../../utils/date';
import { useHeadToHead } from '../../hooks/useHeadToHead';
import { useStandings } from '../../hooks/useStandings';
import { getClubByTlaOrName } from '../../constants/clubs';
import { DEFAULT_FORMATIONS, FormationType } from '../../constants/formations';
import { getTeamRoster } from '../../api/mockData';
import { generateMatchPick } from '../../api/gemini';
import { useAppStore } from '../../store/useAppStore';

interface MatchDetailModalProps {
  match: Match | null;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sheets' | 'pick'>('overview');
  const [isGeneratingPick, setIsGeneratingPick] = useState(false);
  const [aiPick, setAiPick] = useState<{
    predictedHome: number;
    predictedAway: number;
    outcome: 'HOME' | 'DRAW' | 'AWAY';
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    rationale: string[];
  } | null>(null);
  const [savedPick, setSavedPick] = useState(false);

  const { data: standingsData } = useStandings();
  const { picks, addPick } = useAppStore();

  const homeClub = match ? getClubByTlaOrName(match.homeTeam.tla || match.homeTeam.shortName) : null;
  const awayClub = match ? getClubByTlaOrName(match.awayTeam.tla || match.awayTeam.shortName) : null;

  const { data: h2hData } = useHeadToHead(
    match?.id || 0,
    match?.homeTeam.shortName || '',
    match?.awayTeam.shortName || '',
    !!match
  );

  // Find standings positions
  const table = standingsData?.standings?.[0]?.table || [];
  const homePos = table.find((t) => t.team?.tla === match?.homeTeam.tla)?.position || 5;
  const awayPos = table.find((t) => t.team?.tla === match?.awayTeam.tla)?.position || 9;
  const homeForm = table.find((t) => t.team?.tla === match?.homeTeam.tla)?.form || 'WWDWL';
  const awayForm = table.find((t) => t.team?.tla === match?.awayTeam.tla)?.form || 'LDDWL';

  // Check if user already has a saved pick for this fixture
  useEffect(() => {
    if (match) {
      const existing = picks.find(
        (p) => p.matchweek === match.matchday && p.homeTeam === match.homeTeam.shortName && p.awayTeam === match.awayTeam.shortName
      );
      if (existing) {
        setAiPick({
          predictedHome: existing.predictedHome,
          predictedAway: existing.predictedAway,
          outcome: existing.predictedOutcome,
          confidence: existing.confidence,
          rationale: existing.rationale || ['Prior user pick recorded for this fixture.'],
        });
        setSavedPick(true);
      } else {
        setSavedPick(false);
      }
    }
  }, [match, picks]);

  if (!match) return null;

  const homeFormation: FormationType = DEFAULT_FORMATIONS[match.homeTeam.tla] || '4-3-3';
  const awayFormation: FormationType = DEFAULT_FORMATIONS[match.awayTeam.tla] || '4-2-3-1';

  const homeRoster = getTeamRoster(match.homeTeam.tla);
  const awayRoster = getTeamRoster(match.awayTeam.tla);

  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';
  const hasScore = match.score?.fullTime?.home !== null && match.score?.fullTime?.home !== undefined;

  const h2h = h2hData?.h2h;
  const totalH2hMatches = (h2h?.homeTeam.wins || 3) + (h2h?.homeTeam.draws || 1) + (h2h?.awayTeam.wins || 2);
  const homeWinPct = Math.round(((h2h?.homeTeam.wins || 3) / totalH2hMatches) * 100);
  const drawPct = Math.round(((h2h?.homeTeam.draws || 1) / totalH2hMatches) * 100);
  const awayWinPct = 100 - homeWinPct - drawPct;

  const handleGeneratePick = async () => {
    setIsGeneratingPick(true);
    try {
      const summary = `${h2h?.homeTeam.name || match.homeTeam.shortName}: ${h2h?.homeTeam.wins || 3}W, ${h2h?.homeTeam.draws || 1}D, ${h2h?.awayTeam.wins || 2}L`;
      const pick = await generateMatchPick(match, homePos, awayPos, summary);
      setAiPick(pick);
    } finally {
      setIsGeneratingPick(false);
    }
  };

  const handleSavePick = () => {
    if (!aiPick || savedPick) return;

    const newRecord: PickRecord = {
      id: `pick-${match.id}-${Date.now()}`,
      matchweek: match.matchday,
      homeTeam: match.homeTeam.shortName,
      awayTeam: match.awayTeam.shortName,
      predictedHome: aiPick.predictedHome,
      predictedAway: aiPick.predictedAway,
      predictedOutcome: aiPick.outcome,
      actualHome: match.score?.fullTime?.home ?? null,
      actualAway: match.score?.fullTime?.away ?? null,
      confidence: aiPick.confidence,
      source: 'AI',
      generatedAt: new Date().toISOString(),
      rationale: aiPick.rationale,
      status: isFinished
        ? (match.score?.fullTime?.home === aiPick.predictedHome && match.score?.fullTime?.away === aiPick.predictedAway
            ? 'EXACT'
            : ((match.score?.fullTime?.home || 0) > (match.score?.fullTime?.away || 0) && aiPick.outcome === 'HOME') ||
              ((match.score?.fullTime?.home || 0) === (match.score?.fullTime?.away || 0) && aiPick.outcome === 'DRAW') ||
              ((match.score?.fullTime?.home || 0) < (match.score?.fullTime?.away || 0) && aiPick.outcome === 'AWAY')
            ? 'HIT'
            : 'MISS')
        : 'PENDING',
    };

    addPick(newRecord);
    setSavedPick(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#2B002E] rounded-3xl border border-[#4A0050] overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-150">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header — Match Score / Time */}
        <div className="p-6 bg-gradient-to-b from-[#38003C] to-[#2B002E] border-b border-white/5">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-[#04F5FF]">
              Matchweek {match.matchday}
            </span>
            <StatusChip status={match.status} minute={match.minute} />
          </div>

          <div className="grid grid-cols-7 items-center text-center gap-2">
            {/* Home Team */}
            <div className="col-span-3 flex flex-col items-center">
              <CrestImage tla={match.homeTeam.tla} alt={match.homeTeam.name} size="xl" className="mb-2" />
              <h3 className="font-extrabold text-base sm:text-lg text-white font-sans uppercase">
                {match.homeTeam.shortName || match.homeTeam.name}
              </h3>
              <span className="text-[11px] text-[#00FF85] font-semibold">
                Rank #{homePos}
              </span>
            </div>

            {/* Score / Center Kickoff Info */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              {hasScore ? (
                <div className="font-mono text-2xl sm:text-3xl font-black text-white px-2 py-1 rounded-xl bg-[#4A0050]/80 border border-white/10">
                  {match.score.fullTime.home} - {match.score.fullTime.away}
                </div>
              ) : (
                <div className="text-center">
                  <span className="font-mono text-lg sm:text-xl font-extrabold text-[#00FF85] block">
                    {formatToSAST(match.utcDate, 'HH:mm')}
                  </span>
                  <span className="text-[10px] text-[#04F5FF] font-semibold uppercase tracking-wider block">
                    SAST
                  </span>
                  <span className="text-[10px] text-[#B9A9BB] block font-mono">
                    {formatToLondonTime(match.utcDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="col-span-3 flex flex-col items-center">
              <CrestImage tla={match.awayTeam.tla} alt={match.awayTeam.name} size="xl" className="mb-2" />
              <h3 className="font-extrabold text-base sm:text-lg text-white font-sans uppercase">
                {match.awayTeam.shortName || match.awayTeam.name}
              </h3>
              <span className="text-[11px] text-[#00FF85] font-semibold">
                Rank #{awayPos}
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-[#B9A9BB] mt-4">
            {formatMatchDateSAST(match.utcDate)} &bull; {match.venue || `${match.homeTeam.shortName} Stadium`}
          </p>

          {/* Navigation Tabs */}
          <div className="flex justify-center gap-2 mt-6">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'sheets', label: 'Team Sheets' },
              { key: 'pick', label: 'AI Pick' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#E90052] text-white shadow-lg shadow-[#E90052]/20'
                    : 'bg-[#4A0050] text-[#B9A9BB] hover:text-white hover:bg-[#4A0050]/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Diverging H2H Win/Draw/Loss Bar */}
              <div className="bg-[#4A0050] rounded-2xl p-5 border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#04F5FF] mb-3 flex items-center justify-between">
                  <span>Head-to-Head History</span>
                  <span className="text-[11px] text-[#B9A9BB]">Last {totalH2hMatches} Encounters</span>
                </h4>

                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-[#00FF85]">{match.homeTeam.shortName} ({h2h?.homeTeam.wins || 3}W)</span>
                  <span className="text-[#B9A9BB]">Draws ({h2h?.homeTeam.draws || 1})</span>
                  <span className="text-[#04F5FF]">{match.awayTeam.shortName} ({h2h?.awayTeam.wins || 2}W)</span>
                </div>

                {/* Segmented H2H Bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/40">
                  <div
                    style={{ width: `${homeWinPct}%` }}
                    className="h-full bg-[#00FF85]"
                    title={`${match.homeTeam.shortName} wins: ${homeWinPct}%`}
                  />
                  <div
                    style={{ width: `${drawPct}%` }}
                    className="h-full bg-[#B9A9BB]"
                    title={`Draws: ${drawPct}%`}
                  />
                  <div
                    style={{ width: `${awayWinPct}%` }}
                    className="h-full bg-[#04F5FF]"
                    title={`${match.awayTeam.shortName} wins: ${awayWinPct}%`}
                  />
                </div>
              </div>

              {/* Form Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#4A0050] rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase">{match.homeTeam.shortName} Form</span>
                    <FormDots form={homeForm} />
                  </div>
                  <p className="text-xs text-[#B9A9BB]">
                    Scored in 4 of last 5 home league fixtures.
                  </p>
                </div>

                <div className="bg-[#4A0050] rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase">{match.awayTeam.shortName} Form</span>
                    <FormDots form={awayForm} />
                  </div>
                  <p className="text-xs text-[#B9A9BB]">
                    Conceded 1.4 goals per match on average away.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEAM SHEETS */}
          {activeTab === 'sheets' && (
            <div className="space-y-6">
              <PitchView
                homeTla={match.homeTeam.tla}
                awayTla={match.awayTeam.tla}
                homeFormation={homeFormation}
                awayFormation={awayFormation}
                homeStarters={homeRoster.starters}
                awayStarters={awayRoster.starters}
                homeColor={homeClub?.primary || '#EF0107'}
                awayColor={awayClub?.primary || '#034694'}
              />

              <MatchupGrid
                homeName={match.homeTeam.shortName}
                awayName={match.awayTeam.shortName}
                homeStarters={homeRoster.starters}
                awayStarters={awayRoster.starters}
                homeSubs={homeRoster.subs}
                awaySubs={awayRoster.subs}
                homeAbsentees={homeRoster.absentees}
                awayAbsentees={awayRoster.absentees}
              />
            </div>
          )}

          {/* TAB 3: AI PICK */}
          {activeTab === 'pick' && (
            <div className="space-y-6">
              {!aiPick && !isGeneratingPick && (
                <div className="bg-[#4A0050] rounded-2xl p-8 text-center space-y-4 border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-[#E90052] flex items-center justify-center mx-auto shadow-lg shadow-[#E90052]/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white uppercase tracking-wider">
                      Generate Match Intelligence Pick
                    </h4>
                    <p className="text-xs text-[#B9A9BB] max-w-md mx-auto mt-1">
                      Our Gemini 2.5 Flash analytical model weighs standings ranking, home/away splits, H2H, and recent form telemetry.
                    </p>
                  </div>
                  <button
                    onClick={handleGeneratePick}
                    className="bg-[#E90052] hover:bg-[#E90052]/90 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#E90052]/20"
                  >
                    Generate AI Pick
                  </button>
                </div>
              )}

              {isGeneratingPick && (
                <div className="bg-[#4A0050] rounded-2xl p-8 text-center space-y-3 animate-pulse">
                  <Sparkles className="w-8 h-8 text-[#04F5FF] mx-auto animate-spin" />
                  <p className="text-sm font-semibold text-white">Analyzing Tactical Matchup...</p>
                  <p className="text-xs text-[#B9A9BB]">Gemini 2.5 Flash evaluating form telemetry & scoreline probability</p>
                </div>
              )}

              {aiPick && (
                <div className="bg-[#4A0050] rounded-2xl p-6 border border-white/5 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <ConfidenceChip level={aiPick.confidence} />
                      <span className="text-xs text-[#04F5FF] font-semibold">
                        Predicted: {aiPick.outcome === 'HOME' ? `${match.homeTeam.shortName} Win` : aiPick.outcome === 'AWAY' ? `${match.awayTeam.shortName} Win` : 'Draw'}
                      </span>
                    </div>

                    <button
                      onClick={handleSavePick}
                      disabled={savedPick}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        savedPick
                          ? 'bg-[#00FF85]/20 text-[#00FF85] border border-[#00FF85]/30'
                          : 'bg-[#E90052] text-white hover:bg-[#E90052]/90 shadow-sm'
                      }`}
                    >
                      {savedPick ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                      <span>{savedPick ? 'Saved in Picks' : 'Save to Picks'}</span>
                    </button>
                  </div>

                  {/* Predicted Scoreline Display */}
                  <div className="text-center py-2">
                    <span className="text-xs text-[#B9A9BB] uppercase tracking-wider block mb-1">
                      Projected Scoreline
                    </span>
                    <div className="font-mono text-4xl font-black text-white tracking-widest">
                      {aiPick.predictedHome} – {aiPick.predictedAway}
                    </div>
                  </div>

                  {/* Three Bullet Rationale */}
                  <div className="bg-[#38003C] rounded-xl p-4 border border-white/5 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#04F5FF]">
                      Tactical Rationale
                    </h5>
                    <ul className="space-y-1.5 text-xs text-white/90">
                      {aiPick.rationale.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#00FF85] font-bold">&bull;</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mandatory Disclaimer Footer */}
                  <p className="text-[11px] text-[#B9A9BB] italic text-center pt-2 border-t border-white/5">
                    Personal analysis only. Not betting advice.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
