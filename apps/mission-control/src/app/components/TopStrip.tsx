'use client';

import { useState } from 'react';
import type { RewindStateFile } from '../api/rewind/rewind-state-file';

const PIXEL = "'Press Start 2P', monospace";

export interface SessionData {
  tokens: number;
  cap: number;
  percent: number;
  outputTokens: number;
  messageCount: number;
  systemTokens: number;
  convoTokens: number;
  rewindSavings: number;
  rewindSavingsPct: number;
}

export interface SpendData {
  usage: number;
  usageToday: number;
}

export interface TopStripProps {
  session: SessionData;
  spend: SpendData;
  rewindState: RewindStateFile;
  onRewind: () => void;
  onCancel: () => void;
}

function contextBarColor(pct: number): string {
  if (pct < 25) return '#4090d0';
  if (pct < 50) return '#40b0a0';
  if (pct < 75) return '#d0a030';
  return '#c04848';
}

function creditsBarColor(remaining: number): string {
  if (remaining > 50) return '#50b050';
  if (remaining > 20) return '#d0a030';
  return '#c04848';
}

function dailyBarColor(pct: number): string {
  if (pct < 50) return '#50b050';
  if (pct < 80) return '#d0a030';
  return '#c04848';
}

function dailyValueColor(spend: number, cap: number): string {
  const pct = (spend / cap) * 100;
  if (spend > cap) return '#c04848';
  if (pct < 50) return '#50b050';
  if (pct < 80) return '#d0a030';
  return '#c04848';
}

export function TopStrip({ session, spend, rewindState, onRewind, onCancel }: TopStripProps) {
  const [hovered, setHovered] = useState(false);

  const { percent, tokens, cap, rewindSavingsPct } = session;
  const usedK = Math.round(tokens / 1000);
  const capK = Math.round(cap / 1000);
  const savingsK = Math.round((rewindSavingsPct / 100) * cap / 1000);

  const totalPct = Math.min(percent, 100);
  const basePct = Math.max(0, totalPct - rewindSavingsPct);

  const isRewindActive =
    rewindState.status === 'running' ||
    rewindState.status === 'done' ||
    rewindState.status === 'failed';

  // Credits: $200 budget, usage is total spend
  const totalUsage = spend.usage;
  const creditsRemaining = Math.max(0, 200 - totalUsage);
  const creditsPct = Math.min((creditsRemaining / 200) * 100, 100);

  // Daily spend
  const dailyCap = 100;
  const dailySpend = spend.usageToday;
  const dailyPct = Math.min((dailySpend / dailyCap) * 100, 100);
  const dailyOver = dailySpend > dailyCap;

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1.0; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: 'rgba(10,6,16,0.95)',
          padding: '6px 12px',
          fontFamily: PIXEL,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        {/* Row 1 — Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#f0c860', letterSpacing: '2px' }}>
            ALBUS&apos;S LOOKOUT
          </span>
          <span style={{ fontSize: 8, color: '#6a5880' }}>Nick Grover HQ — Token Command</span>
        </div>

        {/* Row 2 — Context bar */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 7,
              color: '#8a78a0',
              width: 58,
              textAlign: 'right',
              flexShrink: 0,
            }}
          >
            CONTEXT
          </span>
          <div style={{ width: 8, flexShrink: 0 }} />
          {/* Bar */}
          <div
            style={{
              flex: 1,
              height: 14,
              borderRadius: 3,
              background: 'rgba(20,14,30,0.9)',
              border: '1px solid #2a2040',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Layer 1 - base (non-recoverable) */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${basePct}%`,
                background: '#1a3060',
              }}
            />
            {/* Layer 2 - total (color-coded) */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${totalPct}%`,
                background: contextBarColor(totalPct),
                opacity: 0.85,
                transition: 'width 0.5s',
              }}
            />
          </div>
          <div style={{ width: 8, flexShrink: 0 }} />
          {/* Values */}
          <span style={{ fontSize: 10, color: '#f0c860', fontWeight: 'bold', flexShrink: 0 }}>
            {Math.round(percent)}%
          </span>
          <span style={{ fontSize: 8, color: '#6a5880', flexShrink: 0, marginLeft: 4 }}>
            {usedK}K / {capK}K
          </span>
          {savingsK > 2 && (
            <>
              <div style={{ width: 8, flexShrink: 0 }} />
              <span style={{ fontSize: 7, color: '#40b0a0', flexShrink: 0 }}>
                rewind saves ~{savingsK}K
              </span>
            </>
          )}
          <div style={{ width: 8, flexShrink: 0 }} />
          {/* REWIND button */}
          <button
            onClick={isRewindActive ? onCancel : onRewind}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              background: hovered ? 'rgba(100,50,150,0.85)' : 'rgba(80,40,120,0.7)',
              border: `1.5px solid ${hovered ? '#b078f0' : '#9058d0'}`,
              borderRadius: 4,
              padding: '3px 10px',
              fontFamily: PIXEL,
              fontSize: 8,
              color: '#d8b8ff',
              letterSpacing: '1px',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            {isRewindActive ? 'CANCEL' : 'REWIND'}
          </button>
        </div>

        {/* Row 3 — Credits + Daily Spend */}
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Credits (left half) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 7, color: '#8a78a0', flexShrink: 0 }}>CREDITS</span>
            <div
              style={{
                flex: 1,
                height: 10,
                borderRadius: 2,
                background: 'rgba(20,14,30,0.9)',
                border: '1px solid #2a2040',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${creditsPct}%`,
                  background: creditsBarColor(creditsRemaining),
                  transition: 'width 0.5s',
                }}
              />
            </div>
            <span style={{ fontSize: 9, color: '#f0c860', fontWeight: 'bold', flexShrink: 0 }}>
              ${creditsRemaining.toFixed(0)}
            </span>
            <span style={{ fontSize: 7, color: '#6a5880', flexShrink: 0 }}>/ $200</span>
          </div>

          {/* Daily Spend (right half) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 7, color: '#8a78a0', flexShrink: 0 }}>DAILY $</span>
            <div
              style={{
                flex: 1,
                height: 10,
                borderRadius: 2,
                background: 'rgba(20,14,30,0.9)',
                border: '1px solid #2a2040',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: dailyOver ? '100%' : `${dailyPct}%`,
                  background: dailyBarColor(dailyPct),
                  transition: 'width 0.5s',
                }}
              />
            </div>
            <span
              style={{
                fontSize: 9,
                color: dailyValueColor(dailySpend, dailyCap),
                fontWeight: 'bold',
                flexShrink: 0,
              }}
            >
              ${dailySpend.toFixed(2)}
            </span>
            {dailyOver && (
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#c04848',
                  flexShrink: 0,
                  animation: 'pulse-dot 1s ease-in-out infinite',
                }}
              />
            )}
            <span style={{ fontSize: 7, color: '#6a5880', flexShrink: 0 }}>/ $100 cap</span>
          </div>
        </div>
      </div>
    </>
  );
}
