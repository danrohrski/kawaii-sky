import {
  LevelConfig,
  ObstacleTypeKey,
  CollectibleType,
  PowerUpType,
} from './levelTypes';

export const level3Config: LevelConfig = {
  levelName: 'Sugar Mountains',
  scrollSpeedMultiplier: 1.4,

  // Level 3: All three obstacles - the ultimate challenge!
  obstacleTypes: [
    ObstacleTypeKey.CLOUD_MONSTER,
    ObstacleTypeKey.FLYING_KITTEN,
    ObstacleTypeKey.BOULDER,
  ],
  obstacleSpawnIntervalBase: 1500, // Fastest obstacle spawning

  collectibleTypes: [
    CollectibleType.CINNAMON_ROLL,
    CollectibleType.COFFEE_CUP,
    CollectibleType.STAR,
  ],
  collectibleSpawnIntervalBase: 2500,

  powerUpTypes: [PowerUpType.SHIELD, PowerUpType.SPEED, PowerUpType.MAGNET],
  powerUpSpawnIntervalBase: 6000, // Most frequent power-ups to help with difficulty

  skyColor: '#0A0F1F', // Much darker night sky - deep midnight blue
  backgroundImage: 'planet_bg', // Planet background for level 3 - perfect for night theme!
  targetScoreToAdvance: 500, // Need 500 points to win the game!
};
