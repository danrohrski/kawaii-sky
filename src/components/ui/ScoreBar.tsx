'use client';

import useGameStore from '@/store/gameStore';

const ScoreBar = () => {
  const score = useGameStore((state) => state.score);
  const lives = useGameStore((state) => state.lives);

  return (
    <div className="fixed top-5 left-5 z-50 p-4 bg-kawaii-lavender/90 text-kawaii-brown rounded-xl flex flex-col gap-2">
      <h2 className="text-3xl font-bold">Score: {score}</h2>
      <p className="text-xl">Lives: {lives}</p>
    </div>
  );
};

export default ScoreBar;
