import * as Phaser from 'phaser';
import { Obstacle } from './Obstacle';

const KITTEN_SCALE = 0.3; // Flying kittens are smaller but more agile - reduced to 50% size

export class FlyingKitten extends Obstacle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'flying_kitten_obstacle');
    this.setScale(KITTEN_SCALE);

    // Wait for the body to be available
    this.scene.time.delayedCall(10, () => {
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        const texture = this.scene.textures.get('flying_kitten_obstacle');
        if (texture.key !== '__MISSING') {
          const sourceImage = texture.getSourceImage();
          const textureWidth = sourceImage.width;
          const textureHeight = sourceImage.height;

          if (textureWidth > 0 && textureHeight > 0) {
            const bodyWidth = textureWidth * KITTEN_SCALE * 1.0; // 100% of scaled visual width (increased collision area)
            const bodyHeight = textureHeight * KITTEN_SCALE * 1.0; // 100% of scaled visual height (increased collision area)
            this.body.setSize(bodyWidth, bodyHeight);
          } else {
            console.warn(
              'Flying_kitten_obstacle texture dimensions are invalid for body sizing.',
            );
          }
        } else {
          console.warn(
            'Flying_kitten_obstacle texture not found for body sizing.',
          );
        }
      }
    });
  }

  // Flying kittens could have a subtle vertical movement pattern
  spawn(x: number, y: number, velocityX: number): void {
    super.spawn(x, y, velocityX);

    // Add a subtle sine wave movement for more dynamic behavior
    this.scene.time.delayedCall(100, () => {
      if (this.active && this.body) {
        const startY = y;
        const amplitude = 15; // 15 pixel vertical movement (reduced for smaller cats)

        this.scene.tweens.add({
          targets: this,
          y: { value: startY + amplitude, ease: 'Sine.easeInOut' },
          duration: 1500,
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }
}

export class FlyingKittenPool extends Phaser.GameObjects.Group {
  constructor(scene: Phaser.Scene) {
    super(scene, {
      classType: FlyingKitten,
      maxSize: 18,
      runChildUpdate: true,
    });
  }

  getKitten(x: number, y: number, velocityX: number): FlyingKitten | null {
    const kitten = this.getFirstDead(true, x, y) as FlyingKitten | null;
    if (kitten) {
      kitten.spawn(x, y, velocityX);
    }
    return kitten;
  }
}
