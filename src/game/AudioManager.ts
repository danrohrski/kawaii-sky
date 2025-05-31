import * as Phaser from 'phaser';

export class AudioManager {
  private static instance: AudioManager;
  private backgroundMusic?: Phaser.Sound.BaseSound;
  private currentScene?: Phaser.Scene;
  private musicVolume = 0.15; // Default volume for background music (subtle background level)
  private isMusicEnabled = true;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public setCurrentScene(scene: Phaser.Scene): void {
    this.currentScene = scene;
  }

  public startBackgroundMusic(): void {
    if (!this.currentScene || !this.isMusicEnabled) {
      return;
    }

    try {
      // Stop existing music if playing
      this.stopBackgroundMusic();

      // Check if the audio is loaded
      if (
        this.currentScene.sound &&
        this.currentScene.cache.audio.exists('theme_music')
      ) {
        this.backgroundMusic = this.currentScene.sound.add('theme_music', {
          volume: this.musicVolume,
          loop: true,
        });

        this.backgroundMusic.play();
        console.log('Background music started');
      } else {
        console.warn('theme_music not loaded or sound system not available');
      }
    } catch (error) {
      console.warn('Failed to start background music:', error);
    }
  }

  public stopBackgroundMusic(): void {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.stop();
      this.backgroundMusic.destroy();
      this.backgroundMusic = undefined;
      console.log('Background music stopped');
    }
  }

  public pauseBackgroundMusic(): void {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.pause();
    }
  }

  public resumeBackgroundMusic(): void {
    if (this.backgroundMusic && this.backgroundMusic.isPaused) {
      this.backgroundMusic.resume();
    }
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    if (this.backgroundMusic) {
      // Cast to WebAudioSound or HTML5AudioSound which have volume property
      (
        this.backgroundMusic as
          | Phaser.Sound.WebAudioSound
          | Phaser.Sound.HTML5AudioSound
      ).volume = this.musicVolume;
    }
  }

  public toggleMusic(): boolean {
    this.isMusicEnabled = !this.isMusicEnabled;

    if (this.isMusicEnabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }

    return this.isMusicEnabled;
  }

  public isMusicPlaying(): boolean {
    return this.backgroundMusic?.isPlaying || false;
  }

  public isMusicMuted(): boolean {
    return !this.isMusicEnabled;
  }

  // Clean up when switching scenes
  public cleanup(): void {
    this.stopBackgroundMusic();
  }
}
