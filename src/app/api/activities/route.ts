import { NextResponse } from 'next/server';
import { getTokens, setTokens } from '@/lib/server-auth';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

let cachedActivities: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 30;

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string; expires_at: number }> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing client configuration');
  }

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return response.json();
}

async function fetchWithAuth(accessToken: string, endpoint: string): Promise<any> {
  let response = await fetch(`${STRAVA_API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 401) {
    const tokens = await getTokens();
    if (tokens) {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      await setTokens(newTokens);
      response = await fetch(`${STRAVA_API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${newTokens.access_token}` },
      });
    }
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const tokens = await getTokens();
    
    if (!tokens) {
      return NextResponse.json(
        { error: 'Not authenticated', needsAuth: true },
        { status: 401 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    if (tokens.expires_at < now) {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      await setTokens(newTokens);
      tokens.access_token = newTokens.access_token;
      tokens.refresh_token = newTokens.refresh_token;
      tokens.expires_at = newTokens.expires_at;
    }

    if (cachedActivities && Date.now() - cacheTimestamp < CACHE_DURATION) {
      const { getAvailableYears } = await import('@/lib/strava');
      const years = getAvailableYears(cachedActivities);
      return NextResponse.json({ activities: cachedActivities, years });
    }

    const activities: any[] = [];
    let page = 1;
    const perPage = 200;

    while (true) {
      const data = await fetchWithAuth(
        tokens.access_token,
        `/athlete/activities?page=${page}&per_page=${perPage}`
      );
      
      if (!data || data.length === 0) break;
      
      activities.push(...data);
      
      if (data.length < perPage) break;
      page++;
    }

    cachedActivities = activities;
    cacheTimestamp = Date.now();
    
    const { getAvailableYears } = await import('@/lib/strava');
    const years = getAvailableYears(activities);
    
    return NextResponse.json({ activities, years });
  } catch (error) {
    console.error('[API] Error fetching activities:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch activities';
    const needsAuth = message.includes('Not authenticated');
    return NextResponse.json(
      { error: message, needsAuth },
      { status: needsAuth ? 401 : 500 }
    );
  }
}