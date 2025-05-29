'use client';

import useGameStore from '@/store/gameStore';
import { useEffect, useState } from 'react';
// import { shallow } from 'zustand/shallow'; // Not using shallow for now

interface ActivePowerUpDisplay {
  name: string;
  remainingSeconds: number;
}

const PowerUpTimersDisplay = () => {
  // Select individual state pieces. This is inherently stable.
  const isShieldActive = useGameStore((state) => state.isShieldActive);
  const shieldTimer = useGameStore((state) => state.shieldTimer);
  const isSpeedActive = useGameStore((state) => state.isSpeedActive);
  const speedTimer = useGameStore((state) => state.speedTimer);
  const isMagnetActive = useGameStore((state) => state.isMagnetActive);
  const magnetTimer = useGameStore((state) => state.magnetTimer);

  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUpDisplay[]>(
    [],
  );

  useEffect(() => {
    const currentActive: ActivePowerUpDisplay[] = [];
    if (isShieldActive && shieldTimer > 0) {
      currentActive.push({
        name: 'Shield',
        remainingSeconds: Math.ceil(shieldTimer / 1000),
      });
    }
    if (isSpeedActive && speedTimer > 0) {
      currentActive.push({
        name: 'Speed Boost',
        remainingSeconds: Math.ceil(speedTimer / 1000),
      });
    }
    if (isMagnetActive && magnetTimer > 0) {
      currentActive.push({
        name: 'Magnet Charm',
        remainingSeconds: Math.ceil(magnetTimer / 1000),
      });
    }

    // Only update state if the actual list of active power-ups changes
    if (JSON.stringify(activePowerUps) !== JSON.stringify(currentActive)) {
      setActivePowerUps(currentActive);
    }
  }, [
    isShieldActive,
    shieldTimer,
    isSpeedActive,
    speedTimer,
    isMagnetActive,
    magnetTimer,
    activePowerUps,
  ]);

  if (activePowerUps.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 p-4 bg-pastel-purple/90 text-white rounded-xl shadow-lg flex flex-col gap-2 w-64">
      <h3 className="text-xl font-bold border-b-2 border-white/50 pb-1 mb-1">
        Active Power-ups:
      </h3>
      {activePowerUps.map((powerUp) => (
        <div key={powerUp.name} className="flex justify-between items-center">
          <span className="font-semibold">{powerUp.name}:</span>
          <span className="text-lg font-mono bg-white/20 px-2 py-0.5 rounded">
            {powerUp.remainingSeconds}s
          </span>
        </div>
      ))}
    </div>
  );
};

export default PowerUpTimersDisplay;
