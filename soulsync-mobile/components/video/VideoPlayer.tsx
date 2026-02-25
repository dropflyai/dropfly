import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { formatTimeRemaining } from '@/lib/utils';

interface VideoPlayerProps {
  uri: string;
  aspectRatio?: number;
  autoPlay?: boolean;
  showControls?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export function VideoPlayer({
  uri,
  aspectRatio = 3 / 4,
  autoPlay = false,
  showControls = true,
  onPlayStart,
  onPlayEnd,
}: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setIsLoaded(true);
    setDuration(status.durationMillis || 0);
    setPosition(status.positionMillis);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      setIsPlaying(false);
      setShowPlayButton(true);
      onPlayEnd?.();
    }
  };

  const togglePlayback = async () => {
    if (!videoRef.current || !isLoaded) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
      setShowPlayButton(true);
    } else {
      if (position >= duration - 100) {
        await videoRef.current.setPositionAsync(0);
      }
      await videoRef.current.playAsync();
      setShowPlayButton(false);
      onPlayStart?.();
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return formatTimeRemaining(seconds);
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={togglePlayback}
        style={[styles.videoContainer, { aspectRatio }]}
      >
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={autoPlay}
          isLooping={false}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />

        {/* Play Button Overlay */}
        {showPlayButton && (
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color="#fff" />
            </View>
          </View>
        )}

        {/* Progress Bar */}
        {showControls && isLoaded && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
        )}
      </TouchableOpacity>

      {/* Time Display */}
      {showControls && isLoaded && (
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
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  videoContainer: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.neutral[900],
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4, // Optical centering for play icon
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary[500],
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
});
