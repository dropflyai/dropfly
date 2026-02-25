import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { formatTimeRemaining } from '@/lib/utils';

interface VideoRecorderProps {
  maxDuration?: number; // in seconds
  onRecordingComplete: (uri: string) => void;
  onCancel?: () => void;
}

export function VideoRecorder({
  maxDuration = 60,
  onRecordingComplete,
  onCancel,
}: VideoRecorderProps) {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('front');
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const requestPermissions = async () => {
    const camera = await requestCameraPermission();
    const mic = await requestMicPermission();
    return camera.granted && mic.granted;
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      const video = await cameraRef.current.recordAsync({
        maxDuration,
      });

      if (video?.uri) {
        onRecordingComplete(video.uri);
      }
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // Check permissions
  if (!cameraPermission || !micPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text variant="body" color="secondary" align="center">
          Loading camera...
        </Text>
      </View>
    );
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="videocam-off" size={48} color={Colors.neutral[400]} />
        <Text variant="body" color="secondary" align="center" style={styles.permissionText}>
          Camera and microphone access are required to record video.
        </Text>
        <TouchableOpacity onPress={requestPermissions} style={styles.permissionButton}>
          <Text variant="body" style={styles.permissionButtonText}>
            Grant Access
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const remainingTime = maxDuration - duration;
  const progress = duration / maxDuration;

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          mode="video"
        >
          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Timer */}
            <View style={styles.timerContainer}>
              <View style={[styles.recordingDot, isRecording && styles.recordingDotActive]} />
              <Text variant="h4" style={styles.timerText}>
                {formatTimeRemaining(remainingTime)}
              </Text>
            </View>

            {/* Progress Bar */}
            {isRecording && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
              </View>
            )}
          </View>
        </CameraView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Cancel Button */}
        <TouchableOpacity
          onPress={onCancel}
          style={styles.sideButton}
          disabled={isRecording}
        >
          <Ionicons
            name="close"
            size={28}
            color={isRecording ? Colors.neutral[400] : Colors.text.primary}
          />
        </TouchableOpacity>

        {/* Record Button */}
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
        >
          <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerActive]} />
        </TouchableOpacity>

        {/* Flip Camera Button */}
        <TouchableOpacity
          onPress={toggleCameraFacing}
          style={styles.sideButton}
          disabled={isRecording}
        >
          <Ionicons
            name="camera-reverse"
            size={28}
            color={isRecording ? Colors.neutral[400] : Colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <Text variant="bodySmall" color="muted" align="center" style={styles.instructions}>
        {isRecording ? 'Tap the button to stop' : 'Tap the button to start recording'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  permissionText: {
    maxWidth: 280,
    marginTop: Spacing.md,
  },
  permissionButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.neutral[400],
  },
  recordingDotActive: {
    backgroundColor: Colors.error,
  },
  timerText: {
    color: '#fff',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: BorderRadius.full,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.xl,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    borderColor: Colors.error,
  },
  recordButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.error,
  },
  recordButtonInnerActive: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  instructions: {
    paddingBottom: Spacing.lg,
  },
});
