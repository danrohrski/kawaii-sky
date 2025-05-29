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

    // Load croissant image
    this.load.image('croissant_star_img', 'assets/sprites/croissant-star.png');

    // Load actual Power-Up Item images
    this.load.image('shield_item_img', 'assets/sprites/shield.png');
    this.load.image('magnet_item_img', 'assets/sprites/magnet.png');
    this.load.image('speed_shoe_img', 'assets/sprites/speed-shoe.png');

    // No more collectible placeholders needed for now
    // No more power-up placeholders (all have images now)
    // let graphics = this.make.graphics({ x: 0, y: 0 });
    // graphics.destroy(); // If graphics object was created but not used, destroy it.
  }

  create() {
    console.log('PreloaderScene: create');
    // Once assets are loaded, move to the MainMenuScene
    this.scene.start('MainMenuScene');
  }
}
