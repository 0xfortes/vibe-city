import { NextResponse } from 'next/server';

export async function POST() {
  // Phase 2+: Stripe webhook handler
  return NextResponse.json({ data: { message: 'Stripe endpoint — not yet implemented' } });
}
