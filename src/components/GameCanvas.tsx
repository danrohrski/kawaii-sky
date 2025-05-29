import 'phaser';
import { useEffect, useRef } from 'react';

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
        scene: {
          create: function (this: Phaser.Scene) {
            // Simple blue background placeholder
            this.cameras.main.setBackgroundColor('#AEC6CF'); // Using our pastel-blue
          },
        },
      };

      gameInstanceRef.current = new Phaser.Game(config);
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
