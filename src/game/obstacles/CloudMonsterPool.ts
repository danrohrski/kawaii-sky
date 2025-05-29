import Phaser from 'phaser';
import { Obstacle } from './Obstacle';

export class CloudMonster extends Obstacle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'cloud_monster_placeholder');
    // Specific properties or methods for CloudMonster can be added here
    // For example, different scaling or a slight tint if needed:
    // this.setScale(0.8);
  }

  // Override spawn or other methods if CloudMonster needs unique behavior
}

export class CloudMonsterPool extends Phaser.GameObjects.Group {
  constructor(scene: Phaser.Scene) {
    super(scene, {
      classType: CloudMonster,
      maxSize: 20, // Adjust as needed - max number of monsters in the pool
      runChildUpdate: true, // Ensures preUpdate on children (Obstacle) is called
    });
  }

  getMonster(x: number, y: number, velocityX: number): CloudMonster | null {
    const monster = this.getFirstDead(true, x, y) as CloudMonster | null;
    // The getFirstDead(true, ...) will create a new one if pool is empty and maxSize not reached.
    // It also calls the constructor of CloudMonster.

    if (monster) {
      monster.spawn(x, y, velocityX);
    }
    return monster;
  }
}
