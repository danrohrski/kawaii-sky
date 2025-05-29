import Phaser from 'phaser';
import { PowerUpType } from '@/store/gameStore'; // Import from store for consistency

export interface PowerUpItemConfig {
  textureKey: string;
  type: PowerUpType;
  duration: number; // Duration this power-up lasts in milliseconds
}

const SHIELD_ITEM_SCALE = 0.125; // Reverted for 400x445 shield.png (target ~50-55px)
const MAGNET_ITEM_SCALE = 0.1; // Adjusted for large 400x408 magnet.png
const SPEED_ITEM_SCALE = 0.2; // Adjusted to 0.2

export class PowerUpItem extends Phaser.Physics.Arcade.Sprite {
  public powerUpType: PowerUpType;
  public duration: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: PowerUpItemConfig,
  ) {
    super(scene, x, y, config.textureKey);
    this.powerUpType = config.type;
    this.duration = config.duration;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.5);
    // Physics body circle will be set in the spawn method after scaling and texture is applied
  }

  determineScale(): number {
    switch (this.powerUpType) {
      case PowerUpType.SHIELD:
        return SHIELD_ITEM_SCALE;
      case PowerUpType.MAGNET:
        return MAGNET_ITEM_SCALE;
      case PowerUpType.SPEED:
        return SPEED_ITEM_SCALE; // Use new scale for Speed
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
    this.setScale(scaleToApply); // Apply visual scale first

    this.scene.time.delayedCall(10, () => {
      if (
        !this.active ||
        !this.body ||
        !(this.body instanceof Phaser.Physics.Arcade.Body)
      )
        return;

      // Now that setScale has been called and Phaser has had a moment to update,
      // this.displayWidth should reflect the visually scaled width.
      let diameter = this.displayWidth;

      if (diameter <= 0) {
        // Fallback if displayWidth is still not updated or texture is bad
        const texture = this.scene.textures.get(this.texture.key);
        if (texture && texture.key !== '__MISSING') {
          const sourceImage = texture.getSourceImage();
          if (sourceImage && sourceImage.width > 0) {
            diameter = sourceImage.width * scaleToApply;
          } else if (this.width > 0) {
            // Further fallback
            diameter = this.width * scaleToApply;
          }
        }
      }

      diameter = Math.max(2, diameter); // Ensure positive diameter

      this.body.setSize(diameter, diameter);
      this.body.setCircle(diameter / 2);
      this.body.enable = true;
    });
  }

  collect() {
    // Similar to collectibles, can have effects here
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.enable = false;
    }
    this.destroy(); // Or return to pool
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    // Example: Add slow rotation to power-ups too
    // if (this.active) { this.rotation += 0.01 * (delta/16.66); }
    if (this.x < -this.displayWidth) {
      this.collect();
    }
  }
}

// Specific PowerUp Item Classes
const DEFAULT_POWERUP_DURATION = 10000; // 10 seconds default

export class ShieldPowerUpItem extends PowerUpItem {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'shield_item_img',
      type: PowerUpType.SHIELD,
      duration: DEFAULT_POWERUP_DURATION,
    });
  }
}

export class SpeedPowerUpItem extends PowerUpItem {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'speed_shoe_img', // Use the new speed shoe image
      type: PowerUpType.SPEED,
      duration: 7000,
    });
  }
}

export class MagnetPowerUpItem extends PowerUpItem {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'magnet_item_img',
      type: PowerUpType.MAGNET,
      duration: 8000, // 8 seconds for magnet
    });
  }
}
