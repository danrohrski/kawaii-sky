import Phaser from 'phaser';
import useGameStore from '@/store/gameStore';
import { CloudMonsterPool } from '@/game/obstacles/CloudMonsterPool';
import { Obstacle } from '@/game/obstacles/Obstacle';
import { CollectiblePool } from '@/game/collectibles/CollectiblePool';
import { Collectible } from '@/game/collectibles/Collectible';
import { PowerUpPool } from '@/game/powerups/PowerUpPool';
import { PowerUpItem } from '@/game/powerups/PowerUpItem';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  LevelConfig,
  ObstacleTypeKey,
  CollectibleType,
  PowerUpType,
} from '@/game/levels/levelTypes'; // Centralized enums

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

// const LONG_PRESS_DURATION = 500; // Removed
// const CHARGE_METER_WIDTH = 100; // Removed
// const CHARGE_METER_HEIGHT = 10; // Removed

export class PlayScene extends Phaser.Scene {
  private cinnamoroll!: Phaser.Physics.Arcade.Sprite;
  private scoreText!: Phaser.GameObjects.Text; // To display score from store
  private cloudMonsterPool!: CloudMonsterPool;
  private obstacleSpawnTimer!: Phaser.Time.TimerEvent;
  private collectiblePool!: CollectiblePool;
  private collectibleSpawnTimer!: Phaser.Time.TimerEvent;
  private powerUpPool!: PowerUpPool;
  private powerUpSpawnTimer!: Phaser.Time.TimerEvent;
  private isInvincible = false;
  private invincibilityTimer?: Phaser.Time.TimerEvent;
  private blinkTween?: Phaser.Tweens.Tween; // For blinking effect
  private shieldVisual?: Phaser.GameObjects.Ellipse; // For shield visual
  // private pointerDownTime = 0; // Removed
  // private longPressTimer?: Phaser.Time.TimerEvent; // Removed
  // private isCharging = false; // Removed
  // private chargeMeterGraphics!: Phaser.GameObjects.Graphics; // Removed
  private currentLevelConfig!: LevelConfig;
  private currentLevelIndex!: number;

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
    this.cameras.main.setBackgroundColor(this.currentLevelConfig.skyColor);

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

    // Display score from Zustand store
    // Initial score display
    this.scoreText = this.add.text(
      10,
      10,
      `Score: ${useGameStore.getState().score}`,
      {
        fontSize: '20px',
        color: '#FFF',
      },
    );

    // Subscribe to score changes in the store to update the text
    // Note: This basic subscription updates on any store change. For more complex stores,
    // you might want more granular subscriptions or selectors if performance becomes an issue.
    useGameStore.subscribe((state) => {
      this.scoreText.setText(`Score: ${state.score}`);
    });

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

    // Add a quit button to go back to the main menu
    const quitButton = this.add
      .text(this.cameras.main.width - 20, 20, 'Quit', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#FFF',
        align: 'right',
      })
      .setOrigin(1, 0)
      .setInteractive();

    quitButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Stop this pointer event from bubbling up to the scene's pointerdown (which would cause a flap)
      pointer.event.stopPropagation();
      useGameStore.getState().resetGameSession();
      this.scene.start('MainMenuScene');
    });

    // Shield Visual (initially hidden)
    this.shieldVisual = this.add.ellipse(
      0,
      0,
      this.cinnamoroll.displayWidth + 20,
      this.cinnamoroll.displayHeight + 20,
      0x00ffff,
      0.3,
    );
    this.shieldVisual.setDepth(9); // Behind Cinnamoroll but above background
    this.shieldVisual.setVisible(false);
  }

  spawnObstacle() {
    const { scrollSpeedMultiplier, obstacleTypes } = this.currentLevelConfig;
    if (obstacleTypes.length === 0) return;
    // For now, only cloud_monster is implemented. Later, pick randomly from obstacleTypes.
    const typeToSpawn = obstacleTypes[0]; // Placeholder

    if (typeToSpawn === ObstacleTypeKey.CLOUD_MONSTER) {
      const gameWidth = this.cameras.main.width;
      const gameHeight = this.cameras.main.height;
      const spawnX = gameWidth + 50;
      const spawnY = Phaser.Math.Between(gameHeight * 0.2, gameHeight * 0.8);
      const speed = OBSTACLE_SCROLL_SPEED_BASE * scrollSpeedMultiplier; // Assuming a base speed constant
      this.cloudMonsterPool.getMonster(spawnX, spawnY, speed);
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
      this.playerHit(false);
      return;
    }

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
        useGameStore.getState().resetGameSession();
        CINNAMO_FLAP_VELOCITY_CURRENT = CINNAMO_FLAP_VELOCITY_NORMAL;
        const firstLevelConfig = this.cache.json.get(
          'level1_config',
        ) as LevelConfig;
        this.scene.start('MainMenuScene', {
          levelIndex: 0,
          levelConfig: firstLevelConfig,
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

  updateActivePowerUps(delta: number) {
    useGameStore.getState().updatePowerUpTimers(delta);
    const { isShieldActive, isSpeedActive, isMagnetActive } =
      useGameStore.getState();

    // Shield visual
    this.shieldVisual?.setVisible(isShieldActive);
    if (isShieldActive && this.shieldVisual) {
      this.shieldVisual.setPosition(this.cinnamoroll.x, this.cinnamoroll.y);
      this.shieldVisual.setStrokeStyle(2, 0x00ffff, 0.8); // Blinking or pulsing effect could be added
    }

    // Speed effect
    CINNAMO_FLAP_VELOCITY_CURRENT = isSpeedActive
      ? CINNAMO_FLAP_VELOCITY_BOOSTED
      : CINNAMO_FLAP_VELOCITY_NORMAL;
    this.cinnamoroll.setTint(isSpeedActive ? 0x00ff00 : 0xffffff); // Green tint for speed

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
    this.updateActivePowerUps(delta);

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
      this.scene.start('MainMenuScene');
      return;
    }

    if (
      this.cinnamoroll.y < -this.cinnamoroll.displayHeight / 2 ||
      this.cinnamoroll.y >
        this.cameras.main.height + this.cinnamoroll.displayHeight / 2
    ) {
      if (!this.isInvincible) this.playerHit(true);
    }
  }
}
