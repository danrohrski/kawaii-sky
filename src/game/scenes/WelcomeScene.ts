import * as Phaser from 'phaser';
import { AudioManager } from '@/game/AudioManager';

export class WelcomeScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private backgroundTileSprite!: Phaser.GameObjects.TileSprite;
  private skyShader!: Phaser.GameObjects.Shader;
  private startInputReceived = false;

  constructor() {
    super('WelcomeScene');
  }

  create() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Add sky gradient background with fallback
    try {
      this.skyShader = this.add.shader(
        'sky_gradient_shader',
        gameWidth / 2,
        gameHeight / 2,
        gameWidth,
        gameHeight,
        [],
      );
      this.skyShader.setDepth(-20);
    } catch (error) {
      console.warn(
        'Failed to load sky shader, using solid color fallback:',
        error,
      );
      // Fallback to solid color background
      this.cameras.main.setBackgroundColor('#87CEEB'); // Sky blue
    }

    // Add animated background with fallback
    try {
      const backgroundTexture = this.textures.get('mountains_bg');
      if (
        backgroundTexture &&
        backgroundTexture.source &&
        backgroundTexture.source[0]
      ) {
        const backgroundImgHeight = backgroundTexture.getSourceImage().height;
        const BACKGROUND_SCALE = 0.5;

        this.backgroundTileSprite = this.add.tileSprite(
          0,
          0,
          gameWidth / BACKGROUND_SCALE,
          backgroundImgHeight,
          'mountains_bg',
        );
        this.backgroundTileSprite.setOrigin(0, 0);
        this.backgroundTileSprite.setScale(BACKGROUND_SCALE);
        this.backgroundTileSprite.y =
          gameHeight - this.backgroundTileSprite.displayHeight;
        this.backgroundTileSprite.setScrollFactor(0);
        this.backgroundTileSprite.setDepth(-10);
      } else {
        throw new Error('Mountains background texture not found');
      }
    } catch (error) {
      console.warn(
        'Failed to load mountains background, using color fallback:',
        error,
      );
      // Create a simple gradient background as fallback
      const graphics = this.add.graphics();
      graphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xfff8dc, 0xfff8dc, 1);
      graphics.fillRect(0, 0, gameWidth, gameHeight);
      graphics.setDepth(-10);
    }

    // Game Title
    this.titleText = this.add
      .text(gameWidth / 2, gameHeight * 0.25, 'Kawaii Sky', {
        fontSize: '64px',
        color: '#ff69b4',
        fontFamily: 'Spicy Rice',
        stroke: '#ffffff',
        strokeThickness: 4,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: '#000000',
          blur: 2,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Subtitle
    this.subtitleText = this.add
      .text(gameWidth / 2, gameHeight * 0.35, 'A Cinnamoroll Adventure', {
        fontSize: '28px',
        color: '#7A94BE',
        fontFamily: 'Spicy Rice',
        stroke: '#ffffff',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Instructions
    this.instructionText = this.add
      .text(
        gameWidth / 2,
        gameHeight * 0.65 + 80,
        'Tap or Press SPACE to flap your wings\nCollect treats and avoid obstacles\nUse power-ups to help your journey!\n\nPress any key or tap to start',
        {
          fontSize: '20px',
          color: '#ffffff',
          fontFamily: 'Spicy Rice',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 2,
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5)
      .setDepth(10);

    // Add floating animation to title
    this.tweens.add({
      targets: this.titleText,
      y: this.titleText.y - 10,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Add pulsing animation to instruction text
    this.tweens.add({
      targets: this.instructionText,
      alpha: 0.7,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Add subtle background scrolling animation
    this.tweens.add({
      targets: this.backgroundTileSprite,
      tilePositionX: -200,
      duration: 20000,
      ease: 'Linear',
      repeat: -1,
    });

    // Add some decorative elements (optional cinnamoroll sprite if available)
    try {
      if (this.textures.exists('cinnamoroll_sheet')) {
        const cinnamoroll = this.add.sprite(
          gameWidth / 2,
          gameHeight * 0.5,
          'cinnamoroll_sheet',
          0,
        );
        cinnamoroll.setScale(0.8);
        cinnamoroll.setDepth(5);

        // Gentle bobbing animation for Cinnamoroll
        this.tweens.add({
          targets: cinnamoroll,
          y: cinnamoroll.y - 15,
          duration: 2500,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
      } else {
        console.warn(
          'cinnamoroll_sheet texture not found, skipping character sprite',
        );
      }
    } catch (error) {
      console.warn('Failed to load Cinnamoroll sprite:', error);
    }

    // Start background music
    const audioManager = AudioManager.getInstance();
    audioManager.setCurrentScene(this);
    audioManager.startBackgroundMusic();

    // Input handling
    this.input.keyboard?.on('keydown', this.startGame, this);
    this.input.on('pointerdown', this.startGame, this);
  }

  startGame() {
    if (this.startInputReceived) return;
    this.startInputReceived = true;

    // Play a nice transition sound (with error handling)
    try {
      if (this.sound && this.sound.get('powerup_sound')) {
        this.sound.play('powerup_sound', { volume: 0.4 });
      } else {
        console.warn('powerup_sound not available, skipping audio');
      }
    } catch (error) {
      console.warn('Failed to play transition sound:', error);
    }

    // Add a nice transition effect with cream color
    this.cameras.main.fadeOut(500, 245, 245, 220);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene', {
        levelIndex: 0,
        fromWelcome: true,
      });
    });
  }

  update() {
    // Keep the background gently animated
    if (this.backgroundTileSprite) {
      this.backgroundTileSprite.tilePositionX -= 0.2;
    }
  }
}
