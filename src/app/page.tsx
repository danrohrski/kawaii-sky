'use client';

import dynamic from 'next/dynamic';
import ScoreBar from '@/components/ui/ScoreBar';
import PowerUpTimersDisplay from '@/components/ui/PowerUpTimersDisplay';

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => <p className="text-kawaii-gray">Loading Game...</p>,
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-kawaii-sky text-kawaii-brown relative">
      <ScoreBar />
      <PowerUpTimersDisplay />
      <div className="rounded-lg shadow-2xl overflow-hidden">
        <GameCanvas />
      </div>
    </main>
  );
}
