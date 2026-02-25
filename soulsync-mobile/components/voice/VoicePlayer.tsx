import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { Colors, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { formatTimeRemaining } from '@/lib/utils';

interface VoicePlayerProps {
  uri: string;
  showDuration?: boolean;
  compact?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export function VoicePlayer({
  uri,
  showDuration = true,
  compact = false,
  onPlayStart,
  onPlayEnd,
}: VoicePlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [uri]);

  useEffect(() => {
    if (duration > 0) {
      Animated.timing(progressAnim, {
        toValue: position / duration,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [position, duration, progressAnim]);

  const loadSound = async () => {
    try {
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);

      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setIsLoaded(true);
      }
    } catch (err) {
      console.error('Failed to load sound:', err);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setPosition(status.positionMillis);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
      onPlayEnd?.();
    }
  };

  const togglePlayback = async () => {
    if (!sound || !isLoaded) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        if (position >= duration) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
        onPlayStart?.();
      }
    } catch (err) {
      console.error('Failed to toggle playback:', err);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return formatTimeRemaining(seconds);
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={togglePlayback}
        style={styles.compactContainer}
        disabled={!isLoaded}
      >
        <View style={styles.compactButton}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color={Colors.primary[500]}
          />
        </View>
        {showDuration && (
          <Text variant="caption" color="muted">
            {formatTime(duration)}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Play Button */}
      <TouchableOpacity
        onPress={togglePlayback}
        style={styles.playButton}
        disabled={!isLoaded}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Progress and Time */}
      <View style={styles.progressSection}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Time Display */}
        {showDuration && (
          <View style={styles.timeContainer}>
            <Text variant="caption" color="muted">
              {formatTime(position)}
            </Text>
            <Text variant="caption" color="muted">
              {formatTime(duration)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    ...Shadow.sm,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  progressContainer: {
    marginBottom: Spacing.xs,
  },
  progressBackground: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  compactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
