/**
 * ScannerScreen - Full-screen document scanner
 * Features:
 * - Camera view with edge detection overlay
 * - Auto-capture when document is stable
 * - Batch capture support
 * - Client indicator
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DocumentScanner } from '@/components/DocumentScanner';
import { ClientPicker } from '@/components/ClientPicker';
import { useClients } from '@/hooks/useClients';
import {
  createScanBatch,
  addDocumentToBatch,
  finalizeBatch,
  ScanBatch,
  ScannedDocument,
  DocumentCorners,
  resetStabilityTracking,
} from '@/lib/scanner';

// ============================================================================
// Types
// ============================================================================

type RootStackParamList = {
  Scanner: { clientId?: string };
  Review: { batchId: string; documents: ScannedDocument[] };
  Dashboard: undefined;
};

type ScannerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Scanner'>;
type ScannerScreenRouteProp = RouteProp<RootStackParamList, 'Scanner'>;

// ============================================================================
// Component
// ============================================================================

export function ScannerScreen() {
  const navigation = useNavigation<ScannerScreenNavigationProp>();
  const route = useRoute<ScannerScreenRouteProp>();

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Client state
  const { clients, activeClient, activeClientId, setActiveClient } = useClients();
  const [showClientPicker, setShowClientPicker] = useState(false);

  // Scanning state
  const [batch, setBatch] = useState<ScanBatch | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [autoCapture, setAutoCapture] = useState(true);

  // Camera ref
  const cameraRef = useRef<CameraView>(null);

  // Initialize client from route params
  useEffect(() => {
    if (route.params?.clientId && route.params.clientId !== activeClientId) {
      setActiveClient(route.params.clientId);
    }
  }, [route.params?.clientId, activeClientId, setActiveClient]);

  // Initialize batch when client is selected
  useEffect(() => {
    if (activeClientId && !batch) {
      setBatch(createScanBatch(activeClientId));
    }
  }, [activeClientId, batch]);

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handle manual capture button press
   */
  const handleCapture = useCallback(async (corners: DocumentCorners | null) => {
    if (!cameraRef.current || !batch || isCapturing) return;

    setIsCapturing(true);

    try {
      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture image');
      }

      // Add to batch
      const updatedBatch = await addDocumentToBatch(batch, photo.uri, corners);
      setBatch(updatedBatch);

      // Reset stability tracking for next capture
      resetStabilityTracking();

      // Haptic feedback would go here
      console.log(`Captured document ${updatedBatch.documents.length}`);
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Capture Failed', 'Could not capture the document. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [batch, isCapturing]);

  /**
   * Handle auto-capture trigger
   */
  const handleAutoCapture = useCallback((corners: DocumentCorners) => {
    if (autoCapture && !isCapturing) {
      handleCapture(corners);
    }
  }, [autoCapture, isCapturing, handleCapture]);

  /**
   * Handle "Done" - finish scanning and go to review
   */
  const handleDone = useCallback(async () => {
    if (!batch || batch.documents.length === 0) {
      Alert.alert('No Documents', 'Please scan at least one document before continuing.');
      return;
    }

    try {
      const finalizedBatch = await finalizeBatch(batch);

      // Navigate to review screen
      navigation.navigate('Review', {
        batchId: finalizedBatch.id,
        documents: finalizedBatch.documents,
      });
    } catch (error) {
      console.error('Finalize error:', error);
      Alert.alert('Error', 'Failed to process documents. Please try again.');
    }
  }, [batch, navigation]);

  /**
   * Handle client selection
   */
  const handleClientSelect = useCallback((clientId: string) => {
    setActiveClient(clientId);
    setShowClientPicker(false);

    // Reset batch for new client
    setBatch(createScanBatch(clientId));
  }, [setActiveClient]);

  /**
   * Toggle flash
   */
  const toggleFlash = useCallback(() => {
    setFlashEnabled(prev => !prev);
  }, []);

  /**
   * Toggle auto-capture
   */
  const toggleAutoCapture = useCallback(() => {
    setAutoCapture(prev => !prev);
  }, []);

  /**
   * Cancel scanning
   */
  const handleCancel = useCallback(() => {
    if (batch && batch.documents.length > 0) {
      Alert.alert(
        'Discard Scans?',
        `You have ${batch.documents.length} scanned document(s). Are you sure you want to discard them?`,
        [
          { text: 'Keep Scanning', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [batch, navigation]);

  // ============================================================================
  // Permission Handling
  // ============================================================================

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            BookFly needs camera access to scan receipts and documents for your bookkeeping.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No client selected
  if (!activeClient) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>Select a Client</Text>
          <Text style={styles.permissionText}>
            Please select a client before scanning documents.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => setShowClientPicker(true)}
          >
            <Text style={styles.permissionButtonText}>Select Client</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ClientPicker
          visible={showClientPicker}
          clients={clients}
          selectedClientId={null}
          onSelect={handleClientSelect}
          onClose={() => setShowClientPicker(false)}
        />
      </SafeAreaView>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Document Scanner with Camera */}
      <DocumentScanner
        ref={cameraRef}
        flashEnabled={flashEnabled}
        onAutoCapture={handleAutoCapture}
        onManualCapture={handleCapture}
        isCapturing={isCapturing}
      />

      {/* Top Bar - Client Indicator */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clientIndicator}
          onPress={() => setShowClientPicker(true)}
        >
          <Text style={styles.clientName} numberOfLines={1}>
            {activeClient.name}
          </Text>
          <Text style={styles.clientChevron}>v</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
          <Text style={styles.flashButtonText}>
            {flashEnabled ? 'Flash ON' : 'Flash OFF'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Controls */}
      <SafeAreaView style={styles.bottomBar}>
        {/* Scan Count */}
        <View style={styles.scanCount}>
          <Text style={styles.scanCountText}>
            {batch?.documents.length ?? 0} scanned
          </Text>
        </View>

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Auto-capture Toggle */}
          <TouchableOpacity
            style={[styles.toggleButton, autoCapture && styles.toggleButtonActive]}
            onPress={toggleAutoCapture}
          >
            <Text style={styles.toggleButtonText}>
              Auto: {autoCapture ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>

          {/* Manual Capture Button */}
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={() => handleCapture(null)}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>

          {/* Done Button */}
          <TouchableOpacity
            style={[
              styles.doneButton,
              (!batch || batch.documents.length === 0) && styles.doneButtonDisabled,
            ]}
            onPress={handleDone}
            disabled={!batch || batch.documents.length === 0}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <Text style={styles.instructions}>
          {autoCapture
            ? 'Hold document steady - will capture automatically'
            : 'Position document and tap capture button'}
        </Text>
      </SafeAreaView>

      {/* Client Picker Modal */}
      <ClientPicker
        visible={showClientPicker}
        clients={clients}
        selectedClientId={activeClientId}
        onSelect={handleClientSelect}
        onClose={() => setShowClientPicker(false)}
      />
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },

  // Permission Screen
  permissionContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },

  // Top Bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clientIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: 200,
  },
  clientName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  clientChevron: {
    color: '#fff',
    fontSize: 12,
  },
  flashButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  flashButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanCount: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scanCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  doneButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  doneButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ScannerScreen;
