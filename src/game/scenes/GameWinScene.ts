import * as Phaser from 'phaser';
import { AudioManager } from '@/game/AudioManager';

export class GameWinScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private backgroundTileSprite!: Phaser.GameObjects.TileSprite;
  private skyShader!: Phaser.GameObjects.Shader;
  private finalScore = 0;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private restartInputReceived = false;

  constructor() {
    super('GameWinScene');
  }

  init(data: { score?: number }) {
    this.finalScore = data.score || 0;
    this.restartInputReceived = false;
  }

  create() {
    // Update AudioManager with current scene to maintain background music
    const audioManager = AudioManager.getInstance();
    audioManager.setCurrentScene(this);

    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Add celebratory sky gradient background
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
      console.warn('Failed to load sky shader for win screen:', error);
      // Bright celebratory background
      this.cameras.main.setBackgroundColor('#FFD700'); // Gold
    }

    // Add animated background
    try {
      const backgroundTexture = this.textures.get('planet_bg');
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
          'planet_bg',
        );
        this.backgroundTileSprite.setOrigin(0, 0);
        this.backgroundTileSprite.setScale(BACKGROUND_SCALE);
        this.backgroundTileSprite.y =
          gameHeight - this.backgroundTileSprite.displayHeight;
        this.backgroundTileSprite.setScrollFactor(0);
        this.backgroundTileSprite.setDepth(-10);
      }
    } catch (error) {
      console.warn('Failed to load planet background for win screen:', error);
    }

    // Victory Title
    this.titleText = this.add
      .text(gameWidth / 2, gameHeight * 0.15, 'VICTORY!', {
        fontSize: '84px',
        color: '#FFD700',
        fontFamily: 'Spicy Rice',
        stroke: '#ffffff',
        strokeThickness: 6,
        shadow: {
          offsetX: 4,
          offsetY: 4,
          color: '#000000',
          blur: 3,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Subtitle
    this.subtitleText = this.add
      .text(gameWidth / 2, gameHeight * 0.25, 'Cinnamoroll saved the day!', {
        fontSize: '36px',
        color: '#FF69B4',
        fontFamily: 'Spicy Rice',
        stroke: '#ffffff',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Score display
    this.scoreText = this.add
      .text(
        gameWidth / 2,
        gameHeight * 0.4,
        `🌟 Final Score: ${this.finalScore} 🌟\n\nYou completed all 3 levels!\n🎉 CONGRATULATIONS! 🎉`,
        {
          fontSize: '28px',
          color: '#ffffff',
          fontFamily: 'Spicy Rice',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 2,
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5)
      .setDepth(10);

    // Add winner celebration image
    try {
      if (this.textures.exists('winner_celebration')) {
        const winnerImage = this.add.image(
          gameWidth / 2,
          gameHeight * 0.55,
          'winner_celebration',
        );

        // Scale the image appropriately for the screen
        const maxWidth = gameWidth * 0.6;
        const maxHeight = gameHeight * 0.25;
        const imageScale = Math.min(
          maxWidth / winnerImage.width,
          maxHeight / winnerImage.height,
          1, // Don't scale up beyond original size
        );

        winnerImage.setScale(imageScale);
        winnerImage.setDepth(6);

        // Add celebratory entrance animation
        winnerImage.setAlpha(0);
        winnerImage.setScale(imageScale * 0.5);

        this.tweens.add({
          targets: winnerImage,
          alpha: 1,
          scale: imageScale,
          duration: 1000,
          ease: 'Back.easeOut',
          delay: 500, // Delay to let other elements appear first
        });

        // Add gentle floating animation
        this.tweens.add({
          targets: winnerImage,
          y: winnerImage.y - 10,
          duration: 2500,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
          delay: 1500, // Start after entrance animation
        });

        // Add subtle glow effect
        this.tweens.add({
          targets: winnerImage,
          alpha: 0.9,
          duration: 1800,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
          delay: 1500,
        });
      }
    } catch (error) {
      console.warn('Failed to load winner celebration image:', error);
    }

    // Instruction text (moved down slightly to accommodate winner image)
    this.instructionText = this.add
      .text(
        gameWidth / 2,
        gameHeight * 0.8,
        'Press SPACE to play again\nPress ESC to return to welcome screen',
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

    // Add happy Cinnamoroll sprite if available (moved down to not overlap with winner image)
    try {
      if (this.textures.exists('cinnamoroll_sheet')) {
        const cinnamoroll = this.add.sprite(
          gameWidth / 2,
          gameHeight * 0.72,
          'cinnamoroll_sheet',
          0,
        );
        cinnamoroll.setScale(0.8); // Slightly smaller to fit with winner image
        cinnamoroll.setDepth(5);

        // Happy bouncing animation
        this.tweens.add({
          targets: cinnamoroll,
          y: cinnamoroll.y - 20,
          duration: 800,
          ease: 'Bounce.easeOut',
          yoyo: true,
          repeat: -1,
        });

        // Add sparkle particles around Cinnamoroll
        if (this.textures.exists('speed_star')) {
          const sparkles = this.add.particles(
            cinnamoroll.x,
            cinnamoroll.y,
            'speed_star',
            {
              scale: { start: 0.5, end: 0 },
              speed: { min: 50, max: 100 },
              alpha: { start: 1, end: 0 },
              lifespan: 1000,
              frequency: 100,
              emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Circle(0, 0, 60),
                quantity: 2,
              },
            },
          );
          sparkles.setDepth(8);
        }
      }
    } catch (error) {
      console.warn('Failed to load Cinnamoroll sprite for win screen:', error);
    }

    // Add rainbow effect to title
    this.tweens.add({
      targets: this.titleText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Add floating animation to subtitle
    this.tweens.add({
      targets: this.subtitleText,
      y: this.subtitleText.y - 8,
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

    // Create confetti particles
    this.createConfetti();

    // Play victory sound
    try {
      if (this.sound && this.sound.get('game_winner_sound')) {
        this.sound.play('game_winner_sound', { volume: 0.6 });
      }
    } catch (error) {
      console.warn('Failed to play victory sound:', error);
    }

    // Input handling
    this.input.keyboard?.on('keydown-SPACE', this.playAgain, this);
    this.input.keyboard?.on('keydown-ESC', this.goToWelcome, this);
    this.input.on('pointerdown', this.playAgain, this);
  }

  createConfetti() {
    const gameWidth = this.cameras.main.width;

    // Create colorful confetti particles
    const colors = [0xff69b4, 0xffd700, 0x00ff7f, 0x87ceeb, 0xff6347];

    for (let i = 0; i < 3; i++) {
      // Create simple colored rectangles for confetti
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(colors[i % colors.length], 1);
      graphics.fillRect(0, 0, 8, 8);
      graphics.generateTexture(`confetti_${i}`, 8, 8);
      graphics.destroy();

      // Create particle emitter
      const confetti = this.add.particles(gameWidth / 2, -50, `confetti_${i}`, {
        x: { min: 0, max: gameWidth },
        y: { min: -50, max: -10 },
        speedX: { min: -50, max: 50 },
        speedY: { min: 100, max: 200 },
        scale: { start: 1, end: 0.5 },
        alpha: { start: 1, end: 0.3 },
        lifespan: 3000,
        frequency: 150,
        gravityY: 100,
      });

      confetti.setDepth(15);
      this.particles.push(confetti);
    }
  }

  playAgain() {
    if (this.restartInputReceived) return;
    this.restartInputReceived = true;

    // Play transition sound
    try {
      if (this.sound && this.sound.get('powerup_sound')) {
        this.sound.play('powerup_sound', { volume: 0.4 });
      }
    } catch (error) {
      console.warn('Failed to play restart sound:', error);
    }

    // Stop particles
    this.particles.forEach((particle) => particle.stop());

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
        this.sound.play('powerup_sound', { volume: 0.4 });
      }
    } catch (error) {
      console.warn('Failed to play transition sound:', error);
    }

    // Stop particles
    this.particles.forEach((particle) => particle.stop());

    // Fade out and go to welcome with cream color
    this.cameras.main.fadeOut(500, 245, 245, 220);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WelcomeScene');
    });
  }

  update() {
    // Keep the background gently animated
    if (this.backgroundTileSprite) {
      this.backgroundTileSprite.tilePositionX -= 0.3;
    }
  }
}
