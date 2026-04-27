export function getOAuthUrl(): string {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const callbackUrl = process.env.STRAVA_CALLBACK_URL;
  
  if (!clientId || !callbackUrl) {
    throw new Error('Missing Strava OAuth configuration');
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'activity:read_all',
  });
  
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}