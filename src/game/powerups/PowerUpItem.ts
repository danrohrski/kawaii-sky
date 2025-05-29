import Phaser from 'phaser';
import { PowerUpType } from '@/store/gameStore'; // Import from store for consistency

export interface PowerUpItemConfig {
  textureKey: string;
  type: PowerUpType;
  duration: number; // Duration this power-up lasts in milliseconds
}

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
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setCircle(this.width / 2); // Assuming circular for now
      // Power-ups are also sensors for overlap
    }
    this.setOrigin(0.5, 0.5); // For rotation if we add it
  }

  spawn(x: number, y: number, velocityX: number) {
    this.setPosition(x, y);
    this.setVelocityX(velocityX);
    this.setActive(true);
    this.setVisible(true);
    this.setScale(1); // Default scale, can be overridden in specific power-up classes
    this.alpha = 1;
    if (this.body) {
      this.body.enable = true;
    }
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
      textureKey: 'shield_powerup_placeholder',
      type: PowerUpType.SHIELD,
      duration: DEFAULT_POWERUP_DURATION,
    });
  }
}

export class SpeedPowerUpItem extends PowerUpItem {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'speed_powerup_placeholder',
      type: PowerUpType.SPEED,
      duration: 7000, // 7 seconds for speed
    });
  }
}

export class MagnetPowerUpItem extends PowerUpItem {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'magnet_powerup_placeholder',
      type: PowerUpType.MAGNET,
      duration: 8000, // 8 seconds for magnet
    });
  }
}
