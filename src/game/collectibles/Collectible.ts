import Phaser from 'phaser';

export enum CollectibleType {
  CINNAMON_ROLL = 'cinnamon_roll',
  COFFEE_CUP = 'coffee_cup',
  STAR = 'star',
}

export interface CollectibleConfig {
  textureKey: string;
  points: number;
  type: CollectibleType;
}

const ROTATION_SPEED = 0.01; // Radians per frame for slow rotation
const SHRINK_DURATION = 200; // Milliseconds to shrink when collected

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  public pointsValue: number;
  public collectibleType: CollectibleType;
  private collectTween: Phaser.Tweens.Tween | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: CollectibleConfig,
  ) {
    super(scene, x, y, config.textureKey);
    this.pointsValue = config.points;
    this.collectibleType = config.type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (this.body) {
      // Set a circular body for better overlap detection with Cinnamoroll
      (this.body as Phaser.Physics.Arcade.Body).setCircle(this.width / 2);
      // No need for isSensor, we'll use overlap checks
    }
    this.setOrigin(0.5, 0.5); // Ensure rotation is around the center
  }

  spawn(x: number, y: number, velocityX: number) {
    this.setPosition(x, y);
    this.setVelocityX(velocityX);
    this.setActive(true);
    this.setVisible(true);
    this.setScale(
      this.collectibleType === CollectibleType.CINNAMON_ROLL
        ? CINNAMON_ROLL_SCALE
        : 1,
    ); // Apply initial scale
    this.alpha = 1;
    if (this.body) {
      this.body.enable = true;
      // Re-apply body size if needed, esp. after scale changes in spawn
      if (this.collectibleType === CollectibleType.CINNAMON_ROLL) {
        this.scene.time.delayedCall(10, () => {
          // Ensure body updates after scale
          if (this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setCircle(this.displayWidth / 2);
          }
        });
      } else {
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
          this.body.setCircle(this.width / 2); // For non-scaled items
        }
      }
    }
    if (this.collectTween) {
      this.collectTween.stop();
      this.collectTween = null;
    }
  }

  collect() {
    if (!this.active) return; // Already being collected or inactive

    this.setActive(false); // Prevent further interactions immediately
    if (this.body) {
      this.body.enable = false;
    }
    this.setVelocity(0, 0);

    // Tween to shrink and fade out
    this.collectTween = this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: SHRINK_DURATION,
      ease: 'Power2',
      onComplete: () => {
        this.setVisible(false);
        this.setPosition(-1000, -1000); // Move off-screen effectively
        // For a true object pool, we'd emit an event or call a pool.release(this) here
        // For now, it just becomes invisible and inactive.
        // If not pooling, uncomment this.destroy();
        this.collectTween = null;
      },
    });
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.active) {
      // Only rotate if active
      this.rotation += ROTATION_SPEED * (delta / 16.66); // Adjust rotation based on delta for smoother animation
    }
    if (this.x < -this.displayWidth && this.active) {
      // Only collect if active
      this.collect();
    }
  }
}

// Specific Collectible Classes (can be in separate files later if they grow complex)

const CINNAMON_ROLL_SCALE = 0.4; // Scale to 40% (60% smaller)

export class CinnamonRoll extends Collectible {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'cinnamon_roll_img', // Use the actual image texture key
      points: 10,
      type: CollectibleType.CINNAMON_ROLL,
    });
    this.setScale(CINNAMON_ROLL_SCALE);

    // Adjust physics body after scaling
    // Wait for the body to be available
    this.scene.time.delayedCall(10, () => {
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        // Set the body to be a circle based on the scaled width
        // Note: this.width will give original texture width, so use displayWidth for scaled
        this.body.setCircle(this.displayWidth / 2);
      }
    });
  }
}

export class CoffeeCup extends Collectible {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'coffee_cup_placeholder',
      points: 5, // Example: Coffee is worth less or has different effect
      type: CollectibleType.COFFEE_CUP,
    });
  }
}

export class Star extends Collectible {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'star_placeholder',
      points: 25, // Example: Stars are worth more
      type: CollectibleType.STAR,
    });
  }
}
