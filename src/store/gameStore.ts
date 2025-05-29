import { create } from 'zustand';

export enum PowerUpType {
  SHIELD = 'shield',
  SPEED = 'speed',
  MAGNET = 'magnet',
}

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

  // Actions
  incrementScore: (amount: number) => void;
  decrementLives: () => void;
  resetGame: () => void;
  // Add other actions here

  // Power-up actions
  activatePowerUp: (type: PowerUpType, duration: number) => void;
  deactivatePowerUp: (type: PowerUpType) => void;
  updatePowerUpTimers: (deltaTime: number) => void; // deltaTime in milliseconds
}

const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  score: 0,
  lives: 3, // Default to 3 lives

  isShieldActive: false,
  shieldTimer: 0,
  isSpeedActive: false,
  speedTimer: 0,
  isMagnetActive: false,
  magnetTimer: 0,

  // Actions implementation
  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  decrementLives: () =>
    set((state) => ({ lives: Math.max(0, state.lives - 1) })), // Prevent negative lives
  resetGame: () =>
    set({
      score: 0,
      lives: 3,
      isShieldActive: false,
      shieldTimer: 0,
      isSpeedActive: false,
      speedTimer: 0,
      isMagnetActive: false,
      magnetTimer: 0,
    }),

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
