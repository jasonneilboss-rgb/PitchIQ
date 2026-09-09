import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, User } from 'lucide-react';
import { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.sender === 'assistant';

  return (
    <div className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-[#E90052] flex items-center justify-center shrink-0 shadow-md shadow-[#E90052]/20 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-lg ${
          isAssistant
            ? 'bg-[#38003C] text-white border border-[#4A0050]'
            : 'bg-[#E90052] text-white rounded-br-none ml-auto'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-white/10 text-[11px] font-semibold tracking-wider uppercase">
          <span className={isAssistant ? 'text-[#04F5FF]' : 'text-white/90'}>
            {isAssistant ? 'PitchIQ AI Picks Assistant' : 'You'}
          </span>
          <span className="text-[#B9A9BB] font-mono lowercase">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {isAssistant ? (
          <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed space-y-2 prose-headings:text-white prose-headings:font-bold prose-p:text-white/90 prose-strong:text-[#00FF85] prose-ul:my-2 prose-li:my-0.5">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        )}
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-[#4A0050] flex items-center justify-center shrink-0 border border-white/10 mt-1">
          <User className="w-4 h-4 text-[#B9A9BB]" />
        </div>
      )}
    </div>
  );
};
