// ═══════════════════════════════════════════════════════════
// FILE: CaptureButtons.tsx
// PURPOSE: Voice and Scan buttons side by side at the top of
//   the capture media section. Voice toggles recording with a
//   pulsing animation. Scan opens the device camera.
// CALLED BY: components/CaptureMediaSection.tsx
// DATA FLOW: User taps Voice → onVoice toggles recording;
//   user taps Scan → onScan opens file picker
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { Mic, Camera } from 'lucide-react';

interface CaptureButtonsProps {
  recording: boolean;
  onVoice: () => void;
  onScan: () => void;
}

/**
 * Triggered by: CaptureMediaSection renders this at the top.
 * Steps: renders two side-by-side buttons — Voice (red circle
 *   with mic icon, pulses during recording) and Scan (green
 *   circle with camera icon). Tapping fires callbacks.
 * Returns: a row of two capture action buttons.
 */
export default function CaptureButtons({ recording, onVoice, onScan }: CaptureButtonsProps): React.JSX.Element {
  return (
    <div className="flex gap-3 mb-3">
      <button type="button" onClick={onVoice} aria-label={recording ? 'Stop recording' : 'Start recording'}
        className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid #E24B4A44', minHeight: '48px' }}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${recording ? 'animate-pulse' : ''}`} style={{ backgroundColor: '#E24B4A' }}>
          <Mic size={18} color="#fff" />
        </div>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{recording ? 'Stop' : 'Voice'}</span>
      </button>
      <button type="button" onClick={onScan} aria-label="Take photo"
        className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid #5DCAA544', minHeight: '48px' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2a4a3a' }}>
          <Camera size={18} color="#5DCAA5" />
        </div>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Scan</span>
      </button>
    </div>
  );
}
