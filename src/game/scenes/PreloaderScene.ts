import Phaser from 'phaser';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('PreloaderScene');
  }

  preload() {
    // For now, we'll just display a loading message
    // Later, this is where we'll load images, spritesheets, audio, etc.
    console.log('PreloaderScene: preload');

    // Load the Cinnamoroll sprite sheet
    this.load.spritesheet('cinnamoroll_sheet', 'assets/sprites/flap-test.png', {
      frameWidth: 164,
      frameHeight: 140,
    });

    // Placeholder texture for Cloud Monster (a simple rectangle)
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x808080, 1); // Grey color
    graphics.fillRect(0, 0, 50, 50); // 50x50 rectangle
    graphics.generateTexture('cloud_monster_placeholder', 50, 50);
    graphics.destroy();

    // Example: this.load.image('sky', 'assets/sky.png');
  }

  create() {
    console.log('PreloaderScene: create');
    // Once assets are loaded, move to the MainMenuScene
    this.scene.start('MainMenuScene');
  }
}
