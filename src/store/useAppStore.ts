import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PickRecord, ChatMessage } from '../types';

interface AppState {
  selectedMatchweek: number;
  setSelectedMatchweek: (mw: number) => void;
  recentTeams: string[]; // TLAs
  addRecentTeam: (tla: string) => void;
  picks: PickRecord[];
  addPick: (pick: PickRecord) => void;
  updatePick: (id: string, updates: Partial<PickRecord>) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  dailyAiRead: { date: string; text: string } | null;
  setDailyAiRead: (read: { date: string; text: string }) => void;
  rateLimitCountdown: number | null; // Seconds remaining if 429 received
  setRateLimitCountdown: (sec: number | null) => void;
  isStaleData: boolean;
  setIsStaleData: (stale: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedMatchweek: 4,
      setSelectedMatchweek: (mw) => set({ selectedMatchweek: mw }),
      recentTeams: ['ARS', 'MCI', 'LIV', 'CHE', 'AVL', 'TOT'],
      addRecentTeam: (tla) => {
        const current = get().recentTeams.filter((t) => t !== tla);
        set({ recentTeams: [tla, ...current].slice(0, 6) });
      },
      picks: [
        {
          id: 'seed-pick-1',
          matchweek: 3,
          homeTeam: 'Arsenal',
          awayTeam: 'Brighton',
          predictedHome: 2,
          predictedAway: 1,
          predictedOutcome: 'HOME',
          actualHome: 1,
          actualAway: 1,
          confidence: 'HIGH',
          source: 'AI',
          generatedAt: '2026-08-30T10:00:00Z',
          status: 'MISS',
          rationale: [
            'Arsenal high pressing at Emirates',
            'Brighton transition threat through Mitoma',
            'Home advantage key factor'
          ]
        },
        {
          id: 'seed-pick-2',
          matchweek: 3,
          homeTeam: 'Man City',
          awayTeam: 'West Ham',
          predictedHome: 3,
          predictedAway: 1,
          predictedOutcome: 'HOME',
          actualHome: 3,
          actualAway: 1,
          confidence: 'HIGH',
          source: 'AI',
          generatedAt: '2026-08-30T10:00:00Z',
          status: 'EXACT',
          rationale: [
            'Haaland in prime scoring form',
            'City dominant possession expected',
            'West Ham counter attacks isolated'
          ]
        },
        {
          id: 'seed-pick-3',
          matchweek: 3,
          homeTeam: 'Man Utd',
          awayTeam: 'Liverpool',
          predictedHome: 1,
          predictedAway: 2,
          predictedOutcome: 'AWAY',
          actualHome: 0,
          actualAway: 3,
          confidence: 'MEDIUM',
          source: 'AI',
          generatedAt: '2026-08-30T10:00:00Z',
          status: 'HIT',
          rationale: [
            'Liverpool midfield control stronger',
            'United defensive transitions vulnerable'
          ]
        },
      ],
      addPick: (pick) => set({ picks: [pick, ...get().picks] }),
      updatePick: (id, updates) =>
        set({
          picks: get().picks.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }),
      chatHistory: [],
      addChatMessage: (msg) => {
        const trimmed = [...get().chatHistory, msg].slice(-20);
        set({ chatHistory: trimmed });
      },
      clearChat: () => set({ chatHistory: [] }),
      dailyAiRead: null,
      setDailyAiRead: (read) => set({ dailyAiRead: read }),
      rateLimitCountdown: null,
      setRateLimitCountdown: (sec) => set({ rateLimitCountdown: sec }),
      isStaleData: false,
      setIsStaleData: (stale) => set({ isStaleData: stale }),
    }),
    {
      name: 'gaffersedge_store',
      partialize: (state) => ({
        selectedMatchweek: state.selectedMatchweek,
        recentTeams: state.recentTeams,
        picks: state.picks,
        chatHistory: state.chatHistory,
        dailyAiRead: state.dailyAiRead,
      }),
    }
  )
);
