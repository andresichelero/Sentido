import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Typography } from '../ui/Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { audioPlayerService, type AudioPlaybackStatus } from '../../services/audio/player';
import { useAppStore } from '../../stores/useAppStore';

interface AudioPlayerProps {
  assetId: any;
  accentColor: string;
}

function formatTime(millis: number) {
  const totalSeconds = Math.floor(millis / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function AudioPlayer({ assetId, accentColor }: AudioPlayerProps) {
  const colors = useThemeColors();
  const audioEnabled = useAppStore((s) => s.audioEnabled);
  
  const [status, setStatus] = useState<AudioPlaybackStatus>({
    isLoaded: false,
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
  });

  // Track if user is sliding to prevent jumping back to old position from updates
  const [isSliding, setIsSliding] = useState(false);
  const [slidePosition, setSlidePosition] = useState(0);

  useEffect(() => {
    if (!audioEnabled) return;
    
    // Subscribe to status updates from the singleton
    audioPlayerService.updateCallback((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      // Don't unload here, EmotionSheet might just be re-rendering
      // We will handle unload inside EmotionSheet's close, or when asset changes
    };
  }, [audioEnabled]);

  const togglePlay = async () => {
    if (!audioEnabled) return;

    if (status.isPlaying) {
      await audioPlayerService.pause();
    } else {
      if (!status.isLoaded) {
        // Load and play
        await audioPlayerService.loadAndPlay(assetId, setStatus);
      } else {
        // Just play if already loaded
        await audioPlayerService.play();
      }
    }
  };

  const handleSlidingStart = () => {
    setIsSliding(true);
  };

  const handleSlidingComplete = async (value: number) => {
    if (status.isLoaded) {
      await audioPlayerService.seek(value);
    }
    setIsSliding(false);
  };

  if (!audioEnabled) {
    return (
      <View style={[styles.container, { borderColor: colors.borderDefault }]}>
        <Feather name="volume-x" size={20} color={colors.textDisabled} />
        <Typography variant="body-sm" color={colors.textDisabled} style={styles.disabledText}>
          Áudio desativado nas configurações
        </Typography>
      </View>
    );
  }

  const currentMillis = isSliding ? slidePosition : status.positionMillis;
  const progress = status.durationMillis > 0 ? currentMillis / status.durationMillis : 0;

  return (
    <View style={[styles.container, { borderColor: accentColor + '40', backgroundColor: accentColor + '10' }]}>
      <Pressable 
        onPress={togglePlay} 
        style={[styles.playButton, { backgroundColor: accentColor }]}
      >
        <Feather name={status.isPlaying ? 'pause' : 'play'} size={18} color="#FFFFFF" style={{ marginLeft: status.isPlaying ? 0 : 2 }} />
      </Pressable>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={status.durationMillis || 1}
          value={currentMillis}
          onSlidingStart={handleSlidingStart}
          onValueChange={setSlidePosition}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={accentColor}
          maximumTrackTintColor={colors.surface3}
          thumbTintColor={accentColor}
          disabled={!status.isLoaded && status.durationMillis === 0}
        />
        <View style={styles.timeRow}>
          <Typography variant="label-sm" color={colors.textSecondary}>
            {formatTime(currentMillis)}
          </Typography>
          <Typography variant="label-sm" color={colors.textSecondary}>
            {formatTime(status.durationMillis)}
          </Typography>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  slider: {
    height: 30,
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  disabledText: {
    flex: 1,
  }
});
