import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { formatTimeRemaining } from '@/lib/utils';

interface VoiceRecorderProps {
  maxDuration?: number; // in seconds
  onRecordingComplete: (uri: string) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

export function VoiceRecorder({
  maxDuration = 60,
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
}: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    checkPermissions();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const checkPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setPermissionGranted(status === 'granted');
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow microphone access to record voice notes.'
      );
    }
  };

  const startRecording = async () => {
    if (!permissionGranted) {
      await checkPermissions();
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setDuration(0);
      onRecordingStart?.();

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);
      onRecordingStop?.();

      if (uri) {
        onRecordingComplete(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
    }
  };

  const cancelRecording = async () => {
    if (!recording) return;

    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setDuration(0);
      onRecordingStop?.();
    } catch (err) {
      console.error('Failed to cancel recording:', err);
    }
  };

  const remainingTime = maxDuration - duration;
  const progress = duration / maxDuration;

  return (
    <View style={styles.container}>
      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text variant="h2" align="center">
          {formatTimeRemaining(isRecording ? remainingTime : maxDuration)}
        </Text>
        <Text variant="caption" color="muted" align="center">
          {isRecording ? 'Recording...' : 'Tap to record'}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` },
              progress > 0.8 && styles.progressWarning,
            ]}
          />
        </View>
      </View>

      {/* Record Button */}
      <View style={styles.buttonContainer}>
        {isRecording && (
          <TouchableOpacity
            onPress={cancelRecording}
            style={styles.cancelButton}
          >
            <Ionicons name="close" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        )}

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
          >
            <View
              style={[
                styles.recordButtonInner,
                isRecording && styles.recordButtonInnerActive,
              ]}
            />
          </TouchableOpacity>
        </Animated.View>

        {isRecording && (
          <TouchableOpacity
            onPress={stopRecording}
            style={styles.doneButton}
          >
            <Ionicons name="checkmark" size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Instructions */}
      <Text variant="bodySmall" color="muted" align="center" style={styles.instructions}>
        {isRecording
          ? 'Tap the checkmark when done, or X to cancel'
          : 'Introduce yourself! Share what makes you, you.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  timerContainer: {
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  progressBackground: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
  },
  progressWarning: {
    backgroundColor: Colors.warning,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    borderColor: Colors.primary[500],
  },
  recordButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[500],
  },
  recordButtonInnerActive: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  cancelButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    maxWidth: 280,
  },
});
