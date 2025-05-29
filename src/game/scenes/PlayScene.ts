import Phaser from 'phaser';
import useGameStore from '@/store/gameStore'; // Import the store

const CINNAMO_FLAP_VELOCITY = -300;
// const CINNAMO_BURST_VELOCITY = -500; // Removed
const CINNAMO_GRAVITY = 800;
const CINNAMO_SCALE = 0.5; // Scale down Cinnamoroll if needed

// const LONG_PRESS_DURATION = 500; // Removed
// const CHARGE_METER_WIDTH = 100; // Removed
// const CHARGE_METER_HEIGHT = 10; // Removed

export class PlayScene extends Phaser.Scene {
  private cinnamoroll!: Phaser.Physics.Arcade.Sprite;
  private scoreText!: Phaser.GameObjects.Text; // To display score from store
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
    useGameStore.getState().resetGame();

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
      this.scene.start('MainMenuScene');
    });
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
    // Removed charge meter update logic

    if (
      this.cinnamoroll.y >
        this.cameras.main.height + this.cinnamoroll.displayHeight / 2 ||
      this.cinnamoroll.y < -(this.cinnamoroll.displayHeight / 2)
    ) {
      this.scene.start('MainMenuScene');
    }
  }
}
