import Phaser from 'phaser';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    frame?: string | number,
  ) {
    super(scene, x, y, textureKey, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setImmovable(true); // Obstacles usually don't move when hit
  }

  // Method to reset obstacle state when reused from an object pool
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  spawn(x: number, y: number, velocityX: number, _textureKey?: string) {
    this.setPosition(x, y);
    this.setVelocityX(velocityX);
    this.setActive(true);
    this.setVisible(true);
    if (this.body) {
      this.body.enable = true;
    }
  }

  // Method to call when obstacle is out of bounds or despawned
  despawn() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.enable = false;
    }
    this.setVelocityX(0); // Stop movement
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    // Despawn if out of left screen bounds
    if (this.x < -this.displayWidth) {
      this.despawn();
    }
  }
}
