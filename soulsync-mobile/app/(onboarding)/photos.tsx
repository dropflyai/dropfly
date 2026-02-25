import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, ProgressBar, Card } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboardingStore, useAuthStore } from '@/lib/store';
import { uploadPhoto, getPhotoUrl, supabase } from '@/lib/supabase';

const MIN_PHOTOS = 2;
const MAX_PHOTOS = 6;

export default function PhotosScreen() {
  const { completeOnboarding, totalSteps } = useOnboardingStore();
  const { user } = useAuthStore();

  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Maximum Photos', `You can only add up to ${MAX_PHOTOS} photos`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Maximum Photos', `You can only add up to ${MAX_PHOTOS} photos`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    if (photos.length < MIN_PHOTOS || !user) return;

    setIsUploading(true);
    try {
      // Upload all photos
      const uploadedUrls: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        const filePath = `photos/${user.id}/${Date.now()}-${i}.jpg`;
        await uploadPhoto(filePath, photos[i]);
        const publicUrl = getPhotoUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      // Update profile with photos and mark onboarding complete
      const { error } = await supabase
        .from('profiles')
        .update({
          photo_urls: uploadedUrls,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      completeOnboarding();
      router.replace('/(main)/discover');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload your photos. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
      </TouchableOpacity>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={1} />
        <Text variant="caption" color="muted" style={styles.progressText}>
          Final step!
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2">Add your photos</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          These stay hidden until after Connectivity is complete
        </Text>
      </View>

      {/* Photo Info */}
      <Card variant="filled" style={styles.infoCard}>
        <Ionicons name="eye-off" size={20} color={Colors.primary[500]} />
        <Text variant="bodySmall" color="secondary" style={styles.infoText}>
          Your photos are revealed only after you and your match complete all Connectivity rounds
        </Text>
      </Card>

      {/* Photo Grid */}
      <View style={styles.photoGrid}>
        {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
          const photoUri = photos[index];

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.photoSlot,
                index === 0 && styles.primarySlot,
                photoUri && styles.photoSlotFilled,
              ]}
              onPress={() => (photoUri ? removePhoto(index) : showImageOptions())}
            >
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.photo} />
                  <View style={styles.removeButton}>
                    <Ionicons name="close" size={16} color="#fff" />
                  </View>
                </>
              ) : (
                <>
                  <Ionicons
                    name="add"
                    size={32}
                    color={index < MIN_PHOTOS ? Colors.primary[500] : Colors.neutral[400]}
                  />
                  {index === 0 && (
                    <Text variant="caption" color="muted" style={styles.primaryLabel}>
                      Primary
                    </Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Counter */}
      <View style={styles.counterContainer}>
        <Text
          variant="body"
          color={photos.length >= MIN_PHOTOS ? 'success' : 'secondary'}
        >
          {photos.length} of {MIN_PHOTOS} required photos added
        </Text>
      </View>

      {/* Tips */}
      <View style={styles.tips}>
        <Text variant="caption" color="muted">
          Tip: Show your face clearly in at least one photo. Avoid group photos for your primary.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={isUploading ? 'Uploading...' : 'Complete Setup'}
          onPress={handleComplete}
          fullWidth
          disabled={photos.length < MIN_PHOTOS}
          loading={isUploading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
    marginTop: Spacing.md,
  },
  progressContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  progressText: {
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  header: {
    marginBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  infoText: {
    flex: 1,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 3 / 4,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.neutral[300],
    overflow: 'hidden',
  },
  primarySlot: {
    borderColor: Colors.primary[300],
    borderStyle: 'solid',
  },
  photoSlotFilled: {
    borderWidth: 0,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    marginTop: Spacing.xs,
  },
  counterContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  tips: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: Spacing.lg,
  },
});
