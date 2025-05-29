import Phaser from 'phaser';
import { CollectibleType } from '@/game/levels/levelTypes'; // Ensure this is the only source

export interface CollectibleConfig {
  textureKey: string;
  points: number;
  type: CollectibleType; // Should use the imported enum
}

const ROTATION_SPEED = 0.01; // Radians per frame for slow rotation
const SHRINK_DURATION = 200; // Milliseconds to shrink when collected
const CINNAMON_ROLL_SCALE = 0.4;
const COFFEE_BOBA_SCALE = 0.2; // New scale for Coffee Boba
const CROISSANT_STAR_SCALE = 0.12; // Adjusted to 0.12

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  public pointsValue: number;
  public collectibleType: CollectibleType; // This must use the imported enum
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

    this.setOrigin(0.5, 0.5);
    // Physics body circle will be set in the spawn method after scaling and texture is applied
  }

  determineScale(): number {
    switch (this.collectibleType) {
      case CollectibleType.CINNAMON_ROLL:
        return CINNAMON_ROLL_SCALE;
      case CollectibleType.COFFEE_CUP:
        return COFFEE_BOBA_SCALE;
      case CollectibleType.STAR:
        return CROISSANT_STAR_SCALE; // Use new scale for Star
      default:
        return 1.0;
    }
  }

  spawn(x: number, y: number, velocityX: number) {
    this.setPosition(x, y);
    this.setVelocityX(velocityX);
    this.setActive(true);
    this.setVisible(true);
    this.alpha = 1;

    const scaleToApply = this.determineScale();
    this.setScale(scaleToApply);

    if (this.collectTween) {
      this.collectTween.stop();
      this.collectTween = null;
    }

    this.scene.time.delayedCall(10, () => {
      // Slightly longer delay to be safer
      if (
        !this.active ||
        !this.body ||
        !(this.body instanceof Phaser.Physics.Arcade.Body)
      )
        return;

      const texture = this.scene.textures.get(this.texture.key);
      let diameter = this.displayWidth; // Default/fallback diameter

      if (texture && texture.key !== '__MISSING') {
        const sourceImage = texture.getSourceImage();
        if (sourceImage && sourceImage.width > 0) {
          const originalWidth = sourceImage.width; // Assuming texture is roughly square/circular
          diameter = originalWidth * scaleToApply;
        } else if (this.width > 0) {
          // Fallback for placeholders from graphics
          diameter = this.width * scaleToApply;
        }
      }
      diameter = Math.max(2, diameter); // Ensure diameter is at least 2 (radius 1)

      this.body.setSize(diameter, diameter); // Set body to a square of the scaled diameter
      this.body.setCircle(diameter / 2); // Make this square body behave as a circle
      // No explicit setOffset, as setSize on a body attached to a sprite with (0.5,0.5) origin should center it.

      this.body.enable = true;
    });
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
      textureKey: 'croissant_star_img', // Use the croissant image texture key
      points: 25,
      type: CollectibleType.STAR,
    });
  }
}
