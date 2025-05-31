import * as Phaser from 'phaser';
import { AudioManager } from '@/game/AudioManager';

export class GameOverScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private backgroundTileSprite!: Phaser.GameObjects.TileSprite;
  private finalScore = 0;
  private currentLevel = 1;
  private restartInputReceived = false;

  constructor() {
    super('GameOverScene');
  }

  init(data: { score?: number; level?: number }) {
    this.finalScore = data.score || 0;
    this.currentLevel = data.level || 1;
    this.restartInputReceived = false;
  }

  create() {
    // Update AudioManager with current scene to maintain background music
    const audioManager = AudioManager.getInstance();
    audioManager.setCurrentScene(this);

    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Add a darkened background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x6eb2a0, 0.7);
    overlay.fillRect(0, 0, gameWidth, gameHeight);
    overlay.setDepth(-5);

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
        this.backgroundTileSprite.setAlpha(0.5); // Make it more subtle
      }
    } catch (error) {
      console.warn('Failed to load background for game over screen:', error);
    }

    // Game Over Title
    this.titleText = this.add
      .text(gameWidth / 2, gameHeight * 0.25, 'Game Over', {
        fontSize: '72px',
        color: '#ff6b6b',
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

    // Score display
    this.scoreText = this.add
      .text(
        gameWidth / 2,
        gameHeight * 0.4,
        `Final Score: ${this.finalScore}\nReached Level: ${this.currentLevel}`,
        {
          fontSize: '32px',
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

    // Instruction text
    this.instructionText = this.add
      .text(
        gameWidth / 2,
        gameHeight * 0.7,
        'Oh no! Cinnamoroll needs your help!\n\nPress SPACE to try again\nPress ESC to return to welcome screen',
        {
          fontSize: '24px',
          color: '#ffd93d',
          fontFamily: 'Spicy Rice',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 2,
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5)
      .setDepth(10);

    // Add sad Cinnamoroll sprite if available
    try {
      if (this.textures.exists('cinnamoroll_sheet')) {
        const cinnamoroll = this.add.sprite(
          gameWidth / 2,
          gameHeight * 0.55,
          'cinnamoroll_sheet',
          0,
        );
        cinnamoroll.setScale(0.6);
        cinnamoroll.setDepth(5);
        cinnamoroll.setTint(0x888888); // Make it a bit gray/sad

        // Gentle sad bobbing animation
        this.tweens.add({
          targets: cinnamoroll,
          y: cinnamoroll.y - 8,
          duration: 3000,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
      }
    } catch (error) {
      console.warn('Failed to load Cinnamoroll sprite for game over:', error);
    }

    // Add pulsing animation to title
    this.tweens.add({
      targets: this.titleText,
      alpha: 0.8,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Add pulsing animation to instruction text
    this.tweens.add({
      targets: this.instructionText,
      alpha: 0.7,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Input handling
    this.input.keyboard?.on('keydown-SPACE', this.restartGame, this);
    this.input.keyboard?.on('keydown-ESC', this.goToWelcome, this);
    this.input.on('pointerdown', this.restartGame, this);
  }

  restartGame() {
    if (this.restartInputReceived) return;
    this.restartInputReceived = true;

    // Play transition sound
    try {
      if (this.sound && this.sound.get('powerup_sound')) {
        this.sound.play('powerup_sound', { volume: 0.3 });
      }
    } catch (error) {
      console.warn('Failed to play restart sound:', error);
    }

    // Fade out and restart with cream color
    this.cameras.main.fadeOut(500, 245, 245, 220);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('PreloaderScene', {
        levelIndex: 0,
        goToGame: true,
      });
    });
  }

  goToWelcome() {
    if (this.restartInputReceived) return;
    this.restartInputReceived = true;

    // Play transition sound
    try {
      if (this.sound && this.sound.get('powerup_sound')) {
        this.sound.play('powerup_sound', { volume: 0.3 });
      }
    } catch (error) {
      console.warn('Failed to play transition sound:', error);
    }

    // Fade out and go to welcome with cream color
    this.cameras.main.fadeOut(500, 245, 245, 220);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WelcomeScene');
    });
  }

  update() {
    // Keep the background gently animated
    if (this.backgroundTileSprite) {
      this.backgroundTileSprite.tilePositionX -= 0.1;
    }
  }
}
