import * as Phaser from 'phaser';
import { Obstacle } from './Obstacle';

const CLOUD_SCALE = 0.7; // Example scale for the cloud visual

export class CloudMonster extends Obstacle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'cloud_obstacle');
    this.setScale(CLOUD_SCALE);

    // Wait for the body to be available (it might be set slightly after super call)
    // Using a small delay or ADDED_TO_SCENE event to ensure body exists before manipulation
    this.scene.time.delayedCall(10, () => {
      // Small delay to ensure body is created
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        const texture = this.scene.textures.get('cloud_obstacle');
        if (texture.key !== '__MISSING') {
          // Check if texture is valid
          const sourceImage = texture.getSourceImage();
          const textureWidth = sourceImage.width;
          const textureHeight = sourceImage.height;

          if (textureWidth > 0 && textureHeight > 0) {
            const bodyWidth = textureWidth * CLOUD_SCALE * 0.8; // 80% of scaled visual width
            const bodyHeight = textureHeight * CLOUD_SCALE * 0.6; // 60% of scaled visual height
            this.body.setSize(bodyWidth, bodyHeight);
            // Center the body. For origin (0.5,0.5), setSize should handle this.
            // If origin is (0,0), offset might be needed:
            // const offsetX = (this.displayWidth - bodyWidth) / 2;
            // const offsetY = (this.displayHeight - bodyHeight) / 2;
            // this.body.setOffset(offsetX, offsetY);
          } else {
            console.warn(
              'Cloud_obstacle texture dimensions are invalid for body sizing.',
            );
          }
        } else {
          console.warn('Cloud_obstacle texture not found for body sizing.');
        }
      }
    });
  }
  // Override spawn or other methods if CloudMonster needs unique behavior
}

export class CloudMonsterPool extends Phaser.GameObjects.Group {
  constructor(scene: Phaser.Scene) {
    super(scene, {
      classType: CloudMonster,
      maxSize: 20,
      runChildUpdate: true,
    });
  }

  getMonster(x: number, y: number, velocityX: number): CloudMonster | null {
    const monster = this.getFirstDead(true, x, y) as CloudMonster | null;
    if (monster) {
      monster.spawn(x, y, velocityX);
    }
    return monster;
  }
}
