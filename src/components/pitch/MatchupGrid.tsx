import React from 'react';
import { AlertCircle, UserCheck } from 'lucide-react';

interface MatchupGridProps {
  homeName: string;
  awayName: string;
  homeStarters: string[];
  awayStarters: string[];
  homeSubs: string[];
  awaySubs: string[];
  homeAbsentees: string[];
  awayAbsentees: string[];
}

export const MatchupGrid: React.FC<MatchupGridProps> = ({
  homeName,
  awayName,
  homeStarters,
  awayStarters,
  homeSubs,
  awaySubs,
  homeAbsentees,
  awayAbsentees,
}) => {
  return (
    <div className="space-y-6 text-sm">
      {/* Key Absentees & Team News */}
      <div className="bg-[#38003C] rounded-xl p-4 border border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#04F5FF] mb-3 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Key Absentees & Injuries
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#B9A9BB] uppercase block mb-1.5">{homeName}</span>
            {homeAbsentees.length > 0 ? (
              <ul className="space-y-1">
                {homeAbsentees.map((item, i) => (
                  <li key={i} className="text-xs text-white/90 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E90052]" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#00FF85]">No major injuries reported</p>
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-[#B9A9BB] uppercase block mb-1.5">{awayName}</span>
            {awayAbsentees.length > 0 ? (
              <ul className="space-y-1">
                {awayAbsentees.map((item, i) => (
                  <li key={i} className="text-xs text-white/90 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E90052]" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#00FF85]">No major injuries reported</p>
            )}
          </div>
        </div>
      </div>

      {/* Starting Lineups Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#38003C] rounded-xl p-4 border border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#00FF85]" />
            {homeName} Starting XI
          </h4>
          <ol className="space-y-1.5">
            {homeStarters.map((player, i) => (
              <li key={i} className="text-xs text-white/90 flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                <span className="text-[#B9A9BB] w-5 font-mono">{i + 1}.</span>
                <span className="flex-1 font-medium">{player}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-[#38003C] rounded-xl p-4 border border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#04F5FF]" />
            {awayName} Starting XI
          </h4>
          <ol className="space-y-1.5">
            {awayStarters.map((player, i) => (
              <li key={i} className="text-xs text-white/90 flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                <span className="text-[#B9A9BB] w-5 font-mono">{i + 1}.</span>
                <span className="flex-1 font-medium">{player}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Available Bench / Substitutes */}
      <div className="bg-[#38003C]/60 rounded-xl p-4 border border-white/5 text-xs text-[#B9A9BB]">
        <h4 className="font-semibold text-white uppercase text-[11px] mb-2 tracking-wider">Projected Bench Options</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <p><strong className="text-white">{homeName}:</strong> {homeSubs.join(', ')}</p>
          <p><strong className="text-white">{awayName}:</strong> {awaySubs.join(', ')}</p>
        </div>
      </div>
    </div>
  );
};
