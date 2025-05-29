export enum ObstacleTypeKey {
  CLOUD_MONSTER = 'cloud_monster',
  // BOULDER = 'boulder', // For later
  // KITTEN = 'flying_kitten', // For later
}

// Define the actual enums here with string values
export enum CollectibleType {
  CINNAMON_ROLL = 'cinnamon_roll',
  COFFEE_CUP = 'coffee_cup',
  STAR = 'star',
}

export enum PowerUpType {
  SHIELD = 'shield',
  SPEED = 'speed',
  MAGNET = 'magnet',
}

export interface LevelConfig {
  levelName: string;
  scrollSpeedMultiplier: number;
  obstacleTypes: ObstacleTypeKey[];
  obstacleSpawnIntervalBase: number;
  collectibleTypes: CollectibleType[];
  collectibleSpawnIntervalBase: number;
  powerUpTypes: PowerUpType[];
  powerUpSpawnIntervalBase: number;
  skyColor: string;
  levelDuration?: number;
}
