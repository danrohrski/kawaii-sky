import Phaser from 'phaser';

const CINNAMO_FLAP_VELOCITY = -300;
const CINNAMO_GRAVITY = 800;

export class PlayScene extends Phaser.Scene {
  private cinnamoroll!: Phaser.Physics.Arcade.Sprite;

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

    // Placeholder for score display
    this.add.text(10, 10, 'Score: 0 (TODO)', {
      fontSize: '20px',
      color: '#FFF',
    });

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
    }
  }

  update() {
    // Game loop logic here
    // Example: Check if Cinnamoroll is out of bounds
    if (
      this.cinnamoroll.y > this.cameras.main.height + this.cinnamoroll.height ||
      this.cinnamoroll.y < -this.cinnamoroll.height
    ) {
      // For now, just restart the scene if Cinnamoroll goes off screen
      // Later, this will be proper game over logic
      // this.scene.restart();
    }
  }
}
