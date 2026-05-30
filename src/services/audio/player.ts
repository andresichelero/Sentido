import { useAppStore } from '../../stores/useAppStore';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer, AudioStatus } from 'expo-audio';

export type AudioPlaybackStatus = {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
};

export type StatusUpdateCallback = (status: AudioPlaybackStatus) => void;

class AudioPlayerService {
  private player: AudioPlayer | null = null;
  private onStatusUpdate: StatusUpdateCallback | null = null;
  public currentAssetId: any = null;
  private statusSubscription: any = null;

  constructor() {
    this.initMode();
  }

  private async initMode() {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'doNotMix',
      });
    } catch (e) {
      console.warn('Failed to set audio mode', e);
    }
  }

  async loadAndPlay(assetId: any, onStatusUpdate?: StatusUpdateCallback) {
    const { audioEnabled } = useAppStore.getState();
    if (!audioEnabled) return;

    try {
      if (this.currentAssetId !== assetId) {
        await this.unload();
      } else if (this.player) {
        this.player.play();
        return;
      }

      this.currentAssetId = assetId;
      this.onStatusUpdate = onStatusUpdate || null;

      this.player = createAudioPlayer(assetId);
      
      this.statusSubscription = this.player.addListener('playbackStatusUpdate', this.handlePlaybackStatusUpdate);
      this.player.play();
      
    } catch (e) {
      console.error('Failed to load audio', e);
    }
  }

  async play() {
    if (this.player) {
      this.player.play();
    }
  }

  async pause() {
    if (this.player) {
      this.player.pause();
    }
  }

  async seek(positionMillis: number) {
    if (this.player) {
      // expo-audio uses seconds, expo-av used milliseconds
      await this.player.seekTo(positionMillis / 1000);
    }
  }

  async unload() {
    if (this.statusSubscription) {
      this.statusSubscription.remove();
      this.statusSubscription = null;
    }
    if (this.player) {
      this.player.remove();
      this.player = null;
    }
    this.currentAssetId = null;
    if (this.onStatusUpdate) {
      this.onStatusUpdate({
        isLoaded: false,
        isPlaying: false,
        positionMillis: 0,
        durationMillis: 0,
      });
    }
    this.onStatusUpdate = null;
  }
  
  updateCallback(callback: StatusUpdateCallback | null) {
    this.onStatusUpdate = callback;
  }

  private handlePlaybackStatusUpdate = (status: AudioStatus) => {
    if (this.onStatusUpdate) {
      if (status.status === 'ready' || status.status === 'playing' || status.status === 'paused') {
        this.onStatusUpdate({
          isLoaded: true,
          isPlaying: status.playing,
          // Convert seconds to milliseconds to keep backwards compatibility with expo-av components
          positionMillis: status.currentTime * 1000,
          durationMillis: status.duration * 1000,
        });

        // Auto pause when finished
        if (status.currentTime > 0 && status.duration > 0 && status.currentTime >= status.duration) {
          this.player?.seekTo(0);
          this.player?.pause();
        }
      } else {
        this.onStatusUpdate({
          isLoaded: false,
          isPlaying: false,
          positionMillis: 0,
          durationMillis: 0,
        });
      }
    }
  };
}

export const audioPlayerService = new AudioPlayerService();

