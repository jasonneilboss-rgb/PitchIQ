import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Shield, Trophy, Sparkles, Activity } from 'lucide-react';

const TABS = [
  { name: 'Today', path: '/', icon: Activity },
  { name: 'Matches', path: '/matches', icon: Calendar },
  { name: 'Teams', path: '/teams', icon: Shield },
  { name: 'Table', path: '/table', icon: Trophy },
  { name: 'Picks', path: '/picks', icon: Sparkles },
];

export const BottomTabs: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2B002E]/95 backdrop-blur-lg border-t border-[#4A0050] safe-area-pb">
      <div className="grid grid-cols-5 h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center pt-1 text-xs font-medium transition-colors ${
                  isActive ? 'text-[#E90052]' : 'text-[#B9A9BB] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 left-4 right-4 h-0.5 bg-[#E90052] rounded-full" />
                  )}
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-[#E90052]' : 'text-[#B9A9BB]'}`} />
                  <span className="text-[11px] leading-tight">{tab.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
