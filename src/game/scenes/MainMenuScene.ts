import Phaser from 'phaser';
import { LevelConfig } from '@/game/levels/levelTypes'; // Import LevelConfig

export class MainMenuScene extends Phaser.Scene {
  private levelConfig?: LevelConfig;
  private levelIndex?: number;

  constructor() {
    super('MainMenuScene');
  }

  init(data: { levelIndex: number; levelConfig: LevelConfig }) {
    this.levelIndex = data.levelIndex;
    this.levelConfig = data.levelConfig;
    console.log('MainMenuScene init with levelConfig:', this.levelConfig);
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
      console.log('Start Game button clicked');
      this.scene.start('PlayScene', {
        levelIndex: this.levelIndex,
        levelConfig: this.levelConfig,
      });
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
