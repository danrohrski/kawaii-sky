import { create } from 'zustand';
import { LevelConfig, PowerUpType } from '@/game/levels/levelTypes'; // Ensure this is the only source for PowerUpType
import { TOTAL_LEVELS } from '@/game/levels';

// 3 levels total: Level 1 (index 0), Level 2 (index 1), Level 3 (index 2)
const MAX_LEVEL_INDEX = TOTAL_LEVELS - 1; // 2 for 3 levels (0, 1, 2)

interface GameState {
  score: number;
  lives: number;
  gameWon: boolean; // New: tracks if player has won the game

  // Power-up states
  isShieldActive: boolean;
  shieldTimer: number; // Remaining duration in milliseconds
  isSpeedActive: boolean;
  speedTimer: number;
  isMagnetActive: boolean;
  magnetTimer: number;

  currentLevelIndex: number; // 0-indexed
  currentLevelConfig: LevelConfig | null;
  gameTime: number; // To track level duration

  // Actions
  incrementScore: (amount: number) => void;
  decrementLives: () => void;
  resetGameSession: () => void; // Full reset for game over or quit
  advanceToNextLevel: () => void; // Advances level, keeps score/lives, or triggers win
  setCurrentLevelConfig: (levelIndex: number, config: LevelConfig) => void; // Sets current loaded level

  // Power-up actions
  activatePowerUp: (type: PowerUpType, duration: number) => void;
  deactivatePowerUp: (type: PowerUpType) => void;
  updatePowerUpTimers: (deltaTime: number) => void;
}

const initialGameSessionState = {
  score: 0,
  lives: 3,
  gameWon: false,
  isShieldActive: false,
  shieldTimer: 0,
  isSpeedActive: false,
  speedTimer: 0,
  isMagnetActive: false,
  magnetTimer: 0,
  currentLevelIndex: 0,
  currentLevelConfig: null,
  gameTime: 0,
};

const useGameStore = create<GameState>((set, get) => ({
  ...initialGameSessionState,

  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  decrementLives: () =>
    set((state) => ({ lives: Math.max(0, state.lives - 1) })),

  resetGameSession: () => {
    console.log('Store: resetGameSession called');
    set(initialGameSessionState);
  },

  advanceToNextLevel: () => {
    const currentIdx = get().currentLevelIndex;

    // Check if this was the final level (level 3, index 2)
    if (currentIdx >= MAX_LEVEL_INDEX) {
      console.log('🎉 Store: Game Won! Player completed all 3 levels!');
      set((state) => ({
        ...state,
        gameWon: true,
        // Keep score and lives as final results
      }));
      return;
    }

    const nextIdx = currentIdx + 1;
    console.log(
      `Store: advanceToNextLevel from ${currentIdx + 1} to ${nextIdx + 1}`,
    );
    set((state) => ({
      // Keep score and lives from current state
      score: state.score,
      lives: state.lives,
      gameWon: false, // Ensure this stays false until final level
      // Reset power-ups and timers
      isShieldActive: false,
      shieldTimer: 0,
      isSpeedActive: false,
      speedTimer: 0,
      isMagnetActive: false,
      magnetTimer: 0,
      // Update level index and clear config (to be loaded by Preloader)
      currentLevelIndex: nextIdx,
      currentLevelConfig: null,
    }));
  },

  setCurrentLevelConfig: (levelIndex, config) => {
    console.log(
      `Store: setCurrentLevelConfig for index ${levelIndex}:`,
      config?.levelName,
    );
    set({
      currentLevelIndex: levelIndex,
      currentLevelConfig: config,
    });
  },

  activatePowerUp: (type, duration) => {
    switch (type) {
      case PowerUpType.SHIELD:
        set({ isShieldActive: true, shieldTimer: duration });
        break;
      case PowerUpType.SPEED:
        set({ isSpeedActive: true, speedTimer: duration });
        break;
      case PowerUpType.MAGNET:
        set({ isMagnetActive: true, magnetTimer: duration });
        break;
    }
  },

  deactivatePowerUp: (type) => {
    switch (type) {
      case PowerUpType.SHIELD:
        set({ isShieldActive: false, shieldTimer: 0 });
        break;
      case PowerUpType.SPEED:
        set({ isSpeedActive: false, speedTimer: 0 });
        break;
      case PowerUpType.MAGNET:
        set({ isMagnetActive: false, magnetTimer: 0 });
        break;
    }
  },

  updatePowerUpTimers: (deltaTime) => {
    const {
      isShieldActive,
      shieldTimer,
      isSpeedActive,
      speedTimer,
      isMagnetActive,
      magnetTimer,
      deactivatePowerUp,
    } = get();
    if (isShieldActive) {
      const newShieldTimer = Math.max(0, shieldTimer - deltaTime);
      set({ shieldTimer: newShieldTimer });
      if (newShieldTimer === 0) deactivatePowerUp(PowerUpType.SHIELD);
    }
    if (isSpeedActive) {
      const newSpeedTimer = Math.max(0, speedTimer - deltaTime);
      set({ speedTimer: newSpeedTimer });
      if (newSpeedTimer === 0) deactivatePowerUp(PowerUpType.SPEED);
    }
    if (isMagnetActive) {
      const newMagnetTimer = Math.max(0, magnetTimer - deltaTime);
      set({ magnetTimer: newMagnetTimer });
      if (newMagnetTimer === 0) deactivatePowerUp(PowerUpType.MAGNET);
    }
  },
}));

export default useGameStore;
