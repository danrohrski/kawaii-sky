import * as Phaser from 'phaser';
import { Obstacle } from './Obstacle';

const BOULDER_SCALE = 0.56; // Boulders 30% smaller (0.8 * 0.7 = 0.56)

export class Boulder extends Obstacle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boulder_obstacle');
    this.setScale(BOULDER_SCALE);

    // Wait for the body to be available
    this.scene.time.delayedCall(10, () => {
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        const texture = this.scene.textures.get('boulder_obstacle');
        if (texture.key !== '__MISSING') {
          const sourceImage = texture.getSourceImage();
          const textureWidth = sourceImage.width;
          const textureHeight = sourceImage.height;

          if (textureWidth > 0 && textureHeight > 0) {
            const bodyWidth = textureWidth * BOULDER_SCALE * 0.9; // 90% of scaled visual width (solid boulder)
            const bodyHeight = textureHeight * BOULDER_SCALE * 0.9; // 90% of scaled visual height
            this.body.setSize(bodyWidth, bodyHeight);
          } else {
            console.warn(
              'Boulder_obstacle texture dimensions are invalid for body sizing.',
            );
          }
        } else {
          console.warn('Boulder_obstacle texture not found for body sizing.');
        }
      }
    });
  }

  // Override spawn to add spinning animation
  spawn(x: number, y: number, velocityX: number): void {
    super.spawn(x, y, velocityX);

    // Add slow spinning animation
    this.scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2, // Full 360 degree rotation
      duration: 3000, // 3 seconds for a full rotation
      repeat: -1, // Infinite repeat
      ease: 'Linear', // Smooth, constant rotation
    });
  }
}

export class BoulderPool extends Phaser.GameObjects.Group {
  constructor(scene: Phaser.Scene) {
    super(scene, {
      classType: Boulder,
      maxSize: 15,
      runChildUpdate: true,
    });
  }

  getBoulder(x: number, y: number, velocityX: number): Boulder | null {
    const boulder = this.getFirstDead(true, x, y) as Boulder | null;
    if (boulder) {
      boulder.spawn(x, y, velocityX);
    }
    return boulder;
  }
}
