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

    // Load coffee boba image
    this.load.image('coffee_boba_img', 'assets/sprites/coffee-boba.png');

    // Collectible Placeholders (Coffee, Star)
    const collectibleSize = 32;
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffd700, 1); // Gold/Yellow for Star
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
    graphics.clear();

    // Power-up Item Placeholders
    const powerUpSize = 40;
    // Shield (e.g., blue square)
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, powerUpSize, powerUpSize);
    graphics.generateTexture(
      'shield_powerup_placeholder',
      powerUpSize,
      powerUpSize,
    );
    graphics.clear();
    // Speed (e.g., green square)
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, powerUpSize, powerUpSize);
    graphics.generateTexture(
      'speed_powerup_placeholder',
      powerUpSize,
      powerUpSize,
    );
    graphics.clear();
    // Magnet (e.g., red square)
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, powerUpSize, powerUpSize);
    graphics.generateTexture(
      'magnet_powerup_placeholder',
      powerUpSize,
      powerUpSize,
    );

    graphics.destroy();
  }

  create() {
    console.log('PreloaderScene: create');
    // Once assets are loaded, move to the MainMenuScene
    this.scene.start('MainMenuScene');
  }
}
