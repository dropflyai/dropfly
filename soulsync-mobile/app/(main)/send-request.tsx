import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Card } from '@/components/ui';
import { VoiceRecorder, VoicePlayer } from '@/components/voice';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/lib/store';
import { uploadVoiceNote, getVoiceNoteUrl, supabase } from '@/lib/supabase';
import { notifyConnectionRequest } from '@/lib/notificationService';

const PROMPTS = [
  "What caught your attention about their profile?",
  "Share something you two might have in common.",
  "What would you love to do on a first date with them?",
  "Tell them what made you want to connect.",
];

export default function SendRequestScreen() {
  const { profileId, profileName } = useLocalSearchParams<{
    profileId: string;
    profileName: string;
  }>();
  const { user } = useAuthStore();

  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptIndex] = useState(Math.floor(Math.random() * PROMPTS.length));

  const handleRecordingComplete = (uri: string) => {
    setRecordingUri(uri);
  };

  const handleSendRequest = async () => {
    if (!recordingUri || !user || !profileId) return;

    setIsSubmitting(true);
    try {
      // Upload voice note
      const filePath = `connection-requests/${user.id}/${profileId}/${Date.now()}.m4a`;
      await uploadVoiceNote(filePath, recordingUri);
      const publicUrl = getVoiceNoteUrl(filePath);

      // Create connection request
      const { error } = await supabase.from('connection_requests').insert({
        from_user_id: user.id,
        to_user_id: profileId,
        voice_note_url: publicUrl,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation
          Alert.alert(
            'Already Sent',
            `You've already sent a connection request to ${profileName}.`
          );
        } else {
          throw error;
        }
        return;
      }

      // Get current user's name for notification
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      // Send push notification to recipient
      await notifyConnectionRequest(profileId, profile?.name || 'Someone');

      Alert.alert(
        'Request Sent!',
        `Your voice message has been sent to ${profileName}. You'll be notified when they respond.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Failed to send request:', error);
      Alert.alert('Error', 'Failed to send your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text variant="h4" align="center">
            Connect with {profileName}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text variant="body" color="secondary" align="center">
            Record a short voice message to introduce yourself and start the
            conversation.
          </Text>
        </View>

        {/* Prompt Card */}
        <Card variant="filled" style={styles.promptCard}>
          <Text variant="label" color="muted" style={styles.promptLabel}>
            CONVERSATION STARTER
          </Text>
          <Text variant="body" weight="medium" align="center">
            "{PROMPTS[promptIndex]}"
          </Text>
        </Card>

        {/* Recording Area */}
        <View style={styles.recordingArea}>
          {recordingUri ? (
            <View style={styles.reviewContainer}>
              <Text variant="label" color="muted" style={styles.sectionLabel}>
                YOUR MESSAGE
              </Text>
              <VoicePlayer uri={recordingUri} />

              <TouchableOpacity
                onPress={() => setRecordingUri(null)}
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
              maxDuration={60}
              onRecordingComplete={handleRecordingComplete}
            />
          )}
        </View>

        {/* Tips */}
        <View style={styles.tips}>
          <Text variant="caption" color="muted" align="center">
            Keep it friendly and genuine. 15-30 seconds is ideal.
          </Text>
        </View>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title={isSubmitting ? 'Sending...' : 'Send Connection Request'}
            onPress={handleSendRequest}
            fullWidth
            disabled={!recordingUri}
            loading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  instructions: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  promptCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  promptLabel: {
    marginBottom: Spacing.sm,
    fontSize: 11,
    letterSpacing: 1,
  },
  recordingArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  reviewContainer: {
    gap: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textAlign: 'center',
  },
  reRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  reRecordText: {
    color: Colors.primary[500],
    fontWeight: '500',
  },
  tips: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
});
