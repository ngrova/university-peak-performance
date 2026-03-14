'use client';

import { ContextGauge } from './components/ContextGauge';
import { RewindButton } from './components/RewindButton';

export default function MissionControlPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-12 px-4">
      <div className="w-full max-w-[480px] flex flex-col gap-10">
        <header>
          <h1 className="text-xs font-sans uppercase tracking-widest text-[#E5E5E5]/40">
            Mission Control
          </h1>
        </header>
        <ContextGauge />
        <RewindButton />
      </div>
    </main>
  );
}
