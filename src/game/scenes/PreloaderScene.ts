import * as Phaser from 'phaser';
import { getLevelConfig } from '@/game/levels';
import { AudioManager } from '@/game/AudioManager';

export class PreloaderScene extends Phaser.Scene {
  private levelToLoadIndex = 0; // Default to level 0 (level1.json)
  private fromLevelComplete = false; // Track if this is from level completion
  private goToGame = false; // Track if we should go to game or menu

  constructor() {
    super('PreloaderScene');
  }

  init(data: {
    levelIndex?: number;
    fromLevelComplete?: boolean;
    goToGame?: boolean;
  }) {
    if (typeof data.levelIndex === 'number') {
      this.levelToLoadIndex = data.levelIndex;
    }
    if (data.fromLevelComplete) {
      this.fromLevelComplete = true;
    }
    if (data.goToGame) {
      this.goToGame = true;
    }
    console.log(
      `PreloaderScene: init to load level index ${this.levelToLoadIndex}, goToGame: ${this.goToGame}`,
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

    // Revert to using cloud.png for cloud_obstacle, assuming this was the correct one
    this.load.image('cloud_obstacle', 'assets/sprites/cloud.png');

    // Load boulder obstacle sprite
    this.load.image('boulder_obstacle', 'assets/sprites/boulder.png');

    // Load flying kitten obstacle sprite
    this.load.image('flying_kitten_obstacle', 'assets/sprites/cat.png');

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

    // Load mountains background
    this.load.image('mountains_bg', 'assets/sprites/mountains.png');

    // Load forest background for level 2
    this.load.image('forest_bg', 'assets/sprites/forest.png');

    // Load planet background for level 3
    this.load.image('planet_bg', 'assets/sprites/planet.png');

    // Load winner celebration image
    this.load.image('winner_celebration', 'assets/sprites/winner.png');

    // Load the GLSL shader file
    this.load.glsl('sky_gradient_shader', 'assets/shaders/sky_gradient.frag');

    // Load sound effects
    this.load.audio('collision_sound', 'assets/sounds/collision.wav');
    this.load.audio('powerup_sound', 'assets/sounds/power-up.wav');
    this.load.audio('level_complete_sound', 'assets/sounds/finish-level.flac');
    this.load.audio('game_winner_sound', 'assets/sounds/winner.wav');
    this.load.audio('eat_sound', 'assets/sounds/eat.wav');
    this.load.audio('flap_sound', 'assets/sounds/flap.wav');
    this.load.audio('theme_music', 'assets/sounds/theme.wav');

    // All obstacle sprites are now loaded from actual files
    // No need to generate placeholders anymore

    // Generate star texture for speed particles
    this.generateSpeedParticleTexture();

    // Assuming speed_powerup_placeholder is still generated if speed_shoe_img is not final
    const powerUpSize = 40;
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x00ff00, 1); // Green for speed
    graphics.fillRect(0, 0, powerUpSize, powerUpSize);
    graphics.generateTexture(
      'speed_powerup_placeholder',
      powerUpSize,
      powerUpSize,
    );
    graphics.destroy();
  }

  private generateSpeedParticleTexture() {
    const starSize = 12;
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Create a 5-pointed star shape for sparkles
    graphics.fillStyle(0xffd700, 1); // Gold color
    graphics.beginPath();

    const centerX = starSize / 2;
    const centerY = starSize / 2;
    const outerRadius = starSize / 2;
    const innerRadius = starSize / 4;

    for (let i = 0; i < 5; i++) {
      const angle = (i * 72 - 90) * (Math.PI / 180); // 72 degrees per point
      const innerAngle = (i * 72 - 90 + 36) * (Math.PI / 180); // Inner point between outer points

      // Outer point
      const outerX = centerX + Math.cos(angle) * outerRadius;
      const outerY = centerY + Math.sin(angle) * outerRadius;

      // Inner point
      const innerX = centerX + Math.cos(innerAngle) * innerRadius;
      const innerY = centerY + Math.sin(innerAngle) * innerRadius;

      if (i === 0) {
        graphics.moveTo(outerX, outerY);
      } else {
        graphics.lineTo(outerX, outerY);
      }
      graphics.lineTo(innerX, innerY);
    }

    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('speed_star', starSize, starSize);
    graphics.destroy();
  }

  create() {
    console.log('PreloaderScene: create');

    // Update AudioManager with current scene to maintain background music
    const audioManager = AudioManager.getInstance();
    audioManager.setCurrentScene(this);

    // Get level config from TypeScript modules instead of loading JSON
    const levelConfig = getLevelConfig(this.levelToLoadIndex);

    if (!levelConfig) {
      console.error(
        `CRITICAL ERROR IN PRELOADER: Failed to get level config for index ${this.levelToLoadIndex}!`,
      );
      this.scene.start('WelcomeScene');
      return;
    }

    console.log(
      `PreloaderScene: Level ${this.levelToLoadIndex + 1} config loaded successfully:`,
      levelConfig.levelName,
    );

    if (this.goToGame) {
      this.scene.start('PlayScene', {
        levelIndex: this.levelToLoadIndex,
        levelConfig: levelConfig,
        fromLevelComplete: this.fromLevelComplete,
      });
    } else if (this.fromLevelComplete) {
      // If coming from level completion, go to main menu
      this.scene.start('MainMenuScene', {
        levelIndex: this.levelToLoadIndex,
        levelConfig: levelConfig,
        fromLevelComplete: this.fromLevelComplete,
      });
    } else {
      // Default: go to welcome screen after loading initial assets
      this.scene.start('WelcomeScene');
    }
  }
}
