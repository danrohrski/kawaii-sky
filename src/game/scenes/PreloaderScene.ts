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

    // Load the cloud obstacle image
    this.load.image('cloud_obstacle', 'assets/sprites/cloud.png');

    // Load the new image
    this.load.image('cinnamon_roll_img', 'assets/sprites/cinnamon-roll.png');

    // Placeholder textures for Collectibles
    const collectibleSize = 32;
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Coffee Cup (e.g., dark grey circle)
    graphics.fillStyle(0x5a5a5a, 1);
    graphics.fillCircle(
      collectibleSize / 2,
      collectibleSize / 2,
      collectibleSize / 2,
    );
    graphics.generateTexture(
      'coffee_cup_placeholder',
      collectibleSize,
      collectibleSize,
    );
    graphics.clear();

    // Star (e.g., yellow circle for now, can be a star shape later)
    graphics.fillStyle(0xffd700, 1); // Gold/Yellow
    graphics.fillCircle(
      collectibleSize / 2,
      collectibleSize / 2,
      collectibleSize / 2,
    );
    graphics.generateTexture(
      'star_placeholder',
      collectibleSize,
      collectibleSize,
    );

    graphics.destroy();
  }

  create() {
    console.log('PreloaderScene: create');
    // Once assets are loaded, move to the MainMenuScene
    this.scene.start('MainMenuScene');
  }
}
