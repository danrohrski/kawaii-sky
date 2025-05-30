import { create } from 'zustand';
import { LevelConfig, PowerUpType } from '@/game/levels/levelTypes'; // Ensure this is the only source for PowerUpType

// Assume a total number of levels. This could come from a config file later.
const MAX_LEVEL_INDEX = 1; // For level1 (index 0) and level2 (index 1)

interface GameState {
  score: number;
  lives: number;
  // Add other game state properties here later, e.g.:
  // powerUpActive: boolean;
  // powerUpTimer: number;
  // isPaused: boolean;
  // currentLevel: number;

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
  advanceToNextLevel: () => void; // Advances level, keeps score/lives
  setCurrentLevelConfig: (levelIndex: number, config: LevelConfig) => void; // Sets current loaded level

  // Power-up actions
  activatePowerUp: (type: PowerUpType, duration: number) => void;
  deactivatePowerUp: (type: PowerUpType) => void;
  updatePowerUpTimers: (deltaTime: number) => void;
}

const initialGameSessionState = {
  score: 0,
  lives: 3,
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
    const nextIdx = (currentIdx + 1) % (MAX_LEVEL_INDEX + 1); // Loop back for now
    console.log(`Store: advanceToNextLevel from ${currentIdx} to ${nextIdx}`);
    set((state) => ({
      // Keep score and lives from current state
      score: state.score,
      lives: state.lives,
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
