import { NextResponse } from 'next/server';

const OR_KEY = process.env.OPENROUTER_API_KEY ?? '';
const OR_URL = 'https://openrouter.ai/api/v1/auth/key';

interface OrKeyResponse {
  data?: {
    usage?: number;
    usage_daily?: number;
  };
}

interface SpendResponse {
  usage: number;
  usageToday: number;
}

const FALLBACK: SpendResponse = { usage: 0, usageToday: 0 };

export async function GET(): Promise<NextResponse> {
  if (!OR_KEY) return NextResponse.json(FALLBACK);

  try {
    const res = await fetch(OR_URL, {
      headers: { Authorization: `Bearer ${OR_KEY}` },
      next: { revalidate: 0 },
    });

    if (!res.ok) return NextResponse.json(FALLBACK);

    const json = (await res.json()) as OrKeyResponse;
    const usage = json.data?.usage ?? 0;
    const usageToday = json.data?.usage_daily ?? 0;

    return NextResponse.json({ usage, usageToday } satisfies SpendResponse);
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
