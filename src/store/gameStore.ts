import { create } from 'zustand';
import { LevelConfig, PowerUpType } from '@/game/levels/levelTypes'; // Ensure this is the only source for PowerUpType

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
  resetGame: (levelIndex?: number) => void; // Allow resetting to a specific level or default
  // Add other actions here

  // Power-up actions
  activatePowerUp: (type: PowerUpType, duration: number) => void;
  deactivatePowerUp: (type: PowerUpType) => void;
  updatePowerUpTimers: (deltaTime: number) => void;
  setCurrentLevel: (levelIndex: number, config: LevelConfig) => void;
  incrementGameTime: (deltaTime: number) => void;
}

const initialGameState = {
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
  ...initialGameState,

  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  decrementLives: () =>
    set((state) => ({ lives: Math.max(0, state.lives - 1) })),
  resetGame: (levelIndex = 0) =>
    set((state) => ({
      ...initialGameState,
      currentLevelIndex: levelIndex,
      // currentLevelConfig will be set by setCurrentLevel when a level actually starts
      // If we want to persist currentLevelConfig across scene restarts (but not game overs),
      // this reset logic would need to be more nuanced or currentLevelConfig handled outside resetGame.
      // For now, resetGame clears it, implying it needs to be reloaded.
      currentLevelConfig:
        levelIndex === state.currentLevelIndex
          ? state.currentLevelConfig
          : null,
      gameTime: 0,
    })),

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

  setCurrentLevel: (levelIndex, config) =>
    set({
      currentLevelIndex: levelIndex,
      currentLevelConfig: config,
      gameTime: 0,
    }),

  incrementGameTime: (deltaTime) =>
    set((state) => ({ gameTime: state.gameTime + deltaTime })),
}));

export default useGameStore;
