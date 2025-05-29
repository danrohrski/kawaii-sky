import Phaser from 'phaser';
import { Collectible, CinnamonRoll, CoffeeCup, Star } from './Collectible';
import { CollectibleType } from '@/game/levels/levelTypes';

export class CollectiblePool extends Phaser.GameObjects.Group {
  constructor(scene: Phaser.Scene) {
    super(scene, {
      // We don't set a default classType here, as we'll create specific types
      maxSize: 30, // Max total collectibles of all types
      runChildUpdate: true,
    });
  }

  // Spawn a collectible of a specific type
  spawnCollectible(
    x: number,
    y: number,
    velocityX: number,
    type: CollectibleType,
  ): Collectible | null {
    let collectible: Collectible | null = null;

    // Try to get an inactive collectible of the correct type first (more advanced pooling)
    // For simplicity now, we'll just create new ones and rely on Group#getFirstDead if we add classType to options later
    // Or, manage separate internal pools/arrays if strict typing is needed for getFirstDead.

    // Simple approach: create new instance based on type
    switch (type) {
      case CollectibleType.CINNAMON_ROLL:
        collectible = new CinnamonRoll(this.scene, x, y);
        break;
      case CollectibleType.COFFEE_CUP:
        collectible = new CoffeeCup(this.scene, x, y);
        break;
      case CollectibleType.STAR:
        collectible = new Star(this.scene, x, y);
        break;
      default:
        console.warn(`Unknown collectible type: ${type}`);
        return null;
    }

    if (collectible) {
      this.add(collectible, true); // Add to this group and run scene.add.existing
      collectible.spawn(x, y, velocityX);
    }
    return collectible;
  }

  // Method to get an inactive collectible - can be refined for true pooling later
  // For now, collectibles handle their own deactivation by moving off-screen
  // and get destroyed if they go off the left edge, so the group might shrink.
  // A true object pool would recycle them.
}
