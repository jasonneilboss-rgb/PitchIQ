export interface ClubInfo {
  tla: string;
  name: string;
  short: string;
  primary: string;
  secondary: string;
  id: number;
  crest: string;
}

export const CLUB_DATA: ClubInfo[] = [
  {
    tla: 'ARS',
    name: 'Arsenal',
    short: 'Arsenal',
    primary: '#EF0107',
    secondary: '#FFFFFF',
    id: 57,
    crest: 'https://crests.football-data.org/57.png',
  },
  {
    tla: 'AVL',
    name: 'Aston Villa',
    short: 'Villa',
    primary: '#670E36',
    secondary: '#95BFE5',
    id: 58,
    crest: 'https://crests.football-data.org/58.png',
  },
  {
    tla: 'BOU',
    name: 'AFC Bournemouth',
    short: 'Bournemouth',
    primary: '#DA291C',
    secondary: '#000000',
    id: 1044,
    crest: 'https://crests.football-data.org/1044.png',
  },
  {
    tla: 'BRE',
    name: 'Brentford',
    short: 'Brentford',
    primary: '#E30613',
    secondary: '#FBB800',
    id: 402,
    crest: 'https://crests.football-data.org/402.png',
  },
  {
    tla: 'BHA',
    name: 'Brighton',
    short: 'Brighton',
    primary: '#0057B8',
    secondary: '#FFCD00',
    id: 397,
    crest: 'https://crests.football-data.org/397.png',
  },
  {
    tla: 'CHE',
    name: 'Chelsea',
    short: 'Chelsea',
    primary: '#034694',
    secondary: '#FFFFFF',
    id: 61,
    crest: 'https://crests.football-data.org/61.png',
  },
  {
    tla: 'COV',
    name: 'Coventry City',
    short: 'Coventry',
    primary: '#059DD9',
    secondary: '#FFFFFF',
    id: 1076,
    crest: 'https://crests.football-data.org/1076.png',
  },
  {
    tla: 'CRY',
    name: 'Crystal Palace',
    short: 'Palace',
    primary: '#1B458F',
    secondary: '#C4122E',
    id: 354,
    crest: 'https://crests.football-data.org/354.png',
  },
  {
    tla: 'EVE',
    name: 'Everton',
    short: 'Everton',
    primary: '#003399',
    secondary: '#FFFFFF',
    id: 62,
    crest: 'https://crests.football-data.org/62.png',
  },
  {
    tla: 'FUL',
    name: 'Fulham',
    short: 'Fulham',
    primary: '#000000',
    secondary: '#CC0000',
    id: 63,
    crest: 'https://crests.football-data.org/63.png',
  },
  {
    tla: 'HUL',
    name: 'Hull City',
    short: 'Hull',
    primary: '#F18A01',
    secondary: '#000000',
    id: 322,
    crest: 'https://crests.football-data.org/322.png',
  },
  {
    tla: 'IPS',
    name: 'Ipswich Town',
    short: 'Ipswich',
    primary: '#0044A9',
    secondary: '#FFFFFF',
    id: 349,
    crest: 'https://crests.football-data.org/349.png',
  },
  {
    tla: 'LEE',
    name: 'Leeds United',
    short: 'Leeds',
    primary: '#FFCD00',
    secondary: '#1D428A',
    id: 341,
    crest: 'https://crests.football-data.org/341.png',
  },
  {
    tla: 'LIV',
    name: 'Liverpool',
    short: 'Liverpool',
    primary: '#C8102E',
    secondary: '#00B2A9',
    id: 64,
    crest: 'https://crests.football-data.org/64.png',
  },
  {
    tla: 'MCI',
    name: 'Manchester City',
    short: 'Man City',
    primary: '#6CABDD',
    secondary: '#1C2C5B',
    id: 65,
    crest: 'https://crests.football-data.org/65.png',
  },
  {
    tla: 'MUN',
    name: 'Manchester United',
    short: 'Man Utd',
    primary: '#DA020E',
    secondary: '#FBE122',
    id: 66,
    crest: 'https://crests.football-data.org/66.png',
  },
  {
    tla: 'NEW',
    name: 'Newcastle United',
    short: 'Newcastle',
    primary: '#241F20',
    secondary: '#FFFFFF',
    id: 67,
    crest: 'https://crests.football-data.org/67.png',
  },
  {
    tla: 'NFO',
    name: 'Nottm Forest',
    short: 'Forest',
    primary: '#DD0000',
    secondary: '#FFFFFF',
    id: 351,
    crest: 'https://crests.football-data.org/351.png',
  },
  {
    tla: 'SUN',
    name: 'Sunderland',
    short: 'Sunderland',
    primary: '#EB172B',
    secondary: '#FFFFFF',
    id: 71,
    crest: 'https://crests.football-data.org/71.png',
  },
  {
    tla: 'TOT',
    name: 'Tottenham',
    short: 'Spurs',
    primary: '#132257',
    secondary: '#FFFFFF',
    id: 73,
    crest: 'https://crests.football-data.org/73.png',
  },
];

export const CLUB_MAP = new Map<string, ClubInfo>(
  CLUB_DATA.map((c) => [c.tla, c])
);

export function getClubByTlaOrName(query: string): ClubInfo | undefined {
  if (!query) return undefined;
  const upper = query.toUpperCase();
  const direct = CLUB_MAP.get(upper);
  if (direct) return direct;
  return CLUB_DATA.find(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.short.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(c.short.toLowerCase())
  );
}
