import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore patterns (replaces .eslintignore)
  {
    ignores: [
      '.next/**/*',
      'out/**/*',
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
      '.env*',
      '.cache/**/*',
      '.turbo/**/*',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '.DS_Store',
      '.DS_Store?',
      '._*',
      '.Spotlight-V100',
      '.Trashes',
      'ehthumbs.db',
      'Thumbs.db',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
