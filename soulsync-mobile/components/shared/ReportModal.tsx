import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
  onReportSubmitted?: () => void;
}

type ReportReason =
  | 'inappropriate_content'
  | 'harassment'
  | 'fake_profile'
  | 'spam'
  | 'underage'
  | 'other';

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Offensive voice messages, photos, or behavior',
  },
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'Threatening, bullying, or abusive behavior',
  },
  {
    value: 'fake_profile',
    label: 'Fake Profile',
    description: 'Impersonation or misleading information',
  },
  {
    value: 'spam',
    label: 'Spam',
    description: 'Promotional content or spam messages',
  },
  {
    value: 'underage',
    label: 'Underage User',
    description: 'User appears to be under 18',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else not listed above',
  },
];

export function ReportModal({
  visible,
  onClose,
  reportedUserId,
  reportedUserName,
  onReportSubmitted,
}: ReportModalProps) {
  const { user } = useAuthStore();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('user_reports').insert({
        reporter_id: user.id,
        reported_id: reportedUserId,
        reason: selectedReason,
        description: description.trim() || null,
      });

      if (error) throw error;

      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep our community safe. We will review this report.',
        [{ text: 'OK', onPress: onClose }]
      );

      onReportSubmitted?.();
      setSelectedReason(null);
      setDescription('');
    } catch (error) {
      console.error('Failed to submit report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlock = async () => {
    if (!user) return;

    Alert.alert(
      `Block ${reportedUserName}?`,
      'They won\'t be able to see your profile or contact you. You can unblock them later in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('blocked_users').insert({
                blocker_id: user.id,
                blocked_id: reportedUserId,
              });

              if (error && error.code !== '23505') throw error; // Ignore duplicate

              Alert.alert('Blocked', `${reportedUserName} has been blocked.`);
              onClose();
              onReportSubmitted?.();
            } catch (error) {
              console.error('Failed to block user:', error);
              Alert.alert('Error', 'Failed to block user. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text variant="h4">Report {reportedUserName}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Reason Selection */}
          <View style={styles.section}>
            <Text variant="label" style={styles.sectionTitle}>
              WHY ARE YOU REPORTING?
            </Text>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                style={[
                  styles.reasonOption,
                  selectedReason === reason.value && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason.value)}
              >
                <View style={styles.reasonContent}>
                  <Text
                    variant="body"
                    weight={selectedReason === reason.value ? 'semibold' : 'normal'}
                  >
                    {reason.label}
                  </Text>
                  <Text variant="caption" color="muted">
                    {reason.description}
                  </Text>
                </View>
                {selectedReason === reason.value && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary[500]} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Details */}
          {selectedReason && (
            <View style={styles.section}>
              <Text variant="label" style={styles.sectionTitle}>
                ADDITIONAL DETAILS (OPTIONAL)
              </Text>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Provide any additional context that might help us review this report..."
                placeholderTextColor={Colors.neutral[400]}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text variant="caption" color="muted" style={styles.charCount}>
                {description.length}/500
              </Text>
            </View>
          )}

          {/* Block Option */}
          <TouchableOpacity style={styles.blockOption} onPress={handleBlock}>
            <View style={styles.blockIconContainer}>
              <Ionicons name="ban" size={20} color={Colors.error} />
            </View>
            <View style={styles.blockContent}>
              <Text variant="body" weight="semibold">
                Block {reportedUserName}
              </Text>
              <Text variant="caption" color="muted">
                Stop them from seeing your profile or contacting you
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Submit Report"
            onPress={handleSubmit}
            fullWidth
            disabled={!selectedReason}
            loading={isSubmitting}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.text.muted,
    marginBottom: Spacing.md,
    fontSize: 12,
    letterSpacing: 1,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reasonOptionSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  reasonContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  textInput: {
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 100,
  },
  charCount: {
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  blockOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  blockIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  blockContent: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
});

export default ReportModal;
