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
const CINNAMON_ROLL_SCALE = 0.4;
const COFFEE_BOBA_SCALE = 0.2; // New scale for Coffee Boba

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

    let newScale = 1;
    if (this.collectibleType === CollectibleType.CINNAMON_ROLL) {
      newScale = CINNAMON_ROLL_SCALE;
    } else if (this.collectibleType === CollectibleType.COFFEE_CUP) {
      newScale = COFFEE_BOBA_SCALE;
    }
    this.setScale(newScale);
    this.alpha = 1;

    if (this.body) {
      this.body.enable = true;
      this.scene.time.delayedCall(10, () => {
        // Ensure body updates after scale
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
          this.body.setCircle(this.displayWidth / 2);
        }
      });
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

export class CinnamonRoll extends Collectible {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'cinnamon_roll_img',
      points: 10,
      type: CollectibleType.CINNAMON_ROLL,
    });
    // Initial scaling now handled in base Collectible#spawn
  }
}

export class CoffeeCup extends Collectible {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'coffee_boba_img', // Use the new texture key
      points: 5,
      type: CollectibleType.COFFEE_CUP,
    });
    // Initial scaling now handled in base Collectible#spawn
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
