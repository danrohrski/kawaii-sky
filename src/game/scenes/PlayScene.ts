import Phaser from 'phaser';
import useGameStore from '@/store/gameStore'; // Import the store

const CINNAMO_FLAP_VELOCITY = -300;
const CINNAMO_GRAVITY = 800;

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

    // Placeholder Cinnamoroll sprite (a white rectangle for now)
    this.cinnamoroll = this.physics.add.sprite(
      this.cameras.main.width / 4,
      this.cameras.main.height / 2,
      '__MISSING', // Using a non-existent texture key intentionally for a white box
    );
    this.cinnamoroll.setSize(40, 30); // Set a custom size for the physics body
    // this.cinnamoroll.setCollideWorldBounds(true); // Optional: keep Cinnamoroll within game bounds

    // Apply gravity
    this.cinnamoroll.setGravityY(CINNAMO_GRAVITY);

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
      // Increment score in Zustand store for demonstration
      useGameStore.getState().incrementScore(1);
    }
  }

  update() {
    // Game loop logic here
    // Example: Check if Cinnamoroll is out of bounds
    if (
      this.cinnamoroll.y > this.cameras.main.height + this.cinnamoroll.height ||
      this.cinnamoroll.y < -this.cinnamoroll.height
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
