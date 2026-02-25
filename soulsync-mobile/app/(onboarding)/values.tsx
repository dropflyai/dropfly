import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, ProgressBar } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboardingStore } from '@/lib/store';
import { AppConstants } from '@/constants/theme';
import type { CoreValue } from '@/types';

const VALUES: { value: CoreValue; label: string; emoji: string }[] = [
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { value: 'career', label: 'Career', emoji: '💼' },
  { value: 'adventure', label: 'Adventure', emoji: '🌍' },
  { value: 'creativity', label: 'Creativity', emoji: '🎨' },
  { value: 'spirituality', label: 'Spirituality', emoji: '🙏' },
  { value: 'health', label: 'Health', emoji: '💪' },
  { value: 'learning', label: 'Learning', emoji: '📚' },
  { value: 'independence', label: 'Independence', emoji: '🦅' },
  { value: 'community', label: 'Community', emoji: '🏘️' },
  { value: 'stability', label: 'Stability', emoji: '🏡' },
];

export default function ValuesScreen() {
  const { data, setCoreValues, totalSteps } = useOnboardingStore();
  const [selected, setSelected] = useState<CoreValue[]>(data.core_values);

  const toggleValue = (value: CoreValue) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else if (selected.length < AppConstants.maxCoreValues) {
      setSelected([...selected, value]);
    }
  };

  const handleNext = () => {
    if (selected.length !== AppConstants.maxCoreValues) return;
    setCoreValues(selected);
    router.push('/(onboarding)/attachment');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
      </TouchableOpacity>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={4 / totalSteps} />
        <Text variant="caption" color="muted" style={styles.progressText}>
          Step 4 of {totalSteps}
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2">What matters most to you?</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Select your top {AppConstants.maxCoreValues} values
        </Text>
      </View>

      {/* Counter */}
      <View style={styles.counterContainer}>
        <Text
          variant="body"
          color={selected.length === AppConstants.maxCoreValues ? 'success' : 'secondary'}
        >
          {selected.length} of {AppConstants.maxCoreValues} selected
        </Text>
      </View>

      {/* Values Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.valuesGrid}
        showsVerticalScrollIndicator={false}
      >
        {VALUES.map((value) => {
          const isSelected = selected.includes(value.value);
          const isDisabled = !isSelected && selected.length >= AppConstants.maxCoreValues;

          return (
            <TouchableOpacity
              key={value.value}
              style={[
                styles.valueOption,
                isSelected && styles.valueOptionSelected,
                isDisabled && styles.valueOptionDisabled,
              ]}
              onPress={() => toggleValue(value.value)}
              disabled={isDisabled}
            >
              <Text style={styles.valueEmoji}>{value.emoji}</Text>
              <Text
                variant="bodySmall"
                weight={isSelected ? 'semibold' : 'normal'}
                align="center"
                style={isSelected ? styles.selectedText : undefined}
              >
                {value.label}
              </Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleNext}
          fullWidth
          disabled={selected.length !== AppConstants.maxCoreValues}
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
    marginBottom: Spacing.md,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    paddingBottom: Spacing.md,
  },
  valueOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  valueOptionSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  valueOptionDisabled: {
    opacity: 0.4,
  },
  valueEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  selectedText: {
    color: Colors.primary[600],
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: Spacing.lg,
  },
});
