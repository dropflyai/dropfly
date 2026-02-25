import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, ProgressBar, Card } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboardingStore } from '@/lib/store';
import type { AttachmentStyle } from '@/types';

const ATTACHMENT_STYLES: {
  value: AttachmentStyle;
  title: string;
  description: string;
  traits: string[];
}[] = [
  {
    value: 'secure',
    title: 'Secure',
    description: 'Comfortable with intimacy and independence',
    traits: ['Trusting', 'Open communication', 'Consistent'],
  },
  {
    value: 'anxious',
    title: 'Anxious',
    description: 'Desire closeness but fear rejection',
    traits: ['Caring deeply', 'Responsive', 'Value connection'],
  },
  {
    value: 'avoidant',
    title: 'Avoidant',
    description: 'Value independence and self-reliance',
    traits: ['Self-sufficient', 'Calm under pressure', 'Independent'],
  },
  {
    value: 'fearful-avoidant',
    title: 'Fearful-Avoidant',
    description: 'Mixed feelings about closeness',
    traits: ['Adaptable', 'Empathetic', 'Complex'],
  },
];

export default function AttachmentScreen() {
  const { data, setAttachmentStyle, totalSteps } = useOnboardingStore();
  const [selected, setSelected] = useState<AttachmentStyle | null>(data.attachment_style);

  const handleNext = () => {
    if (!selected) return;
    setAttachmentStyle(selected);
    router.push('/(onboarding)/love-language');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
      </TouchableOpacity>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={5 / totalSteps} />
        <Text variant="caption" color="muted" style={styles.progressText}>
          Step 5 of {totalSteps}
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2">How do you connect?</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Understanding attachment styles helps us find compatible matches
        </Text>
      </View>

      {/* Options */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.options}
        showsVerticalScrollIndicator={false}
      >
        {ATTACHMENT_STYLES.map((style) => (
          <TouchableOpacity
            key={style.value}
            style={[
              styles.option,
              selected === style.value && styles.optionSelected,
            ]}
            onPress={() => setSelected(style.value)}
          >
            <View style={styles.optionHeader}>
              <View style={styles.optionTitleRow}>
                <Text
                  variant="h4"
                  style={selected === style.value ? styles.selectedTitle : undefined}
                >
                  {style.title}
                </Text>
                {selected === style.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.primary[500]}
                  />
                )}
              </View>
              <Text variant="bodySmall" color="secondary">
                {style.description}
              </Text>
            </View>
            <View style={styles.traits}>
              {style.traits.map((trait) => (
                <View
                  key={trait}
                  style={[
                    styles.trait,
                    selected === style.value && styles.traitSelected,
                  ]}
                >
                  <Text
                    variant="caption"
                    style={selected === style.value ? styles.traitTextSelected : undefined}
                  >
                    {trait}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        {/* Info Card */}
        <Card variant="filled" style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text variant="bodySmall" color="secondary" style={styles.infoText}>
            There's no "good" or "bad" style — this helps us understand your relationship patterns.
          </Text>
        </Card>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleNext}
          fullWidth
          disabled={!selected}
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
    marginBottom: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  options: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  option: {
    padding: Spacing.lg,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  optionHeader: {
    marginBottom: Spacing.sm,
  },
  optionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  selectedTitle: {
    color: Colors.primary[600],
  },
  traits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  trait: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
  },
  traitSelected: {
    backgroundColor: Colors.primary[100],
  },
  traitTextSelected: {
    color: Colors.primary[600],
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  infoText: {
    flex: 1,
  },
  footer: {
    paddingVertical: Spacing.lg,
  },
});
