import type { VercelRequest, VercelResponse } from '@vercel/node';

const FOOTBALL_DATA_BASE = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers so the browser can call this proxy
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  // The endpoint comes as a query param: /api/football?path=/competitions/PL/standings
  const path = req.query.path as string;

  if (!path) {
    return res.status(400).json({ error: 'Missing path query parameter' });
  }

  // Only allow football-data.org PL endpoints — security guard
  const allowedPrefixes = [
    '/competitions/PL',
    '/matches/',
    '/teams/',
  ];

  const isAllowed = allowedPrefixes.some(prefix => path.startsWith(prefix));
  if (!isAllowed) {
    return res.status(403).json({ error: 'Endpoint not permitted' });
  }

  try {
    // Build full query string (forward any query params like matchday, status etc.)
    const queryParams = { ...req.query };
    delete queryParams.path;
    const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();
    const fullUrl = `${FOOTBALL_DATA_BASE}${path}${queryString ? '?' + queryString : ''}`;

    const response = await fetch(fullUrl, {
      headers: {
        'X-Auth-Token': API_KEY,
      },
    });

    if (response.status === 429) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Rate limited' });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: response.statusText });
    }

    const data = await response.json();

    // Cache successful responses for 5 minutes at Vercel edge
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Proxy request failed' });
  }
}
