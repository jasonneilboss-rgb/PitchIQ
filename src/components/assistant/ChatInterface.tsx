import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MessageBubble } from './MessageBubble';
import { QuickChips } from './QuickChips';
import { TypingIndicator } from './TypingIndicator';
import { sendPicksAssistantMessage } from '../../api/gemini';
import { formatToSAST } from '../../utils/date';
import { Match } from '../../types';

interface ChatInterfaceProps {
  currentStandings?: any[];
  upcomingMatches?: Match[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentStandings = [],
  upcomingMatches = [],
}) => {
  const { chatHistory, addChatMessage, clearChat, picks } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim() || isTyping) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      text: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    if (!messageText) setInputValue('');
    setIsTyping(true);

    // Build context payload
    const top6 = currentStandings
      .slice(0, 6)
      .map((t) => `${t.position}. ${t.team?.name || t.team?.shortName} (${t.points} pts, Form: ${t.form || 'N/A'})`)
      .join('; ');

    const bottom3 = currentStandings
      .slice(-3)
      .map((t) => `${t.position}. ${t.team?.name || t.team?.shortName} (${t.points} pts)`)
      .join('; ');

    const fixturesSummary = upcomingMatches
      .map((m) => `${m.homeTeam.name} vs ${m.awayTeam.name} (${formatToSAST(m.utcDate, 'EEE HH:mm')} SAST)`)
      .join('; ');

    try {
      const assistantText = await sendPicksAssistantMessage(
        textToSend,
        {
          standingsTop6: top6 || 'MCI (12pts), ARS (10pts), LIV (9pts), CHE (8pts), AVL (7pts), NEW (7pts)',
          standingsBottom3: bottom3 || 'IPS (2pts), COV (1pt), HUL (1pt)',
          upcomingFixtures: fixturesSummary || 'Current matchweek slate in SAST',
          recentPicks: picks.slice(0, 10),
        },
        chatHistory
      );

      const assistantMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant' as const,
        text: assistantText,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(assistantMessage);
    } catch {
      const errorMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant' as const,
        text: "I encountered a momentary connection error while evaluating match telemetry. Please try again.\n\nPersonal analysis only. Not betting advice.",
        timestamp: new Date().toISOString(),
      };
      addChatMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="flex flex-col h-[650px] bg-[#4A0050] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="px-5 py-3.5 bg-[#38003C] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#E90052] flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              PitchIQ Picks Assistant
            </h3>
            <span className="text-[10px] text-[#00FF85] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF85] animate-pulse" />
              Gemini 2.5 Flash &bull; Full EPL Context Loaded
            </span>
          </div>
        </div>

        {chatHistory.length > 0 && (
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="p-1.5 text-[#B9A9BB] hover:text-[#E90052] rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#38003C] border border-[#E90052]/30 flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-[#04F5FF]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white uppercase tracking-wider">
                Weekly Picks AI Routine
              </h4>
              <p className="text-xs text-[#B9A9BB] max-w-sm mt-1">
                Ask for scoreline predictions, scoring of your previous round picks, bankers, upset alerts, or tactical previews.
              </p>
            </div>
            <QuickChips onSelect={handleSend} disabled={isTyping} />
          </div>
        ) : (
          <>
            {chatHistory.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Action Chips if chat is active */}
      {chatHistory.length > 0 && (
        <div className="px-4 bg-[#38003C]/50 border-t border-white/5">
          <QuickChips onSelect={handleSend} disabled={isTyping} />
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-[#38003C] border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about matchweek picks, bankers, score predictions..."
          disabled={isTyping}
          className="flex-1 bg-[#2B002E] text-white text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-[#E90052] transition-colors placeholder:text-[#B9A9BB]/60 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="bg-[#E90052] hover:bg-[#E90052]/90 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold transition-transform active:scale-95 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shadow-md shadow-[#E90052]/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
