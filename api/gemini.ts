import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_KEY = process.env.VITE_GEMINI_KEY || process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'Gemini key not configured on server' });
  }

  try {
    const response = await fetch(
      `${GEMINI_BASE}/models/${MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Gemini proxy error:', error);
    return res.status(500).json({ error: 'Gemini proxy failed' });
  }
}
