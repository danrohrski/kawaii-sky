'use client';

import useGameStore from '@/store/gameStore';
import { useEffect, useState } from 'react';

interface ActivePowerUpDisplay {
  name: string;
  remainingMs: number;
  progressPercentage: number;
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

  // Default power-up duration (matches game logic)
  const DEFAULT_DURATION = 10000; // 10 seconds in milliseconds

  useEffect(() => {
    const currentActive: ActivePowerUpDisplay[] = [];

    if (isShieldActive && shieldTimer > 0) {
      const progressPercentage = Math.max(
        0,
        Math.min(100, (shieldTimer / DEFAULT_DURATION) * 100),
      );
      currentActive.push({
        name: 'Shield',
        remainingMs: shieldTimer,
        progressPercentage,
      });
    }

    if (isSpeedActive && speedTimer > 0) {
      const progressPercentage = Math.max(
        0,
        Math.min(100, (speedTimer / DEFAULT_DURATION) * 100),
      );
      currentActive.push({
        name: 'Speed Boost',
        remainingMs: speedTimer,
        progressPercentage,
      });
    }

    if (isMagnetActive && magnetTimer > 0) {
      const progressPercentage = Math.max(
        0,
        Math.min(100, (magnetTimer / DEFAULT_DURATION) * 100),
      );
      currentActive.push({
        name: 'Magnet Charm',
        remainingMs: magnetTimer,
        progressPercentage,
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
    <div
      className="fixed bottom-5 right-5 z-50 p-3 bg-kawaii-mint/90 text-kawaii-brown rounded-xl flex flex-col gap-3"
      style={{ maxWidth: '180px' }}
    >
      <h3 className="text-lg font-bold border-b-2 border-kawaii-purple/50 pb-1 mb-1 text-center">
        Active Power-ups
      </h3>
      {activePowerUps.map((powerUp) => (
        <div key={powerUp.name} className="flex flex-col gap-1">
          <span className="font-semibold text-sm">{powerUp.name}</span>
          <div className="w-full bg-gray-300 rounded-full h-3">
            <div
              className="h-full rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${powerUp.progressPercentage}%`,
                backgroundColor: '#7A94BE', // Blue-grey color matching "tap or space" text
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PowerUpTimersDisplay;
