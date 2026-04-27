import { cookies } from 'next/headers';

const TOKEN_COOKIE = 'strava_tokens';

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export async function getTokens(): Promise<StravaTokens | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(TOKEN_COOKIE);
  
  if (!tokenCookie?.value) {
    return null;
  }
  
  try {
    return JSON.parse(tokenCookie.value);
  } catch {
    return null;
  }
}

export async function setTokens(tokens: StravaTokens): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(TOKEN_COOKIE, JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokens.expires_at - Math.floor(Date.now() / 1000),
    path: '/',
  });
}