import Phaser from 'phaser';
import useGameStore from '@/store/gameStore'; // Import the store

const CINNAMO_FLAP_VELOCITY = -300;
const CINNAMO_GRAVITY = 800;
const CINNAMO_SCALE = 0.5; // Scale down Cinnamoroll if needed

export class PlayScene extends Phaser.Scene {
  private cinnamoroll!: Phaser.Physics.Arcade.Sprite;
  private scoreText!: Phaser.GameObjects.Text; // To display score from store

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

    // Tap to flap mechanics
    this.input.on('pointerdown', this.flap, this);
    this.input.keyboard?.on('keydown-SPACE', this.flap, this);

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

    quitButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }

  flap() {
    if (this.cinnamoroll) {
      this.cinnamoroll.setVelocityY(CINNAMO_FLAP_VELOCITY);
      this.cinnamoroll.play('flap', true); // Play flap animation
      // After flap animation completes, return to idle
      this.cinnamoroll.once(
        Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'flap',
        () => {
          if (this.cinnamoroll.active) {
            // Check if sprite is still active
            this.cinnamoroll.play('idle', true);
          }
        },
      );
      useGameStore.getState().incrementScore(1);
    }
  }

  update() {
    // Game loop logic here
    // Example: Check if Cinnamoroll is out of bounds
    if (
      this.cinnamoroll.y >
        this.cameras.main.height + this.cinnamoroll.displayHeight / 2 ||
      this.cinnamoroll.y < -(this.cinnamoroll.displayHeight / 2)
    ) {
      // Placeholder: When Cinnamoroll goes off-screen, go back to main menu
      // Later, this will be proper game over logic, potentially showing a game over screen
      // and then resetting the game state (score, lives) via the store.
      // For now, just directly starting MainMenuScene.
      // Consider calling useGameStore.getState().decrementLives() or useGameStore.getState().resetGame() here
      // depending on game over logic.
      this.scene.start('MainMenuScene');
    }
  }
}
