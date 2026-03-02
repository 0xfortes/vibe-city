import { NextResponse } from 'next/server';

export async function POST() {
  // Phase 2+: Auth callback handler
  return NextResponse.json({ data: { message: 'Auth endpoint — not yet implemented' } });
}
