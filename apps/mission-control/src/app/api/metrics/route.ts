import { NextResponse } from 'next/server';
import fs from 'fs';

const DATA_FILE = '/Users/openclaw/.openclaw/workspace/lookout-data.json';

interface DayEntry {
  date: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalSpend: number;
  prsMerged: number;
  rewinds: number;
  maxContextPercent: number;
  sessionsStarted: number;
  rewindStreak: number;
}

interface LookoutData { days: DayEntry[] }

function readData(): LookoutData {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as LookoutData;
  } catch {
    return { days: [] };
  }
}

function writeData(data: LookoutData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(readData());
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as Partial<DayEntry>;
  const today = new Date().toISOString().slice(0, 10);
  const date = body.date ?? today;
  const data = readData();

  const idx = data.days.findIndex((d) => d.date === date);
  const existing = idx >= 0 ? data.days[idx]! : {
    date, totalInputTokens: 0, totalOutputTokens: 0, totalSpend: 0,
    prsMerged: 0, rewinds: 0, maxContextPercent: 0, sessionsStarted: 0, rewindStreak: 0,
  };

  const updated: DayEntry = {
    ...existing,
    ...body,
    date,
    maxContextPercent: Math.max(existing.maxContextPercent, body.maxContextPercent ?? 0),
  };

  if (idx >= 0) data.days[idx] = updated;
  else data.days.push(updated);

  writeData(data);
  return NextResponse.json(updated);
}
