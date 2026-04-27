import { NextResponse } from 'next/server';
import { getOAuthUrl } from '@/lib/oauth';

export async function GET() {
  try {
    const url = getOAuthUrl();
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate OAuth URL' },
      { status: 500 }
    );
  }
}