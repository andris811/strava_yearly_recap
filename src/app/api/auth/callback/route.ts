import { NextResponse } from 'next/server';
import { setTokens } from '@/lib/server-auth';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/?error=auth_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', request.url));
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const callbackUrl = process.env.STRAVA_CALLBACK_URL;

  if (!clientId || !clientSecret || !callbackUrl) {
    return NextResponse.redirect(new URL('/?error=missing_config', request.url));
  }

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      console.error('Token exchange failed:', await response.text());
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    const data: TokenResponse = await response.json();
    
    await setTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    });

    return NextResponse.redirect(new URL('/', request.url));
  } catch (err) {
    console.error('OAuth error:', err);
    return NextResponse.redirect(new URL('/?error=oauth_error', request.url));
  }
}