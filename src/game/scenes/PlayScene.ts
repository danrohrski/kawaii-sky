import * as Phaser from 'phaser';
import useGameStore from '@/store/gameStore';
import { CloudMonsterPool } from '@/game/obstacles/CloudMonsterPool';
import { BoulderPool } from '@/game/obstacles/BoulderPool';
import { FlyingKittenPool } from '@/game/obstacles/FlyingKittenPool';
import { Obstacle } from '@/game/obstacles/Obstacle';
import { CollectiblePool } from '@/game/collectibles/CollectiblePool';
import { Collectible } from '@/game/collectibles/Collectible';
import { PowerUpPool } from '@/game/powerups/PowerUpPool';
import { PowerUpItem } from '@/game/powerups/PowerUpItem';
import {
  LevelConfig,
  ObstacleTypeKey,
  PowerUpType,
} from '@/game/levels/levelTypes'; // Centralized enums
import { AudioManager } from '@/game/AudioManager';

const CINNAMO_FLAP_VELOCITY_NORMAL = -300;
let CINNAMO_FLAP_VELOCITY_CURRENT = CINNAMO_FLAP_VELOCITY_NORMAL;
const CINNAMO_FLAP_VELOCITY_BOOSTED = -400; // For Speed PowerUp
const CINNAMO_GRAVITY = 800;
const CINNAMO_SCALE = 0.5; // Scale down Cinnamoroll if needed
const OBSTACLE_SCROLL_SPEED_BASE = -150;
const COLLECTIBLE_SCROLL_SPEED_BASE = -120;
const POWERUP_SCROLL_SPEED_BASE = -100;
const INVINCIBILITY_DURATION = 1500; // 1.5 seconds of invincibility
const MAGNET_RADIUS = 150; // Radius for magnet effect
const BACKGROUND_SCROLL_SPEED_MULTIPLIER = 0.2; // Generic background scroll speed
const BACKGROUND_SCALE = 0.5; // Generic background scale

// const LONG_PRESS_DURATION = 500; // Removed
// const CHARGE_METER_WIDTH = 100; // Removed
// const CHARGE_METER_HEIGHT = 10; // Removed

export class PlayScene extends Phaser.Scene {
  private cinnamoroll!: Phaser.Physics.Arcade.Sprite;
  private cloudMonsterPool!: CloudMonsterPool;
  private boulderPool!: BoulderPool;
  private flyingKittenPool!: FlyingKittenPool;
  private obstacleSpawnTimer!: Phaser.Time.TimerEvent;
  private collectiblePool!: CollectiblePool;
  private collectibleSpawnTimer!: Phaser.Time.TimerEvent;
  private powerUpPool!: PowerUpPool;
  private powerUpSpawnTimer!: Phaser.Time.TimerEvent;
  private isInvincible = false;
  private invincibilityTimer?: Phaser.Time.TimerEvent;
  private blinkTween?: Phaser.Tweens.Tween; // For blinking effect
  private shieldVisual?: Phaser.GameObjects.Container; // For shield visual container
  private shieldBubble?: Phaser.GameObjects.Ellipse; // Main bubble
  private shieldHighlight?: Phaser.GameObjects.Ellipse; // Specular highlight
  private speedParticles?: Phaser.GameObjects.Particles.ParticleEmitter; // Speed effect particles
  // private pointerDownTime = 0; // Removed
  // private longPressTimer?: Phaser.Time.TimerEvent; // Removed
  // private isCharging = false; // Removed
  // private chargeMeterGraphics!: Phaser.GameObjects.Graphics; // Removed
  private currentLevelConfig!: LevelConfig;
  private currentLevelIndex!: number;
  private backgroundTileSprite!: Phaser.GameObjects.TileSprite;
  private skyShader!: Phaser.GameObjects.Shader;
  private dayTime = 0; // 0 to 1 cycle for day-night

  constructor() {
    super('PlayScene');
  }

  init(data: { levelIndex?: number; levelConfig?: LevelConfig }) {
    if (data && data.levelConfig && typeof data.levelIndex === 'number') {
      this.currentLevelIndex = data.levelIndex;
      this.currentLevelConfig = data.levelConfig;
    } else {
      console.warn(
        'PlayScene init: No or incomplete level data, loading default (level1_config).',
      );
      this.currentLevelIndex = 0; // Default to level 0 index
      this.currentLevelConfig = this.cache.json.get(
        'level1_config',
      ) as LevelConfig;
    }

    if (!this.currentLevelConfig) {
      console.error(
        'CRITICAL: Failed to load any levelConfig in PlayScene init! Returning to MainMenu.',
      );
      this.scene.start('MainMenuScene'); // Avoid crash, go back to main menu to restart flow
      return;
    }
    useGameStore
      .getState()
      .setCurrentLevelConfig(this.currentLevelIndex, this.currentLevelConfig);
  }

  create() {
    if (!this.currentLevelConfig) {
      // This should ideally not be hit if init is robust
      console.error(
        "PlayScene create: currentLevelConfig is missing. This shouldn't happen.",
      );
      this.scene.start('MainMenuScene');
      return;
    }
    console.log(
      'PlayScene: create for level:',
      this.currentLevelConfig.levelName,
    );

    // Update AudioManager with current scene to maintain background music
    const audioManager = AudioManager.getInstance();
    audioManager.setCurrentScene(this);

    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    this.skyShader = this.add.shader(
      'sky_gradient_shader',
      gameWidth / 2,
      gameHeight / 2,
      gameWidth,
      gameHeight,
      [],
    );
    this.skyShader.setDepth(-20);

    // Use background image from level config
    const backgroundTexture = this.textures.get(
      this.currentLevelConfig.backgroundImage,
    );
    const backgroundImgHeight = backgroundTexture.getSourceImage().height;

    this.backgroundTileSprite = this.add.tileSprite(
      0,
      0, // Initial Y, will be adjusted explicitly
      gameWidth / BACKGROUND_SCALE,
      backgroundImgHeight,
      this.currentLevelConfig.backgroundImage,
    );
    this.backgroundTileSprite.setOrigin(0, 0); // TOP-LEFT origin
    this.backgroundTileSprite.setScale(BACKGROUND_SCALE);

    // After scaling, this.backgroundTileSprite.displayHeight is its visual height.
    // To align its bottom with the screen bottom (gameHeight):
    // its top (y) should be gameHeight - its visual height.
    this.backgroundTileSprite.y =
      gameHeight - this.backgroundTileSprite.displayHeight;

    this.backgroundTileSprite.setScrollFactor(0);
    this.backgroundTileSprite.setDepth(-10);

    // Cinnamoroll sprite using the loaded sheet
    this.cinnamoroll = this.physics.add.sprite(
      this.cameras.main.width / 4,
      this.cameras.main.height / 2,
      'cinnamoroll_sheet', // Key of the loaded spritesheet
      0, // Start with the first frame (index 0)
    );
    this.cinnamoroll.setScale(CINNAMO_SCALE);
    // Adjust physics body size after scaling if necessary.
    // For simplicity, we assume the scaled size is okay for now.
    // If collisions are inaccurate, we might need: this.cinnamoroll.body.setSize(width * scale, height * scale);

    // Apply gravity
    this.cinnamoroll.setGravityY(CINNAMO_GRAVITY);

    // Make Cinnamoroll collide with world bounds so it doesn't fall through the bottom initially
    this.cinnamoroll.setCollideWorldBounds(true);
    // Set a smaller physics body for Cinnamoroll if needed, to better match the scaled sprite
    // Example: this.cinnamoroll.body.setSize(this.cinnamoroll.width * 0.7, this.cinnamoroll.height * 0.7);

    // Define animations
    // Idle animation (assuming frame 0 is idle)
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'cinnamoroll_sheet', frame: 0 }],
      frameRate: 10, // Not really used for single frame anim, but good practice
      repeat: -1,
    });

    // Flap animation (assuming frame 1 is the flap pose, or a sequence)
    // If flap is a single frame, it might look better to just set the frame directly on flap
    // and then revert. For a multi-frame flap animation:
    this.anims.create({
      key: 'flap',
      frames: this.anims.generateFrameNumbers('cinnamoroll_sheet', {
        start: 0,
        end: 1,
      }), // Example: use frame 0 then 1
      frameRate: 10,
      repeat: 0, // Play once
    });

    this.cinnamoroll.play('idle'); // Start with idle animation

    // Simplified input handling
    this.input.on('pointerdown', this.performFlap, this);
    this.input.keyboard?.on('keydown-SPACE', this.performFlap, this);

    // Initialize CloudMonsterPool
    this.cloudMonsterPool = new CloudMonsterPool(this);

    // Initialize other obstacle pools
    this.boulderPool = new BoulderPool(this);
    this.flyingKittenPool = new FlyingKittenPool(this);

    // Setup timer to spawn obstacles
    this.obstacleSpawnTimer = this.time.addEvent({
      delay: this.currentLevelConfig.obstacleSpawnIntervalBase, // Use from config
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    // Collectibles
    this.collectiblePool = new CollectiblePool(this);
    this.collectibleSpawnTimer = this.time.addEvent({
      delay: this.currentLevelConfig.collectibleSpawnIntervalBase, // Use from config
      callback: this.spawnCollectible,
      callbackScope: this,
      loop: true,
    });

    // Power-ups
    this.powerUpPool = new PowerUpPool(this);
    this.powerUpSpawnTimer = this.time.addEvent({
      delay: this.currentLevelConfig.powerUpSpawnIntervalBase, // Use from config
      callback: this.spawnPowerUp,
      callbackScope: this,
      loop: true,
    });

    // Collision detection
    this.physics.add.collider(
      this.cinnamoroll,
      this.cloudMonsterPool,
      this
        .handlePlayerObstacleCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    // Boulder collision detection
    this.physics.add.collider(
      this.cinnamoroll,
      this.boulderPool,
      this
        .handlePlayerObstacleCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    // Flying kitten collision detection
    this.physics.add.collider(
      this.cinnamoroll,
      this.flyingKittenPool,
      this
        .handlePlayerObstacleCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    // Collectible overlap detection
    this.physics.add.overlap(
      this.cinnamoroll,
      this.collectiblePool,
      this
        .handlePlayerCollectibleOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    // Power-up overlap detection
    this.physics.add.overlap(
      this.cinnamoroll,
      this.powerUpPool,
      this
        .handlePlayerPowerUpOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    // Ensure game state is reset based on the current level context if it's a fresh start for this level
    const storeState = useGameStore.getState();
    if (
      !storeState.currentLevelConfig ||
      storeState.currentLevelIndex !== this.currentLevelIndex ||
      storeState.currentLevelConfig.levelName !==
        this.currentLevelConfig.levelName
    ) {
      if (
        this.currentLevelIndex === 0 &&
        storeState.score === 0 &&
        storeState.lives === 3
      ) {
        // Let initialGameState from store prevail for first load
      } else {
        // For subsequent levels, setCurrentLevelConfig in init should set the config.
        // Score and lives carry over unless advanceToNextLevel/resetGameSession modified them.
      }
    }

    // Shield Visual (initially hidden) - Create realistic bubble effect
    const bubbleSize = this.cinnamoroll.displayWidth + 30;

    // Create container for the bubble effect
    this.shieldVisual = this.add.container(0, 0);

    // Main bubble with iridescent colors (multiple layered ellipses for rainbow effect)
    this.shieldBubble = this.add.ellipse(
      0,
      0,
      bubbleSize,
      bubbleSize,
      0xff69b4,
      0.15,
    ); // Pink base
    this.shieldBubble.setStrokeStyle(2, 0x00ffff, 0.4); // Cyan stroke

    // Add rainbow gradient layers
    const bubble2 = this.add.ellipse(
      0,
      0,
      bubbleSize * 0.95,
      bubbleSize * 0.95,
      0x00ffff,
      0.1,
    ); // Cyan
    const bubble3 = this.add.ellipse(
      0,
      0,
      bubbleSize * 0.9,
      bubbleSize * 0.9,
      0x9966ff,
      0.1,
    ); // Purple
    const bubble4 = this.add.ellipse(
      0,
      0,
      bubbleSize * 0.85,
      bubbleSize * 0.85,
      0x66ff66,
      0.08,
    ); // Green

    // Specular highlight (white spot in upper-left)
    this.shieldHighlight = this.add.ellipse(
      -bubbleSize * 0.2, // Offset to upper-left
      -bubbleSize * 0.2,
      bubbleSize * 0.25, // Smaller highlight
      bubbleSize * 0.15, // Slightly oval
      0xffffff,
      0.6, // Bright white highlight
    );

    // Add secondary smaller highlight for extra realism
    const highlight2 = this.add.ellipse(
      bubbleSize * 0.15,
      bubbleSize * 0.1,
      bubbleSize * 0.1,
      bubbleSize * 0.08,
      0xffffff,
      0.3,
    );

    // Add all elements to the container
    this.shieldVisual.add([
      this.shieldBubble,
      bubble2,
      bubble3,
      bubble4,
      this.shieldHighlight,
      highlight2,
    ]);
    this.shieldVisual.setDepth(this.cinnamoroll.depth - 1);
    this.shieldVisual.setVisible(false);

    // Speed particle system (initially stopped)
    this.speedParticles = this.add.particles(0, 0, 'speed_star', {
      x: 0, // Will be updated to Cinnamoroll position
      y: 0,
      scale: { start: 0.6, end: 0.1 },
      alpha: { start: 1, end: 0 },
      gravityY: 80,
      frequency: 120, // Emit every 120ms for more sparkles
      lifespan: 2000,
      quantity: { min: 1, max: 3 },
      rotate: { min: 0, max: 360 },
      tint: [0xffd700, 0xff69b4, 0x00ffff, 0x9966ff], // Gold, pink, cyan, purple
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Rectangle(-10, -10, 20, 15), // Smaller area around character center
        quantity: 1,
      },
      // Particles trail backward (opposite to movement direction)
      speedX: { min: -120, max: -60 }, // All negative X for trailing behind (left)
      speedY: { min: 20, max: 80 }, // All positive Y for downward movement
    });
    this.speedParticles.setDepth(this.cinnamoroll.depth - 1); // Behind Cinnamoroll
    this.speedParticles.stop(); // Initially stopped

    // Ensure Cinnamoroll and other elements have a depth greater than the background
    this.cinnamoroll.setDepth(1); // Already set in a previous version, ensure it's still there and > background depth
    this.cloudMonsterPool.setDepth(0); // Example: obstacles just above background
    this.boulderPool.setDepth(0);
    this.flyingKittenPool.setDepth(0);
    this.collectiblePool.setDepth(0);
    this.powerUpPool.setDepth(0);
    if (this.shieldVisual)
      this.shieldVisual.setDepth(this.cinnamoroll.depth - 1); // Shield bubble behind Cinnamoroll

    // Ensure backgroundTileSprite and other BGs are in front of skyShader but behind game elements
    if (this.backgroundTileSprite) this.backgroundTileSprite.setDepth(-10);
  }

  spawnObstacle() {
    const { scrollSpeedMultiplier, obstacleTypes } = this.currentLevelConfig;
    if (obstacleTypes.length === 0) return;

    // Randomly select an obstacle type from the level config
    const typeToSpawn =
      obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    const spawnX = gameWidth + 50;
    const spawnY = Phaser.Math.Between(gameHeight * 0.2, gameHeight * 0.8);
    const speed = OBSTACLE_SCROLL_SPEED_BASE * scrollSpeedMultiplier;

    switch (typeToSpawn) {
      case ObstacleTypeKey.CLOUD_MONSTER:
        this.cloudMonsterPool.getMonster(spawnX, spawnY, speed);
        break;
      case ObstacleTypeKey.BOULDER:
        this.boulderPool.getBoulder(spawnX, spawnY, speed);
        break;
      case ObstacleTypeKey.FLYING_KITTEN:
        this.flyingKittenPool.getKitten(spawnX, spawnY, speed);
        break;
      default:
        console.warn(`Unknown obstacle type: ${typeToSpawn}`);
        break;
    }
  }

  spawnCollectible() {
    const { scrollSpeedMultiplier, collectibleTypes } = this.currentLevelConfig;
    if (collectibleTypes.length === 0) return;
    const typeToSpawn =
      collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)]; // No cast needed
    const speed = COLLECTIBLE_SCROLL_SPEED_BASE * scrollSpeedMultiplier;
    this.collectiblePool.spawnCollectible(
      this.cameras.main.width + 50,
      Phaser.Math.Between(
        this.cameras.main.height * 0.2,
        this.cameras.main.height * 0.8,
      ),
      speed,
      typeToSpawn,
    );
  }

  spawnPowerUp() {
    const { scrollSpeedMultiplier, powerUpTypes } = this.currentLevelConfig;
    if (powerUpTypes.length === 0) return;
    const typeToSpawn =
      powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]; // No cast needed
    const speed = POWERUP_SCROLL_SPEED_BASE * scrollSpeedMultiplier;
    this.powerUpPool.spawnPowerUp(
      this.cameras.main.width + 50,
      Phaser.Math.Between(
        this.cameras.main.height * 0.3,
        this.cameras.main.height * 0.7,
      ),
      speed,
      typeToSpawn,
    );
  }

  handlePlayerObstacleCollision(
    player: Phaser.GameObjects.GameObject,
    obstacle: Phaser.GameObjects.GameObject,
  ) {
    if (this.isInvincible || !(player as Phaser.Physics.Arcade.Sprite).active)
      return;

    if (useGameStore.getState().isShieldActive) {
      useGameStore.getState().deactivatePowerUp(PowerUpType.SHIELD);
      if (obstacle instanceof Obstacle) (obstacle as Obstacle).despawn();
      console.log('Shield blocked an obstacle!');
      // Play collision sound even when shield blocks (softer impact)
      this.sound.play('collision_sound', { volume: 0.3 });
      this.playerHit(false);
      return;
    }

    // Play collision sound for actual hits
    this.sound.play('collision_sound', { volume: 0.6 });

    if (obstacle instanceof Obstacle && obstacle.active) {
      obstacle.despawn();
      this.playerHit(true);
    } else if (
      obstacle instanceof Phaser.Physics.Arcade.Sprite &&
      obstacle.active
    ) {
      (obstacle as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
      this.playerHit(true);
    }
  }

  handlePlayerCollectibleOverlap(
    player: Phaser.GameObjects.GameObject,
    collectibleGO: Phaser.GameObjects.GameObject,
  ) {
    if (
      !(player as Phaser.Physics.Arcade.Sprite).active ||
      !(collectibleGO instanceof Collectible) ||
      !collectibleGO.active
    ) {
      return;
    }
    const collectible = collectibleGO as Collectible;

    // Play collectible eat sound
    this.sound.play('eat_sound', { volume: 0.6 });

    useGameStore.getState().incrementScore(collectible.pointsValue);
    console.log(
      `Collected ${collectible.collectibleType}, +${collectible.pointsValue} points!`,
    );
    collectible.collect(); // Make it disappear and stop further interactions
  }

  handlePlayerPowerUpOverlap(
    player: Phaser.GameObjects.GameObject,
    powerUpGO: Phaser.GameObjects.GameObject,
  ) {
    if (
      !(player as Phaser.Physics.Arcade.Sprite).active ||
      !(powerUpGO instanceof PowerUpItem) ||
      !powerUpGO.active
    )
      return;
    const powerUp = powerUpGO as PowerUpItem;

    // Play power-up collection sound
    this.sound.play('powerup_sound', { volume: 0.7 });

    useGameStore
      .getState()
      .activatePowerUp(powerUp.powerUpType, powerUp.duration);
    console.log(`Collected PowerUp: ${powerUp.powerUpType}`);
    powerUp.collect();
  }

  playerHit(isDamagingHit: boolean) {
    if (!this.cinnamoroll.active) return;
    if (isDamagingHit && this.isInvincible) return;

    if (isDamagingHit) {
      useGameStore.getState().decrementLives();
      const currentLives = useGameStore.getState().lives;
      if (currentLives <= 0) {
        console.log('Game Over');
        if (this.blinkTween) this.blinkTween.stop();
        this.cinnamoroll.setAlpha(1);

        // Get current score and level before resetting
        const finalScore = useGameStore.getState().score;
        const currentLevel = this.currentLevelIndex + 1; // Convert to 1-based for display

        useGameStore.getState().resetGameSession();
        CINNAMO_FLAP_VELOCITY_CURRENT = CINNAMO_FLAP_VELOCITY_NORMAL;

        // Go to GameOverScene with score and level info
        this.scene.start('GameOverScene', {
          score: finalScore,
          level: currentLevel,
        });
        return;
      } else {
        console.log(`Player hit! Lives remaining: ${currentLives}`);
        this.isInvincible = true;
        this.cinnamoroll.setAlpha(0.5);
        this.cinnamoroll.setVelocityX(0);

        if (this.blinkTween) this.blinkTween.stop();
        this.blinkTween = this.tweens.add({
          targets: this.cinnamoroll,
          alpha: { from: 0.5, to: 1 },
          ease: 'Linear',
          duration: 200,
          repeat: Math.floor(INVINCIBILITY_DURATION / 400),
          yoyo: true,
        });

        if (this.invincibilityTimer) this.invincibilityTimer.remove();
        this.invincibilityTimer = this.time.delayedCall(
          INVINCIBILITY_DURATION,
          () => {
            this.isInvincible = false;
            if (this.cinnamoroll.active) {
              this.cinnamoroll.setAlpha(1);
            }
            if (this.blinkTween) this.blinkTween.stop();
            console.log('Invincibility ended');
          },
          [],
          this,
        );
      }
    }

    this.cinnamoroll.setVelocityX(0);
    this.tweens.add({
      targets: this.cinnamoroll,
      x: this.cameras.main.width / 4,
      ease: 'Power1',
      duration: 300,
    });
  }

  performFlap() {
    if (this.cinnamoroll && this.cinnamoroll.active) {
      // Play flap sound
      this.sound.play('flap_sound', { volume: 0.5 });

      this.cinnamoroll.setVelocityY(CINNAMO_FLAP_VELOCITY_CURRENT);
      this.cinnamoroll.play('flap', true);
      this.cinnamoroll.once(
        Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'flap',
        () => {
          if (this.cinnamoroll.active) {
            this.cinnamoroll.play('idle', true);
          }
        },
      );
    }
  }

  updateActivePowerUps(delta: number, time: number) {
    useGameStore.getState().updatePowerUpTimers(delta);
    const { isShieldActive, isSpeedActive, isMagnetActive } =
      useGameStore.getState();

    // Shield visual
    this.shieldVisual?.setVisible(isShieldActive);
    if (isShieldActive && this.shieldVisual && this.shieldBubble) {
      // Position the entire bubble container around Cinnamoroll
      this.shieldVisual.setPosition(this.cinnamoroll.x, this.cinnamoroll.y);

      // Add subtle pulsing animation to make it more dynamic
      const pulseFactor = 1 + Math.sin(time * 0.008) * 0.05; // Gentle pulsing
      this.shieldVisual.setScale(pulseFactor);

      // Add rainbow color cycling for main bubble
      const colorCycle = time * 0.003; // Slow color cycling
      const r = Math.floor(Math.sin(colorCycle) * 127 + 128);
      const g = Math.floor(Math.sin(colorCycle + 2) * 127 + 128);
      const b = Math.floor(Math.sin(colorCycle + 4) * 127 + 128);
      const dynamicColor = (r << 16) | (g << 8) | b;
      this.shieldBubble.setFillStyle(dynamicColor, 0.15);
    }

    // Speed effect
    CINNAMO_FLAP_VELOCITY_CURRENT = isSpeedActive
      ? CINNAMO_FLAP_VELOCITY_BOOSTED
      : CINNAMO_FLAP_VELOCITY_NORMAL;

    // Speed particles instead of green tint
    if (isSpeedActive && this.speedParticles) {
      this.speedParticles.setPosition(
        this.cinnamoroll.x,
        this.cinnamoroll.y - 5,
      );
      if (!this.speedParticles.emitting) {
        this.speedParticles.start();
      }
    } else if (this.speedParticles && this.speedParticles.emitting) {
      this.speedParticles.stop();
    }

    // Magnet effect
    if (isMagnetActive) {
      this.collectiblePool.getChildren().forEach((collectibleGO) => {
        if (collectibleGO instanceof Collectible && collectibleGO.active) {
          const distance = Phaser.Math.Distance.BetweenPoints(
            this.cinnamoroll,
            collectibleGO,
          );
          if (distance < MAGNET_RADIUS) {
            this.physics.moveToObject(collectibleGO, this.cinnamoroll, 200); // Attract speed 200
          }
        }
      });
    }
  }

  update(time: number, delta: number) {
    if (!this.cinnamoroll.active) return;
    this.updateActivePowerUps(delta, time);

    const { score } = useGameStore.getState();
    const currentConfig = this.currentLevelConfig;

    if (
      currentConfig?.targetScoreToAdvance &&
      score >= currentConfig.targetScoreToAdvance
    ) {
      console.log(
        `Level ${currentConfig.levelName} complete with score ${score}! Advancing.`,
      );
      useGameStore.getState().advanceToNextLevel();

      // Check if the game was won after advancing
      const newState = useGameStore.getState();
      if (newState.gameWon) {
        console.log('🎉 All levels completed! You won!');
        // Play winner sound for completing the entire game
        this.sound.play('game_winner_sound', { volume: 0.8 });

        // Go to GameWinScene with final score
        this.scene.start('GameWinScene', {
          score: newState.score,
        });
      } else {
        // Play level complete sound for finishing a level
        this.sound.play('level_complete_sound', { volume: 0.7 });
        // Load the next level
        console.log(`Loading level ${newState.currentLevelIndex + 1}...`);
        this.scene.start('PreloaderScene', {
          levelIndex: newState.currentLevelIndex,
          fromLevelComplete: true,
        });
      }
      return;
    }

    if (
      this.cinnamoroll.y < -this.cinnamoroll.displayHeight / 2 ||
      this.cinnamoroll.y >
        this.cameras.main.height + this.cinnamoroll.displayHeight / 2
    ) {
      if (!this.isInvincible) this.playerHit(true);
    }

    // Scroll the background
    const baseScroll =
      OBSTACLE_SCROLL_SPEED_BASE *
      this.currentLevelConfig.scrollSpeedMultiplier;
    // Scroll background in the OPPOSITE direction (positive for right scroll)
    this.backgroundTileSprite.tilePositionX -=
      baseScroll * BACKGROUND_SCROLL_SPEED_MULTIPLIER * (delta / 1000);
    // Subtracted to reverse: if baseScroll is negative (moving left), -- becomes positive (moving right)
  }
}
