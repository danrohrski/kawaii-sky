import * as Phaser from 'phaser';
import { LevelConfig } from '@/game/levels/levelTypes';
import useGameStore from '@/store/gameStore';
import { AudioManager } from '@/game/AudioManager';

export class MainMenuScene extends Phaser.Scene {
  private levelConfig?: LevelConfig;
  private levelIndexToPlay!: number;
  private isLevelTransition = false;

  constructor() {
    super('MainMenuScene');
  }

  init(data?: {
    levelIndex?: number;
    levelConfig?: LevelConfig;
    fromLevelComplete?: boolean;
    gameWon?: boolean;
  }) {
    if (data && typeof data.levelIndex === 'number' && data.levelConfig) {
      this.levelIndexToPlay = data.levelIndex;
      this.levelConfig = data.levelConfig;
      this.isLevelTransition = data.fromLevelComplete || false;

      if (data.gameWon) {
        this.isLevelTransition = true;
        this.levelIndexToPlay = 0;
        this.levelConfig = undefined;
      }

      console.log(
        `MainMenuScene: init with preloaded Level ${this.levelIndexToPlay} Config:`,
        this.levelConfig?.levelName || 'Game Complete',
      );
    } else {
      this.levelIndexToPlay = useGameStore.getState().currentLevelIndex;
      this.levelConfig = undefined;
      this.isLevelTransition = false;
      console.log(
        `MainMenuScene: init, will play/load level index ${this.levelIndexToPlay} from store.`,
      );
    }
  }

  create() {
    console.log('MainMenuScene: create');

    // Update AudioManager with current scene to maintain background music
    const audioManager = AudioManager.getInstance();
    audioManager.setCurrentScene(this);

    this.cameras.main.setBackgroundColor('#FFF8DC');

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const gameState = useGameStore.getState();

    // Level completion message
    if (
      this.isLevelTransition &&
      this.levelIndexToPlay > 0 &&
      !gameState.gameWon
    ) {
      this.add
        .text(
          centerX,
          centerY - 100,
          `🎉 Level ${this.levelIndexToPlay} Complete! 🎉`,
          {
            fontFamily: 'Spicy Rice',
            fontSize: '24px',
            color: '#FFB6C1',
            align: 'center',
          },
        )
        .setOrigin(0.5);
    }

    // Game won message
    if (gameState.gameWon) {
      this.add
        .text(centerX, centerY - 100, `🏆 GAME COMPLETE! 🏆`, {
          fontFamily: 'Spicy Rice',
          fontSize: '28px',
          color: '#FFEAA7',
          align: 'center',
        })
        .setOrigin(0.5);
    }

    // Current level info
    const levelNumber = this.levelIndexToPlay + 1;
    let levelDisplayText = '';

    if (this.levelConfig && this.levelConfig.levelName) {
      // If we have level config, show the actual level name
      levelDisplayText = `Level ${levelNumber}: ${this.levelConfig.levelName}`;
    } else {
      // Fallback when level config isn't loaded yet (coming from welcome screen)
      levelDisplayText = `Level ${levelNumber}`;
    }

    this.add
      .text(centerX, centerY - 20, levelDisplayText, {
        fontFamily: 'Spicy Rice',
        fontSize: '28px',
        color: '#6EB2A0',
        align: 'center',
      })
      .setOrigin(0.5);

    // Start instruction
    this.add
      .text(centerX, centerY + 20, 'Tap or space to start', {
        fontFamily: 'Spicy Rice',
        fontSize: '20px',
        color: '#7A94BE',
        align: 'center',
      })
      .setOrigin(0.5);

    // Input handling
    this.input.on('pointerdown', this.startGame, this);
    this.input.keyboard?.on('keydown-SPACE', this.startGame, this);

    // Also listen for any key press as a fallback
    this.input.keyboard?.on('keydown', this.startGame, this);

    console.log('MainMenuScene: Input handlers set up');
  }

  startGame() {
    console.log('MainMenuScene: startGame called!');
    console.log('Starting game for level index:', this.levelIndexToPlay);
    console.log('Level config available:', !!this.levelConfig);

    // Always go to PreloaderScene to ensure level is properly loaded
    // PreloaderScene will then go to PlayScene when ready
    this.scene.start('PreloaderScene', {
      levelIndex: this.levelIndexToPlay,
      goToGame: true, // Signal that we want to start the game, not return to menu
    });
  }
}
