import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
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
      this.scene.start('PlayScene');
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
