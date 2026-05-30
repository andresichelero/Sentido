import { useAppStore } from '../../stores/useAppStore';

let Audio: any = null;
let InterruptionModeIOS: any = null;
let InterruptionModeAndroid: any = null;

try {
  const expoAv = require('expo-av');
  Audio = expoAv.Audio;
  InterruptionModeIOS = expoAv.InterruptionModeIOS;
  InterruptionModeAndroid = expoAv.InterruptionModeAndroid;
} catch (e) {
  // Silent catch: native module might not be available
}

export type AudioPlaybackStatus = {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
};

export type StatusUpdateCallback = (status: AudioPlaybackStatus) => void;

class AudioPlayerService {
  private sound: any = null;
  private onStatusUpdate: StatusUpdateCallback | null = null;
  public currentAssetId: any = null;

  constructor() {
    this.initMode();
  }

  private async initMode() {
    if (!Audio) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      console.warn('Failed to set audio mode', e);
    }
  }

  async loadAndPlay(assetId: any, onStatusUpdate?: StatusUpdateCallback) {
    const { audioEnabled } = useAppStore.getState();
    if (!audioEnabled || !Audio) return;

    try {
      // Unload previous if playing something else
      if (this.currentAssetId !== assetId) {
        await this.unload();
      } else if (this.sound) {
        // If it's the same asset, just play it
        await this.sound.playAsync();
        return;
      }

      this.currentAssetId = assetId;
      this.onStatusUpdate = onStatusUpdate || null;

      const { sound } = await Audio.Sound.createAsync(
        assetId,
        { shouldPlay: true },
        this.handlePlaybackStatusUpdate
      );
      this.sound = sound;
    } catch (e) {
      console.error('Failed to load audio', e);
    }
  }

  async play() {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async seek(positionMillis: number) {
    if (this.sound) {
      await this.sound.setPositionAsync(positionMillis);
    }
  }

  async unload() {
    if (this.sound) {
      this.sound.setOnPlaybackStatusUpdate(null);
      await this.sound.unloadAsync();
      this.sound = null;
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

  private handlePlaybackStatusUpdate = (status: any) => {
    if (this.onStatusUpdate) {
      if (status.isLoaded) {
        this.onStatusUpdate({
          isLoaded: true,
          isPlaying: status.isPlaying,
          positionMillis: status.positionMillis,
          durationMillis: status.durationMillis || 0,
        });

        // Auto pause when finished
        if (status.didJustFinish) {
          this.sound?.setPositionAsync(0);
          this.sound?.pauseAsync();
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
