import { useAppStore } from '../store/useAppStore';
import {
  MOCK_STANDINGS,
  MOCK_FIXTURES,
  MOCK_SCORERS,
  getMockH2H,
  CURRENT_MATCHWEEK,
} from './mockData';
import { StandingsTable, Match, Scorer, HeadToHead, TeamDetail } from '../types';
import { CLUB_DATA } from '../constants/clubs';

// No API key needed in the browser — proxy handles it server-side
const PROXY_BASE = '/api/football';

// Rate limit helper: start countdown if 429 received
let rateLimitTimer: NodeJS.Timeout | null = null;
function triggerRateLimitBanner() {
  const store = useAppStore.getState();
  store.setRateLimitCountdown(60);

  if (rateLimitTimer) clearInterval(rateLimitTimer);
  rateLimitTimer = setInterval(() => {
    const current = useAppStore.getState().rateLimitCountdown;
    if (current && current > 1) {
      useAppStore.getState().setRateLimitCountdown(current - 1);
    } else {
      useAppStore.getState().setRateLimitCountdown(null);
      if (rateLimitTimer) clearInterval(rateLimitTimer);
    }
  }, 1000);
}

async function requestFootballData<T>(
  endpoint: string,
  fallbackData: T
): Promise<{ data: T; isStale: boolean }> {

  console.log('PitchIQ API call via proxy:', endpoint);

  try {
    // Call our Vercel proxy with the endpoint as a query param
    const proxyUrl = `${PROXY_BASE}?path=${encodeURIComponent(endpoint)}`;
    
    const response = await fetch(proxyUrl);

    if (response.status === 429) {
      console.warn('Rate limited');
      triggerRateLimitBanner();
      useAppStore.getState().setIsStaleData(true);
      useAppStore.getState().setStaleReason('sync_failed');
      return { data: fallbackData, isStale: true };
    }

    if (!response.ok) {
      console.warn(`Proxy error: ${response.status}`);
      useAppStore.getState().setIsStaleData(true);
      useAppStore.getState().setStaleReason('sync_failed');
      return { data: fallbackData, isStale: true };
    }

    const data = await response.json();
    useAppStore.getState().setIsStaleData(false);
    useAppStore.getState().setStaleReason(null);
    return { data, isStale: false };

  } catch (error) {
    console.warn('Proxy call failed:', error);
    useAppStore.getState().setIsStaleData(true);
    useAppStore.getState().setStaleReason('sync_failed');
    return { data: fallbackData, isStale: true };
  }
}

/**
 * Fetch Standings for PL
 */
export async function fetchStandings(): Promise<{ standings: StandingsTable[]; season: any; currentMatchday: number; isStale: boolean }> {
  console.log('fetchStandings called');

  const fallback = {
    standings: MOCK_STANDINGS,
    season: { id: 2026, currentMatchday: CURRENT_MATCHWEEK },
    currentMatchday: CURRENT_MATCHWEEK,
  };

  const res = await requestFootballData<{ standings: StandingsTable[]; season: any }>('/competitions/PL/standings', fallback);

  console.log('fetchStandings result - isStale:', res.isStale);
  console.log('fetchStandings result - data:', res.data);

  return {
    standings: res.data.standings || MOCK_STANDINGS,
    season: res.data.season,
    currentMatchday: res.data.season?.currentMatchday || CURRENT_MATCHWEEK,
    isStale: res.isStale,
  };
}

/**
 * Fetch Matches / Fixtures for PL
 */
export async function fetchFixtures(matchday?: number): Promise<{ matches: Match[]; isStale: boolean }> {
  const endpoint = matchday ? `/competitions/PL/matches?matchday=${matchday}` : '/competitions/PL/matches';
  
  let fallbackMatches = MOCK_FIXTURES;
  if (matchday) {
    fallbackMatches = MOCK_FIXTURES.filter((m) => m.matchday === matchday);
    if (fallbackMatches.length === 0) {
      // Generate synthetic round if matchday is outside 4-5
      fallbackMatches = Array.from({ length: 10 }, (_, i) => {
        const homeClub = CLUB_DATA[i * 2];
        const awayClub = CLUB_DATA[i * 2 + 1];
        return {
          id: matchday * 100 + i,
          matchday,
          utcDate: new Date(Date.now() + (matchday - CURRENT_MATCHWEEK) * 7 * 24 * 3600 * 1000 + i * 3600 * 2000).toISOString(),
          status: 'SCHEDULED',
          stage: 'REGULAR_SEASON',
          venue: `${homeClub.name} Stadium`,
          homeTeam: { id: homeClub.id, name: homeClub.name, shortName: homeClub.short, tla: homeClub.tla, crest: homeClub.crest },
          awayTeam: { id: awayClub.id, name: awayClub.name, shortName: awayClub.short, tla: awayClub.tla, crest: awayClub.crest },
          score: { winner: null, duration: 'REGULAR', fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
        };
      });
    }
  }

  const res = await requestFootballData<{ matches: Match[] }>(endpoint, { matches: fallbackMatches });
  return {
    matches: res.data.matches || fallbackMatches,
    isStale: res.isStale,
  };
}

/**
 * Fetch live matches currently in play
 */
export async function fetchLiveMatches(): Promise<{ matches: Match[]; isStale: boolean }> {
  const liveFallback = MOCK_FIXTURES.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const res = await requestFootballData<{ matches: Match[] }>('/competitions/PL/matches?status=IN_PLAY,PAUSED', { matches: liveFallback });
  return {
    matches: res.data.matches || liveFallback,
    isStale: res.isStale,
  };
}

/**
 * Fetch Top Scorers
 */
export async function fetchTopScorers(): Promise<{ scorers: Scorer[]; isStale: boolean }> {
  const res = await requestFootballData<{ scorers: Scorer[] }>('/competitions/PL/scorers?limit=10', { scorers: MOCK_SCORERS });
  return {
    scorers: res.data.scorers || MOCK_SCORERS,
    isStale: res.isStale,
  };
}

/**
 * Fetch Head-to-Head for a match
 */
export async function fetchHeadToHead(matchId: number, homeName: string, awayName: string): Promise<{ h2h: HeadToHead; isStale: boolean }> {
  const fallback = getMockH2H(homeName, awayName);
  const res = await requestFootballData<{ aggregates: HeadToHead; matches?: Match[] }>(
    `/matches/${matchId}/head2head`,
    { aggregates: fallback }
  );
  return {
    h2h: res.data.aggregates || fallback,
    isStale: res.isStale,
  };
}

/**
 * Fetch Team Details & Squad
 */
export async function fetchTeamDetail(teamId: number, clubShort: string): Promise<{ team: TeamDetail; isStale: boolean }> {
  const club = CLUB_DATA.find((c) => c.id === teamId || c.short.toLowerCase() === clubShort.toLowerCase()) || CLUB_DATA[0];
  const fallback: TeamDetail = {
    id: club.id,
    name: club.name,
    shortName: club.short,
    tla: club.tla,
    crest: club.crest,
    address: 'Premier League HQ, London, UK',
    website: `https://${club.short.toLowerCase().replace(/\s+/g, '')}.com`,
    founded: 1892,
    clubColors: `${club.primary} / ${club.secondary}`,
    venue: `${club.name} Stadium`,
    squad: [
      { id: 101, name: 'David Raya', position: 'Goalkeeper', dateOfBirth: '1995-09-15', nationality: 'Spain' },
      { id: 102, name: 'William Saliba', position: 'Defender', dateOfBirth: '2001-03-24', nationality: 'France' },
      { id: 103, name: 'Gabriel Magalhaes', position: 'Defender', dateOfBirth: '1997-12-19', nationality: 'Brazil' },
      { id: 104, name: 'Declan Rice', position: 'Midfielder', dateOfBirth: '1999-01-14', nationality: 'England' },
      { id: 105, name: 'Martin Ødegaard', position: 'Midfielder', dateOfBirth: '1998-12-17', nationality: 'Norway' },
      { id: 106, name: 'Bukayo Saka', position: 'Forward', dateOfBirth: '2001-09-05', nationality: 'England' },
      { id: 107, name: 'Kai Havertz', position: 'Forward', dateOfBirth: '1999-06-11', nationality: 'Germany' },
    ],
    coach: { id: 201, name: 'Mikel Arteta', nationality: 'Spain' },
  };

  const res = await requestFootballData<TeamDetail>(`/teams/${teamId}`, fallback);
  return {
    team: res.data || fallback,
    isStale: res.isStale,
  };
}
