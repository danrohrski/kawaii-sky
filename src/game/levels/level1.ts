import {
  LevelConfig,
  ObstacleTypeKey,
  CollectibleType,
  PowerUpType,
} from './levelTypes';

export const level1Config: LevelConfig = {
  levelName: 'Sky Village',
  scrollSpeedMultiplier: 1.0,

  // Level 1: Only clouds
  obstacleTypes: [ObstacleTypeKey.CLOUD_MONSTER],
  obstacleSpawnIntervalBase: 2000, // 2 seconds between obstacles

  collectibleTypes: [
    CollectibleType.CINNAMON_ROLL,
    CollectibleType.COFFEE_CUP,
    CollectibleType.STAR,
  ],
  collectibleSpawnIntervalBase: 3000, // 3 seconds between collectibles

  powerUpTypes: [PowerUpType.SHIELD, PowerUpType.SPEED],
  powerUpSpawnIntervalBase: 8000, // 8 seconds between power-ups

  skyColor: '#DCE9FF', // Light sky blue
  backgroundImage: 'mountains_bg', // Mountains background for level 1
  targetScoreToAdvance: 100, // Need 100 points to advance to level 2
};
