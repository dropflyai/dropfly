/**
 * DocumentScanner - Camera component with edge detection
 * Features:
 * - Camera view with live preview
 * - Edge detection overlay showing document edges
 * - Stability indicator
 * - Capture button and flash toggle
 */

import React, { forwardRef, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, FlashMode } from 'expo-camera';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import {
  DocumentCorners,
  EdgeDetectionResult,
  checkDocumentStability,
  shouldAutoCapture,
} from '@/lib/scanner';

// ============================================================================
// Types
// ============================================================================

interface DocumentScannerProps {
  /** Whether flash is enabled */
  flashEnabled?: boolean;
  /** Callback when auto-capture triggers */
  onAutoCapture?: (corners: DocumentCorners) => void;
  /** Callback for manual capture */
  onManualCapture?: (corners: DocumentCorners | null) => void;
  /** Whether a capture is in progress */
  isCapturing?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Edge Detection Overlay
// ============================================================================

interface EdgeOverlayProps {
  corners: DocumentCorners | null;
  isStable: boolean;
  confidence: number;
}

/**
 * Renders the edge detection overlay with animated corners
 */
function EdgeOverlay({ corners, isStable, confidence }: EdgeOverlayProps) {
  // Animation values for the corner indicators
  const pulseOpacity = useSharedValue(0.5);
  const cornerScale = useSharedValue(1);

  // Pulse animation when document is detected
  useEffect(() => {
    if (corners) {
      pulseOpacity.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );

      if (isStable) {
        cornerScale.value = withSpring(1.2);
      } else {
        cornerScale.value = withSpring(1);
      }
    } else {
      pulseOpacity.value = 0.5;
      cornerScale.value = 1;
    }
  }, [corners, isStable, pulseOpacity, cornerScale]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const animatedCornerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cornerScale.value }],
  }));

  // Colors based on state
  const overlayColor = isStable ? '#4CAF50' : corners ? '#FF9800' : 'transparent';

  if (!corners) {
    // Show guide frame when no document detected
    return (
      <View style={styles.guideContainer}>
        <View style={styles.guideFrame}>
          {/* Corner guides */}
          <View style={[styles.guideCorner, styles.guideCornerTL]} />
          <View style={[styles.guideCorner, styles.guideCornerTR]} />
          <View style={[styles.guideCorner, styles.guideCornerBL]} />
          <View style={[styles.guideCorner, styles.guideCornerBR]} />
        </View>
        <Text style={styles.guideText}>Position document within frame</Text>
      </View>
    );
  }

  // Render detected edge overlay
  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      {/* Semi-transparent overlay outside document area */}
      <Animated.View style={[styles.edgeOverlay, animatedPulseStyle]}>
        {/* Document outline */}
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Path
            d={`
              M ${corners.topLeft.x} ${corners.topLeft.y}
              L ${corners.topRight.x} ${corners.topRight.y}
              L ${corners.bottomRight.x} ${corners.bottomRight.y}
              L ${corners.bottomLeft.x} ${corners.bottomLeft.y}
              Z
            `}
            stroke={overlayColor}
            strokeWidth={3}
            fill="transparent"
          />
        </Svg>

        {/* Corner indicators */}
        {Object.entries(corners).map(([key, point]) => (
          <Animated.View
            key={key}
            style={[
              styles.cornerIndicator,
              animatedCornerStyle,
              {
                left: point.x - 12,
                top: point.y - 12,
                backgroundColor: overlayColor,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Stability indicator */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: overlayColor }]} />
        <Text style={styles.statusText}>
          {isStable ? 'Hold steady...' : 'Adjusting...'}
        </Text>
        <Text style={styles.confidenceText}>{Math.round(confidence * 100)}%</Text>
      </View>
    </View>
  );
}

// Simple SVG placeholder (in production, use react-native-svg)
function Svg({ children, width, height, style }: {
  children: React.ReactNode;
  width: string;
  height: string;
  style?: object;
}) {
  return <View style={[{ width: '100%', height: '100%' }, style]}>{children}</View>;
}

function Path(props: {
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
}) {
  // Placeholder - in production, use actual SVG Path from react-native-svg
  return null;
}

// ============================================================================
// Main Component
// ============================================================================

export const DocumentScanner = forwardRef<CameraView, DocumentScannerProps>(
  function DocumentScanner(
    {
      flashEnabled = false,
      onAutoCapture,
      onManualCapture,
      isCapturing = false,
    },
    ref
  ) {
    // Detection state
    const [detectionResult, setDetectionResult] = useState<EdgeDetectionResult>({
      detected: false,
      confidence: 0,
      corners: null,
      isStable: false,
    });

    // Refs for frame processing
    const frameCountRef = useRef(0);
    const lastCornersRef = useRef<DocumentCorners | null>(null);

    // ============================================================================
    // Frame Processing
    // ============================================================================

    /**
     * Process camera frame for edge detection
     * In production, this would use ML Kit or Vision Camera frame processor
     */
    const processFrame = useCallback(() => {
      // Simulated edge detection for demo purposes
      // In production, this would process actual camera frames
      frameCountRef.current += 1;

      // Simulate occasional document detection
      const simulateDetection = frameCountRef.current % 60 < 45; // Detected 75% of time

      if (simulateDetection) {
        // Generate mock corners based on a centered document
        const padding = 40;
        const docWidth = SCREEN_WIDTH - padding * 2;
        const docHeight = SCREEN_HEIGHT * 0.5;
        const offsetY = (SCREEN_HEIGHT - docHeight) / 2;

        const mockCorners: DocumentCorners = {
          topLeft: { x: padding + Math.random() * 5, y: offsetY + Math.random() * 5 },
          topRight: { x: padding + docWidth + Math.random() * 5, y: offsetY + Math.random() * 5 },
          bottomRight: { x: padding + docWidth + Math.random() * 5, y: offsetY + docHeight + Math.random() * 5 },
          bottomLeft: { x: padding + Math.random() * 5, y: offsetY + docHeight + Math.random() * 5 },
        };

        // Check stability
        const isStable = checkDocumentStability(mockCorners);
        const confidence = 0.75 + Math.random() * 0.2;

        const result: EdgeDetectionResult = {
          detected: true,
          confidence,
          corners: mockCorners,
          isStable,
        };

        setDetectionResult(result);
        lastCornersRef.current = mockCorners;

        // Check for auto-capture
        if (shouldAutoCapture(result) && onAutoCapture && !isCapturing) {
          onAutoCapture(mockCorners);
        }
      } else {
        setDetectionResult({
          detected: false,
          confidence: 0,
          corners: null,
          isStable: false,
        });
        lastCornersRef.current = null;
      }
    }, [isCapturing, onAutoCapture]);

    // Run frame processing loop (simulated)
    useEffect(() => {
      const interval = setInterval(processFrame, 100); // 10 FPS for demo
      return () => clearInterval(interval);
    }, [processFrame]);

    // ============================================================================
    // Render
    // ============================================================================

    return (
      <View style={styles.container}>
        {/* Camera View */}
        <CameraView
          ref={ref}
          style={styles.camera}
          facing="back"
          flash={flashEnabled ? 'on' : 'off'}
        >
          {/* Edge Detection Overlay */}
          <EdgeOverlay
            corners={detectionResult.corners}
            isStable={detectionResult.isStable}
            confidence={detectionResult.confidence}
          />

          {/* Capturing Indicator */}
          {isCapturing && (
            <View style={styles.capturingOverlay}>
              <View style={styles.capturingFlash} />
            </View>
          )}
        </CameraView>
      </View>
    );
  }
);

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },

  // Guide Frame (no document detected)
  guideContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    position: 'relative',
  },
  guideCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#fff',
    borderWidth: 3,
  },
  guideCornerTL: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  guideCornerTR: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  guideCornerBL: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  guideCornerBR: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  guideText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
  },

  // Edge Detection Overlay
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  edgeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cornerIndicator: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },

  // Status Indicator
  statusContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    borderRadius: 20,
    marginHorizontal: 100,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  confidenceText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },

  // Capturing Flash Effect
  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturingFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default DocumentScanner;
