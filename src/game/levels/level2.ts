import {
  LevelConfig,
  ObstacleTypeKey,
  CollectibleType,
  PowerUpType,
} from './levelTypes';

export const level2Config: LevelConfig = {
  levelName: 'Cinnamon Forest',
  scrollSpeedMultiplier: 1.2,

  // Level 2: Only flying kittens
  obstacleTypes: [ObstacleTypeKey.FLYING_KITTEN],
  obstacleSpawnIntervalBase: 1800, // Slightly faster obstacles

  collectibleTypes: [
    CollectibleType.CINNAMON_ROLL,
    CollectibleType.COFFEE_CUP,
    CollectibleType.STAR,
  ],
  collectibleSpawnIntervalBase: 2800,

  powerUpTypes: [PowerUpType.SHIELD, PowerUpType.SPEED, PowerUpType.MAGNET],
  powerUpSpawnIntervalBase: 7000, // More frequent power-ups

  skyColor: '#E67E80', // Warm coral dusk tone
  backgroundImage: 'forest_bg', // Forest background for level 2
  targetScoreToAdvance: 250, // Need 250 points to advance to level 3
};
