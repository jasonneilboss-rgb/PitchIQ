import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#38003C] rounded-2xl max-w-sm border border-white/5 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-[#E90052]/20 border border-[#E90052]/40 flex items-center justify-center shrink-0">
        <span className="text-xs font-black text-[#E90052]">AI</span>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-[#04F5FF]">PitchIQ Assistant is analyzing...</p>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#04F5FF] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#04F5FF] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#04F5FF] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
