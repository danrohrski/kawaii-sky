import Phaser from 'phaser';
import { LevelConfig } from '@/game/levels/levelTypes'; // Import LevelConfig
import useGameStore from '@/store/gameStore'; // Import store

export class MainMenuScene extends Phaser.Scene {
  private levelConfig?: LevelConfig;
  private levelIndexToPlay!: number;

  constructor() {
    super('MainMenuScene');
  }

  init(data?: { levelIndex?: number; levelConfig?: LevelConfig }) {
    if (data && typeof data.levelIndex === 'number' && data.levelConfig) {
      this.levelIndexToPlay = data.levelIndex;
      this.levelConfig = data.levelConfig;
      console.log(
        `MainMenuScene: init with preloaded Level ${this.levelIndexToPlay} Config:`,
        this.levelConfig.levelName,
      );
    } else {
      // No specific level preloaded (e.g., game just started, or came from a simple quit)
      // Get the current level index from the store to decide what to play next.
      this.levelIndexToPlay = useGameStore.getState().currentLevelIndex;
      this.levelConfig = undefined; // Needs to be loaded by Preloader
      console.log(
        `MainMenuScene: init, will play/load level index ${this.levelIndexToPlay} from store.`,
      );
    }
  }

  create() {
    console.log('MainMenuScene: create');
    this.cameras.main.setBackgroundColor('#FDFD96'); // Using our pastel-yellow

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const startButton = this.add
      .text(centerX, centerY, 'Start Game', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#D2B48C', // cinnamon-brown
        align: 'center',
      })
      .setOrigin(0.5)
      .setInteractive();

    startButton.on('pointerdown', () => {
      console.log(
        'Start Game button clicked for level index:',
        this.levelIndexToPlay,
      );
      if (this.levelConfig) {
        // Config already loaded and passed to init (likely from Preloader or PlayScene game over)
        this.scene.start('PlayScene', {
          levelIndex: this.levelIndexToPlay,
          levelConfig: this.levelConfig,
        });
      } else {
        // Config not available, means we need Preloader to load it for levelIndexToPlay
        console.log(
          `MainMenuScene: No preloaded config, starting Preloader for level index ${this.levelIndexToPlay}`,
        );
        this.scene.start('PreloaderScene', {
          levelIndex: this.levelIndexToPlay,
        });
      }
    });

    // Placeholder for settings, etc.
    this.add
      .text(centerX, centerY + 100, 'Settings (TODO)', {
        fontSize: '20px',
        color: '#D2B48C',
      })
      .setOrigin(0.5);
  }
}
