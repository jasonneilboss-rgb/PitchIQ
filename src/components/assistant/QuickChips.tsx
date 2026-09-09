import React from 'react';
import { Sparkles, CheckCircle2, Target, AlertTriangle } from 'lucide-react';

interface QuickChipsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const CHIP_OPTIONS = [
  {
    label: 'Full Routine (Score + Picks)',
    prompt: 'Run the FULL ROUTINE: score the previous matchweek and generate comprehensive picks for the upcoming fixtures.',
    icon: Sparkles,
  },
  {
    label: 'Score Previous Round',
    prompt: 'Please score my previous round picks against actual results and provide the summary.',
    icon: CheckCircle2,
  },
  {
    label: 'Upcoming Matchweek Picks',
    prompt: 'Give me your W/D/L picks and exact scoreline predictions for the current matchweek.',
    icon: Target,
  },
  {
    label: 'Banker & Upset Alert',
    prompt: 'Which fixture is this week\'s absolute banker, and where is the biggest upset alert?',
    icon: AlertTriangle,
  },
];

export const QuickChips: React.FC<QuickChipsProps> = ({ onSelect, disabled }) => {
  return (
    <div className="flex flex-wrap gap-2 py-2">
      {CHIP_OPTIONS.map((chip, idx) => {
        const Icon = chip.icon;
        return (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(chip.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#38003C] hover:bg-[#4A0050] text-[#04F5FF] hover:text-white border border-[#04F5FF]/30 hover:border-[#04F5FF] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
};
