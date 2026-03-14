import { NextResponse } from 'next/server';

// MEMORY stage is manual — the UI prompts the user and this endpoint
// is called when they click "Confirm". Nothing to execute server-side.
export async function POST() {
  return NextResponse.json({ confirmed: true });
}
