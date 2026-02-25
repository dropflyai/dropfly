import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, ProgressBar } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboardingStore } from '@/lib/store';
import type { RelationshipGoal } from '@/types';

const GOALS: { value: RelationshipGoal; label: string; description: string; emoji: string }[] = [
  {
    value: 'long-term',
    label: 'Long-term relationship',
    description: 'Ready to find my person',
    emoji: '💍',
  },
  {
    value: 'short-term',
    label: 'Something casual',
    description: 'See where it goes',
    emoji: '✨',
  },
  {
    value: 'casual',
    label: 'Dating around',
    description: 'Meeting new people',
    emoji: '🎉',
  },
  {
    value: 'friendship',
    label: 'New friends',
    description: 'Building connections',
    emoji: '🤝',
  },
  {
    value: 'not-sure',
    label: 'Not sure yet',
    description: 'Figuring it out',
    emoji: '🤔',
  },
];

export default function GoalScreen() {
  const { data, setRelationshipGoal, totalSteps } = useOnboardingStore();
  const [selected, setSelected] = useState<RelationshipGoal | null>(data.relationship_goal);

  const handleNext = () => {
    if (!selected) return;
    setRelationshipGoal(selected);
    router.push('/(onboarding)/values');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
      </TouchableOpacity>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={3 / totalSteps} />
        <Text variant="caption" color="muted" style={styles.progressText}>
          Step 3 of {totalSteps}
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2">What are you looking for?</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          No wrong answers — just be honest
        </Text>
      </View>

      {/* Options */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.options}
        showsVerticalScrollIndicator={false}
      >
        {GOALS.map((goal) => (
          <TouchableOpacity
            key={goal.value}
            style={[
              styles.option,
              selected === goal.value && styles.optionSelected,
            ]}
            onPress={() => setSelected(goal.value)}
          >
            <Text style={styles.optionEmoji}>{goal.emoji}</Text>
            <View style={styles.optionText}>
              <Text
                variant="body"
                weight={selected === goal.value ? 'semibold' : 'normal'}
              >
                {goal.label}
              </Text>
              <Text variant="bodySmall" color="secondary">
                {goal.description}
              </Text>
            </View>
            {selected === goal.value && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.primary[500]}
              />
            )}
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.md,
  },
  optionSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  footer: {
    paddingVertical: Spacing.lg,
  },
});
