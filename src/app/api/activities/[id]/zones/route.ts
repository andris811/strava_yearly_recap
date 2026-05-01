import { NextResponse } from 'next/server';
import { getTokens, setTokens } from '@/lib/server-auth';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

async function refreshAccessToken(refreshToken: string) {
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

async function fetchWithAuth(accessToken: string, endpoint: string) {
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokens = await getTokens();
    
    if (!tokens) {
      return NextResponse.json(
        { error: 'Not authenticated', needsAuth: true },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if token needs refresh
    const now = Math.floor(Date.now() / 1000);
    if (tokens.expires_at < now) {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      await setTokens(newTokens);
      tokens.access_token = newTokens.access_token;
    }

    // Fetch activity zones (heart rate and power zones)
    const zones = await fetchWithAuth(
      tokens.access_token,
      `/activities/${id}/zones`
    );

    return NextResponse.json({ zones });
  } catch (error) {
    console.error('[API] Error fetching activity zones:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch activity zones';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
