import Phaser from 'phaser';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('PreloaderScene');
  }

  preload() {
    // For now, we'll just display a loading message
    // Later, this is where we'll load images, spritesheets, audio, etc.
    console.log('PreloaderScene: preload');

    // Example: this.load.image('sky', 'assets/sky.png');
    // Example: this.load.spritesheet('cinnamoroll', 'assets/cinnamoroll.png', { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    console.log('PreloaderScene: create');
    // Once assets are loaded, move to the MainMenuScene
    this.scene.start('MainMenuScene');
  }
}
