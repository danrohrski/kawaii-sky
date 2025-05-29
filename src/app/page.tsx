'use client';

import dynamic from 'next/dynamic';
import useGameStore from '@/store/gameStore';
import ScoreBar from '@/components/ui/ScoreBar';
import PauseButton from '@/components/ui/PauseButton';

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => <p>Loading Game...</p>,
});

export default function Home() {
  // const score = useGameStore((state) => state.score);
  // const lives = useGameStore((state) => state.lives);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-pastel-blue text-cinnamon-brown relative">
      {/* <h1>Hello World - Test</h1> */}
      <ScoreBar />
      <PauseButton />
      <h1 className="text-5xl font-bold mb-8 text-pastel-pink drop-shadow-lg">
        Cinnamoroll&apos;s Cinnamon Sky
      </h1>
      <div className="border-4 border-pastel-pink rounded-lg shadow-2xl overflow-hidden">
        <GameCanvas />
      </div>
      <button
        onClick={() => useGameStore.getState().resetGame()}
        className="mt-8 px-6 py-3 bg-pastel-green text-cinnamon-brown font-semibold rounded-lg shadow-md hover:bg-pastel-yellow transition-colors duration-150"
      >
        Reset Game (UI Button)
      </button>
    </main>
  );
}
