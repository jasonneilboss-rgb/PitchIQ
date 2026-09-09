import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Shield, Trophy, Sparkles, Activity, Clock } from 'lucide-react';
import { formatToSAST } from '../../utils/date';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Today', path: '/', icon: Activity },
  { name: 'Matches', path: '/matches', icon: Calendar },
  { name: 'Teams', path: '/teams', icon: Shield },
  { name: 'Table', path: '/table', icon: Trophy },
  { name: 'Picks', path: '/picks', icon: Sparkles },
];

export const Navbar: React.FC = () => {
  const [sastTime, setSastTime] = useState(formatToSAST(new Date().toISOString(), 'HH:mm:ss'));

  useEffect(() => {
    const timer = setInterval(() => {
      setSastTime(formatToSAST(new Date().toISOString(), 'HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#2B002E]/95 backdrop-blur-md border-b border-[#4A0050]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#38003C] border border-[#E90052]/50 flex items-center justify-center shadow-lg shadow-[#E90052]/10">
            <span className="text-[#E90052] font-black text-lg tracking-tighter">GE</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                Gaffers<span className="text-[#E90052]">Edge</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-widest uppercase bg-[#04F5FF]/15 text-[#04F5FF] border border-[#04F5FF]/30">
                26/27
              </span>
            </div>
            <p className="text-[10px] text-[#B9A9BB] uppercase tracking-wider hidden sm:block">
              Premier League Intelligence
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                    isActive
                      ? 'text-[#E90052] bg-[#4A0050]/50'
                      : 'text-[#B9A9BB] hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E90052]' : 'text-[#B9A9BB]'}`} />
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#E90052] rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Live SAST Clock & Meta */}
        <div className="flex items-center gap-2 text-xs text-[#B9A9BB]">
          <div className="hidden sm:flex items-center gap-1.5 bg-[#38003C] px-3 py-1.5 rounded-full border border-white/5">
            <Clock className="w-3.5 h-3.5 text-[#04F5FF]" />
            <span className="font-mono text-white font-medium">{sastTime}</span>
            <span className="text-[10px] text-[#04F5FF] font-bold uppercase tracking-wider">SAST</span>
          </div>
        </div>
      </div>
    </header>
  );
};
