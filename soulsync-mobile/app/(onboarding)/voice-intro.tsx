import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, ProgressBar, Card } from '@/components/ui';
import { VoiceRecorder, VoicePlayer } from '@/components/voice';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboardingStore, useAuthStore } from '@/lib/store';
import { AppConstants } from '@/constants/theme';
import { uploadVoiceNote, getVoiceNoteUrl, supabase } from '@/lib/supabase';

const PROMPTS = [
  "What's one thing that makes you smile every day?",
  "Describe your perfect Sunday morning.",
  "What are you most passionate about right now?",
  "Tell us about a recent adventure you had.",
  "What's something you're proud of?",
];

export default function VoiceIntroScreen() {
  const { data, setVoiceIntroUrl, completeOnboarding, totalSteps } = useOnboardingStore();
  const { user } = useAuthStore();

  const [recordingUri, setRecordingUri] = useState<string | null>(data.voice_intro_url);
  const [isUploading, setIsUploading] = useState(false);
  const [promptIndex] = useState(Math.floor(Math.random() * PROMPTS.length));

  const handleRecordingComplete = async (uri: string) => {
    setRecordingUri(uri);
  };

  const handleReRecord = () => {
    setRecordingUri(null);
  };

  const handleNext = async () => {
    if (!recordingUri || !user) return;

    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const filePath = `voice-intros/${user.id}/${Date.now()}.m4a`;
      await uploadVoiceNote(filePath, recordingUri);
      const publicUrl = getVoiceNoteUrl(filePath);

      setVoiceIntroUrl(publicUrl);

      // Save profile to database
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        name: data.name,
        birthdate: data.birthdate,
        gender: data.gender,
        location: data.location,
        relationship_goal: data.relationship_goal,
        core_values: data.core_values,
        attachment_style: data.attachment_style,
        love_languages: data.love_languages,
        voice_intro_url: publicUrl,
        onboarding_completed: false, // Will be true after photos
      });

      if (error) throw error;

      router.push('/(onboarding)/photos');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload your voice intro. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
      </TouchableOpacity>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={7 / totalSteps} />
        <Text variant="caption" color="muted" style={styles.progressText}>
          Step 7 of {totalSteps}
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2">Record your voice intro</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          This is how potential matches will first hear you. Make it count!
        </Text>
      </View>

      {/* Prompt Card */}
      <Card variant="filled" style={styles.promptCard}>
        <Text variant="label" color="muted" style={styles.promptLabel}>
          PROMPT SUGGESTION
        </Text>
        <Text variant="body" weight="medium">
          "{PROMPTS[promptIndex]}"
        </Text>
      </Card>

      {/* Recording Area */}
      <View style={styles.recordingArea}>
        {recordingUri ? (
          <View style={styles.playbackContainer}>
            <VoicePlayer uri={recordingUri} />
            <TouchableOpacity
              onPress={handleReRecord}
              style={styles.reRecordButton}
            >
              <Ionicons name="refresh" size={20} color={Colors.primary[500]} />
              <Text variant="body" style={styles.reRecordText}>
                Re-record
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <VoiceRecorder
            maxDuration={AppConstants.voiceIntroMaxDuration}
            onRecordingComplete={handleRecordingComplete}
          />
        )}
      </View>

      {/* Tips */}
      <View style={styles.tips}>
        <Text variant="label" color="muted" style={styles.tipsTitle}>
          TIPS FOR A GREAT INTRO
        </Text>
        <View style={styles.tipItem}>
          <Ionicons name="mic" size={16} color={Colors.neutral[500]} />
          <Text variant="bodySmall" color="secondary">
            Find a quiet space for best audio
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="happy" size={16} color={Colors.neutral[500]} />
          <Text variant="bodySmall" color="secondary">
            Be yourself — authenticity wins
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="time" size={16} color={Colors.neutral[500]} />
          <Text variant="bodySmall" color="secondary">
            30-60 seconds is perfect
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={isUploading ? 'Uploading...' : 'Continue'}
          onPress={handleNext}
          fullWidth
          disabled={!recordingUri}
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
  promptCard: {
    marginBottom: Spacing.xl,
  },
  promptLabel: {
    marginBottom: Spacing.xs,
    fontSize: 11,
    letterSpacing: 1,
  },
  recordingArea: {
    flex: 1,
    justifyContent: 'center',
  },
  playbackContainer: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  reRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  reRecordText: {
    color: Colors.primary[500],
    fontWeight: '500',
  },
  tips: {
    backgroundColor: Colors.neutral[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  tipsTitle: {
    marginBottom: Spacing.sm,
    fontSize: 11,
    letterSpacing: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  footer: {
    paddingVertical: Spacing.lg,
  },
});
