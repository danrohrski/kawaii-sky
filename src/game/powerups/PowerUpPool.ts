import Phaser from 'phaser';
import {
  PowerUpItem,
  ShieldPowerUpItem,
  SpeedPowerUpItem,
  MagnetPowerUpItem,
} from './PowerUpItem';
import { PowerUpType } from '@/store/gameStore';

export class PowerUpPool extends Phaser.GameObjects.Group {
  constructor(scene: Phaser.Scene) {
    super(scene, {
      maxSize: 10, // Max total power-ups on screen
      runChildUpdate: true,
    });
  }

  spawnPowerUp(
    x: number,
    y: number,
    velocityX: number,
    type: PowerUpType,
  ): PowerUpItem | null {
    let powerUp: PowerUpItem | null = null;
    switch (type) {
      case PowerUpType.SHIELD:
        powerUp = new ShieldPowerUpItem(this.scene, x, y);
        break;
      case PowerUpType.SPEED:
        powerUp = new SpeedPowerUpItem(this.scene, x, y);
        break;
      case PowerUpType.MAGNET:
        powerUp = new MagnetPowerUpItem(this.scene, x, y);
        break;
      default:
        console.warn(`Unknown power-up type for spawning: ${type}`);
        return null;
    }

    if (powerUp) {
      this.add(powerUp, true);
      powerUp.spawn(x, y, velocityX);
    }
    return powerUp;
  }
}
