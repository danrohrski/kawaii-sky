import { level1Config } from './level1';
import { level2Config } from './level2';
import { level3Config } from './level3';
import { LevelConfig } from './levelTypes';

export const TOTAL_LEVELS = 3;

export const levelConfigs: LevelConfig[] = [
  level1Config, // Level 1 (index 0)
  level2Config, // Level 2 (index 1)
  level3Config, // Level 3 (index 2)
];

export function getLevelConfig(levelIndex: number): LevelConfig | null {
  if (levelIndex < 0 || levelIndex >= levelConfigs.length) {
    return null;
  }
  return levelConfigs[levelIndex];
}

export * from './level1';
export * from './level2';
export * from './level3';
export * from './levelTypes';
