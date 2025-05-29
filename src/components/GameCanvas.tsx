import 'phaser';
import { useEffect, useRef } from 'react';
import { PreloaderScene } from '@/game/scenes/PreloaderScene';
import { MainMenuScene } from '@/game/scenes/MainMenuScene';
import { PlayScene } from '@/game/scenes/PlayScene';

const GameCanvas = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      gameContainerRef.current &&
      !gameInstanceRef.current
    ) {
      // Ensure Phaser is only initialized on the client side
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameContainerRef.current, // Attach Phaser to the ref
        width: 800,
        height: 600,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 }, // Global gravity, can be overridden per object
            debug: true, // Set to true for physics debugging visuals
          },
        },
        scene: [PreloaderScene, MainMenuScene, PlayScene], // Add all scenes here
      };

      gameInstanceRef.current = new Phaser.Game(config);
      // Phaser game instance will automatically start with the first scene in the array (PreloaderScene)
    }

    return () => {
      // Cleanup Phaser instance on component unmount
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={gameContainerRef} id="phaser-game-container" />;
};

export default GameCanvas;
