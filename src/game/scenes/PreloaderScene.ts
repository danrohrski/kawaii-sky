import Phaser from 'phaser';
import { LevelConfig } from '@/game/levels/levelTypes'; // Import LevelConfig

export class PreloaderScene extends Phaser.Scene {
  private levelToLoadIndex = 0; // Default to level 0 (level1.json)

  constructor() {
    super('PreloaderScene');
  }

  init(data: { levelIndex?: number }) {
    if (typeof data.levelIndex === 'number') {
      this.levelToLoadIndex = data.levelIndex;
    }
    console.log(
      `PreloaderScene: init to load level index ${this.levelToLoadIndex}`,
    );
  }

  preload() {
    console.log(
      'PreloaderScene: preload for level index',
      this.levelToLoadIndex,
    );
    // For now, we'll just display a loading message
    // Later, this is where we'll load images, spritesheets, audio, etc.

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

    // Dynamically load level configuration JSON
    const levelJsonFileName = `level${this.levelToLoadIndex + 1}.json`; // e.g., level1.json, level2.json
    const levelConfigKey = `level${this.levelToLoadIndex}_config`; // e.g., level0_config, level1_config
    this.load.json(levelConfigKey, `assets/levels/${levelJsonFileName}`);
    console.log(
      `PreloaderScene: attempting to load ${levelJsonFileName} with key ${levelConfigKey}`,
    );

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
    const levelConfigKey = `level${this.levelToLoadIndex}_config`;
    const levelConfig = this.cache.json.get(levelConfigKey) as LevelConfig;

    if (!levelConfig) {
      console.error(
        `CRITICAL ERROR IN PRELOADER: Failed to get ${levelConfigKey} from cache!`,
      );
      this.scene.start('MainMenuScene', {
        levelIndex: 0,
        levelConfig: undefined,
      });
      return;
    }
    console.log(
      `PreloaderScene: ${levelConfigKey} loaded successfully:`,
      levelConfig.levelName,
    );

    this.scene.start('MainMenuScene', {
      levelIndex: this.levelToLoadIndex,
      levelConfig: levelConfig,
    });
  }
}
