import { create } from 'zustand';

interface GameState {
  score: number;
  lives: number;
  // Add other game state properties here later, e.g.:
  // powerUpActive: boolean;
  // powerUpTimer: number;
  // isPaused: boolean;
  // currentLevel: number;

  // Actions
  incrementScore: (amount: number) => void;
  decrementLives: () => void;
  resetGame: () => void;
  // Add other actions here
}

const useGameStore = create<GameState>((set) => ({
  // Initial state
  score: 0,
  lives: 3, // Default to 3 lives

  // Actions implementation
  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  decrementLives: () =>
    set((state) => ({ lives: Math.max(0, state.lives - 1) })), // Prevent negative lives
  resetGame: () => set({ score: 0, lives: 3 }),
}));

export default useGameStore;
