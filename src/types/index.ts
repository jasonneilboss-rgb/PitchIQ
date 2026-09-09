export interface Club {
  tla: string;
  name: string;
  short: string;
  primary: string;
  secondary: string;
  crest?: string;
  id?: number;
}

export interface StandingTeam {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface StandingsTable {
  stage: string;
  type: 'TOTAL' | 'HOME' | 'AWAY';
  group: string | null;
  table: StandingTeam[];
}

export interface MatchScore {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: string;
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime: {
    home: number | null;
    away: number | null;
  };
}

export interface Match {
  id: number;
  utcDate: string;
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | 'CANCELLED';
  matchday: number;
  stage: string;
  minute?: number;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  score: MatchScore;
  venue?: string;
}

export interface HeadToHead {
  numberOfMatches: number;
  totalGoals: number;
  homeTeam: {
    id: number;
    name: string;
    wins: number;
    draws: number;
    losses: number;
  };
  awayTeam: {
    id: number;
    name: string;
    wins: number;
    draws: number;
    losses: number;
  };
  matches?: Match[];
}

export interface Scorer {
  player: {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    nationality: string;
    section: string;
    position: string;
  };
  team: {
    id: number;
    name: string;
    shortName?: string;
    crest: string;
    tla: string;
  };
  playedMatches: number;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

export interface PickRecord {
  id: string;
  matchweek: number;
  homeTeam: string;
  awayTeam: string;
  predictedHome: number;
  predictedAway: number;
  predictedOutcome: 'HOME' | 'DRAW' | 'AWAY';
  actualHome: number | null;
  actualAway: number | null;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  source: 'AI' | 'ASSISTANT' | 'MANUAL';
  generatedAt: string;
  rationale?: string[];
  status?: 'HIT' | 'EXACT' | 'MISS' | 'PENDING';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface TeamDetail {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  squad: Array<{
    id: number;
    name: string;
    position: string;
    dateOfBirth: string;
    nationality: string;
  }>;
  coach: {
    id: number;
    name: string;
    nationality: string;
  };
}
