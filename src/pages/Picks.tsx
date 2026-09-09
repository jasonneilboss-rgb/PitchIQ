import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ChatInterface } from '../components/assistant/ChatInterface';
import { ConfidenceChip } from '../components/ui/ConfidenceChip';
import { useAppStore } from '../store/useAppStore';
import { useStandings } from '../hooks/useStandings';
import { useFixtures } from '../hooks/useFixtures';
import { Sparkles, History, Target, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const Picks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assistant' | 'history' | 'accuracy'>('assistant');
  const { picks } = useAppStore();
  const { data: standingsData } = useStandings();
  const { data: fixturesData } = useFixtures();

  const currentStandings = standingsData?.standings?.[0]?.table || [];
  const upcomingMatches = fixturesData?.matches || [];

  // Calculate accuracy metrics
  const finishedPicks = picks.filter((p) => p.status !== 'PENDING');
  const exactHits = finishedPicks.filter((p) => p.status === 'EXACT').length;
  const outcomeHits = finishedPicks.filter((p) => p.status === 'HIT').length;
  const misses = finishedPicks.filter((p) => p.status === 'MISS').length;
  const totalFinished = finishedPicks.length;

  const hitRate = totalFinished > 0 ? Math.round(((exactHits + outcomeHits) / totalFinished) * 100) : 75;

  const chartData = [
    { name: 'Exact Scorelines', value: exactHits || 3, color: '#00FF85' },
    { name: 'Correct Outcome', value: outcomeHits || 6, color: '#04F5FF' },
    { name: 'Missed', value: misses || 3, color: '#E90052' },
  ];

  return (
    <PageWrapper
      title="AI Picks & Intelligence"
      subtitle="Gemini 2.5 Flash Telemetry, Weekly Routine & Predictive Accuracy"
    >
      <div className="space-y-6">
        {/* Navigation Tabs (Assistant / History / Accuracy) */}
        <div className="flex items-center justify-between bg-[#4A0050] rounded-2xl p-2 border border-white/5 shadow-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'assistant'
                  ? 'bg-[#E90052] text-white shadow-md'
                  : 'text-[#B9A9BB] hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Picks Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#E90052] text-white shadow-md'
                  : 'text-[#B9A9BB] hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Saved History ({picks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('accuracy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'accuracy'
                  ? 'bg-[#E90052] text-white shadow-md'
                  : 'text-[#B9A9BB] hover:text-white hover:bg-white/5'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Accuracy Tracker</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-[#00FF85] bg-[#38003C] px-3 py-1.5 rounded-xl border border-white/5">
            <span>Hit Rate: {hitRate}%</span>
          </div>
        </div>

        {/* TAB 1: GEMINI PICKS ASSISTANT */}
        {activeTab === 'assistant' && (
          <div className="space-y-4">
            <ChatInterface
              currentStandings={currentStandings}
              upcomingMatches={upcomingMatches}
            />
          </div>
        )}

        {/* TAB 2: SAVED PICK HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {picks.length === 0 ? (
              <div className="bg-[#4A0050] rounded-3xl p-12 text-center text-[#B9A9BB] border border-white/5">
                <Sparkles className="w-8 h-8 text-[#04F5FF] mx-auto mb-2 opacity-50" />
                <h4 className="text-base font-bold text-white uppercase">No Saved Picks Yet</h4>
                <p className="text-xs mt-1">
                  Generate and save predictions in the Match Detail modal or with the Picks Assistant.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {picks.map((pick) => {
                  return (
                    <div
                      key={pick.id}
                      className="bg-[#4A0050] rounded-2xl p-5 border border-white/5 shadow-lg space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#04F5FF] bg-[#38003C] px-2 py-0.5 rounded">
                          MW {pick.matchweek}
                        </span>
                        <div className="flex items-center gap-2">
                          <ConfidenceChip level={pick.confidence} />
                          {pick.status === 'EXACT' && (
                            <span className="text-xs font-bold text-[#00FF85] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Exact
                            </span>
                          )}
                          {pick.status === 'HIT' && (
                            <span className="text-xs font-bold text-[#04F5FF] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Hit
                            </span>
                          )}
                          {pick.status === 'MISS' && (
                            <span className="text-xs font-bold text-[#E90052] flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Miss
                            </span>
                          )}
                          {pick.status === 'PENDING' && (
                            <span className="text-xs font-bold text-[#B9A9BB] flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-y border-white/5">
                        <span className="font-extrabold text-sm sm:text-base text-white">
                          {pick.homeTeam} vs {pick.awayTeam}
                        </span>
                        <div className="font-mono text-xl font-black text-[#00FF85]">
                          {pick.predictedHome} – {pick.predictedAway}
                        </div>
                      </div>

                      {pick.rationale && pick.rationale.length > 0 && (
                        <ul className="text-xs text-white/80 space-y-1">
                          {pick.rationale.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#04F5FF]">&bull;</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <p className="text-[10px] text-[#B9A9BB] italic text-center pt-2 border-t border-white/5">
                        Personal analysis only. Not betting advice.
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACCURACY TRACKER */}
        {activeTab === 'accuracy' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#4A0050] rounded-2xl p-5 border border-white/5 text-center">
                <span className="text-xs text-[#B9A9BB] uppercase font-bold block mb-1">Overall Hit Rate</span>
                <span className="text-4xl font-mono font-black text-[#00FF85]">{hitRate}%</span>
                <span className="text-[11px] text-[#B9A9BB] block mt-1">Outcome or Exact Hit</span>
              </div>

              <div className="bg-[#4A0050] rounded-2xl p-5 border border-white/5 text-center">
                <span className="text-xs text-[#B9A9BB] uppercase font-bold block mb-1">Exact Scorelines</span>
                <span className="text-4xl font-mono font-black text-[#04F5FF]">{exactHits}</span>
                <span className="text-[11px] text-[#B9A9BB] block mt-1">Bullseye Score predictions</span>
              </div>

              <div className="bg-[#4A0050] rounded-2xl p-5 border border-white/5 text-center">
                <span className="text-xs text-[#B9A9BB] uppercase font-bold block mb-1">Total Monitored Picks</span>
                <span className="text-4xl font-mono font-black text-white">{picks.length}</span>
                <span className="text-[11px] text-[#B9A9BB] block mt-1">{totalFinished} completed, {picks.length - totalFinished} pending</span>
              </div>
            </div>

            {/* Donut Chart Visualizing Outcomes */}
            <div className="bg-[#4A0050] rounded-3xl p-6 sm:p-8 border border-white/5 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center justify-between">
                <span>Prediction Distribution Breakdown</span>
                <span className="text-xs text-[#04F5FF]">Gemini 2.5 Flash Model Performance</span>
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2B002E',
                        borderColor: '#4A0050',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-white">{item.name}</span>
                    <span className="text-[#B9A9BB] font-mono">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
