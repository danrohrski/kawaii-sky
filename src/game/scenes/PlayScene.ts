import Phaser from 'phaser';
import useGameStore from '@/store/gameStore'; // Import the store
// import { CloudMonsterPool, CloudMonster } from '@/game/obstacles/CloudMonsterPool'; // CloudMonster import removed
import { CloudMonsterPool } from '@/game/obstacles/CloudMonsterPool';
import { Obstacle } from '@/game/obstacles/Obstacle'; // Import Obstacle

const CINNAMO_FLAP_VELOCITY = -300;
// const CINNAMO_BURST_VELOCITY = -500; // Removed
const CINNAMO_GRAVITY = 800;
const CINNAMO_SCALE = 0.5; // Scale down Cinnamoroll if needed
const OBSTACLE_SCROLL_SPEED = -150; // Speed at which obstacles move left
const OBSTACLE_SPAWN_INTERVAL = 2000; // Spawn an obstacle every 2 seconds (adjust as needed)
const INVINCIBILITY_DURATION = 1500; // 1.5 seconds of invincibility

// const LONG_PRESS_DURATION = 500; // Removed
// const CHARGE_METER_WIDTH = 100; // Removed
// const CHARGE_METER_HEIGHT = 10; // Removed

export class PlayScene extends Phaser.Scene {
  private cinnamoroll!: Phaser.Physics.Arcade.Sprite;
  private scoreText!: Phaser.GameObjects.Text; // To display score from store
  private cloudMonsterPool!: CloudMonsterPool;
  private obstacleSpawnTimer!: Phaser.Time.TimerEvent;
  private isInvincible = false;
  private invincibilityTimer?: Phaser.Time.TimerEvent;
  private blinkTween?: Phaser.Tweens.Tween; // For blinking effect
  // private pointerDownTime = 0; // Removed
  // private longPressTimer?: Phaser.Time.TimerEvent; // Removed
  // private isCharging = false; // Removed
  // private chargeMeterGraphics!: Phaser.GameObjects.Graphics; // Removed

  constructor() {
    super('PlayScene');
  }

  create() {
    console.log('PlayScene: create');
    // Placeholder sky
    this.cameras.main.setBackgroundColor('#AEC6CF'); // pastel-blue

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
      delay: OBSTACLE_SPAWN_INTERVAL,
      callback: this.spawnObstacle,
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

    // Reset score on scene start for now (or if coming from game over)
    if (
      useGameStore.getState().lives === 3 &&
      useGameStore.getState().score === 0
    ) {
      useGameStore.getState().resetGame(); // Ensures clean state on very first game or after full game over
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
      useGameStore.getState().resetGame(); // Reset score/lives when quitting to main menu
      this.scene.start('MainMenuScene');
    });
  }

  spawnObstacle() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    const spawnX = gameWidth + 50;
    const spawnY = Phaser.Math.Between(gameHeight * 0.2, gameHeight * 0.8);
    this.cloudMonsterPool.getMonster(spawnX, spawnY, OBSTACLE_SCROLL_SPEED);
  }

  handlePlayerObstacleCollision(
    player: Phaser.GameObjects.GameObject,
    obstacle: Phaser.GameObjects.GameObject,
  ) {
    if (this.isInvincible || !(player as Phaser.Physics.Arcade.Sprite).active)
      return;

    if (obstacle instanceof Obstacle && obstacle.active) {
      obstacle.despawn();
      this.playerHit();
    } else if (
      obstacle instanceof Phaser.Physics.Arcade.Sprite &&
      obstacle.active
    ) {
      (obstacle as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
      this.playerHit();
    }
  }

  playerHit() {
    if (this.isInvincible || !this.cinnamoroll.active) return;

    useGameStore.getState().decrementLives();
    const currentLives = useGameStore.getState().lives;

    if (currentLives <= 0) {
      console.log('Game Over');
      if (this.blinkTween) this.blinkTween.stop(); // Stop blink on game over
      this.cinnamoroll.setAlpha(1); // Ensure visible on game over if was blinking
      useGameStore.getState().resetGame();
      this.scene.start('MainMenuScene');
    } else {
      console.log(`Player hit! Lives remaining: ${currentLives}`);
      this.isInvincible = true;
      this.cinnamoroll.setAlpha(0.5);
      this.cinnamoroll.setVelocityX(0); // Stop any horizontal movement from collision

      // Tween Cinnamoroll back to starting X position
      this.tweens.add({
        targets: this.cinnamoroll,
        x: this.cameras.main.width / 4,
        ease: 'Power1',
        duration: 300, // Duration of the tween back
      });

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
            // Check if still active before resetting alpha
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

  performFlap() {
    if (this.cinnamoroll && this.cinnamoroll.active) {
      this.cinnamoroll.setVelocityY(CINNAMO_FLAP_VELOCITY);
      this.cinnamoroll.play('flap', true);
      this.cinnamoroll.once(
        Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'flap',
        () => {
          if (this.cinnamoroll.active) {
            this.cinnamoroll.play('idle', true);
          }
        },
      );
      useGameStore.getState().incrementScore(1);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_time: number, _delta: number) {
    if (!this.cinnamoroll.active) return;

    if (
      this.cinnamoroll.y >
        this.cameras.main.height + this.cinnamoroll.displayHeight / 2 ||
      this.cinnamoroll.y < -(this.cinnamoroll.displayHeight / 2)
    ) {
      if (!this.isInvincible) {
        this.playerHit(); // playerHit now handles repositioning if not game over
        // If still alive after hit, playerHit will tween X. We might still want to reset Y velocity here.
        if (useGameStore.getState().lives > 0 && this.cinnamoroll.active) {
          // this.cinnamoroll.setPosition(this.cameras.main.width / 4, this.cameras.main.height / 2); // playerHit handles X, Y can be centered or as is
          this.cinnamoroll.setVelocityY(0); // Stop current fall/rise to prevent immediate re-trigger
        }
      }
    }
  }
}
