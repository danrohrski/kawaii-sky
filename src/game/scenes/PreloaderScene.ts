import Phaser from 'phaser';
import { LevelConfig } from '@/game/levels/levelTypes'; // Import LevelConfig

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

    // Load level configuration JSON
    // For now, always load level 1. Later, this could be dynamic based on gameStore.currentLevelIndex
    this.load.json('level1_config', 'assets/levels/level1.json');

    // Assuming speed_powerup_placeholder is still generated if speed_shoe_img is not final
    const powerUpSize = 40;
    let graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x00ff00, 1); // Green for speed
    graphics.fillRect(0, 0, powerUpSize, powerUpSize);
    graphics.generateTexture(
      'speed_powerup_placeholder',
      powerUpSize,
      powerUpSize,
    );
    graphics.destroy();
  }

  create() {
    console.log('PreloaderScene: create');
    const levelConfig = this.cache.json.get('level1_config') as LevelConfig;

    if (!levelConfig) {
      console.error(
        'CRITICAL ERROR IN PRELOADER: Failed to get level1_config from cache!',
      );
      // Handle this critical error, maybe go to an error scene or try a default config object
      // For now, let's try to proceed but expect issues, or simply don't start MainMenu if it's fatal
      this.scene.start('MainMenuScene', {
        levelIndex: 0,
        levelConfig: undefined,
      }); // Pass undefined to see it fail down the line
      return;
    }
    console.log(
      'PreloaderScene: level1_config loaded successfully:',
      levelConfig,
    );

    this.scene.start('MainMenuScene', {
      levelIndex: 0,
      levelConfig: levelConfig,
    });
  }
}
