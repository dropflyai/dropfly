import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, ProgressBar } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboardingStore } from '@/lib/store';
import { AppConstants } from '@/constants/theme';
import type { LoveLanguage } from '@/types';

const LOVE_LANGUAGES: {
  value: LoveLanguage;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    value: 'words-of-affirmation',
    label: 'Words of Affirmation',
    description: 'Compliments and verbal appreciation',
    emoji: '💬',
  },
  {
    value: 'acts-of-service',
    label: 'Acts of Service',
    description: 'Actions that show you care',
    emoji: '🤲',
  },
  {
    value: 'receiving-gifts',
    label: 'Receiving Gifts',
    description: 'Thoughtful presents and tokens',
    emoji: '🎁',
  },
  {
    value: 'quality-time',
    label: 'Quality Time',
    description: 'Undivided attention and presence',
    emoji: '⏰',
  },
  {
    value: 'physical-touch',
    label: 'Physical Touch',
    description: 'Hugs, holding hands, closeness',
    emoji: '🤗',
  },
];

export default function LoveLanguageScreen() {
  const { data, setLoveLanguages, totalSteps } = useOnboardingStore();
  const [selected, setSelected] = useState<LoveLanguage[]>(data.love_languages);

  const toggleLanguage = (language: LoveLanguage) => {
    if (selected.includes(language)) {
      setSelected(selected.filter((l) => l !== language));
    } else if (selected.length < AppConstants.maxLoveLanguages) {
      setSelected([...selected, language]);
    }
  };

  const handleNext = () => {
    if (selected.length === 0) return;
    setLoveLanguages(selected);
    router.push('/(onboarding)/voice-intro');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
      </TouchableOpacity>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={6 / totalSteps} />
        <Text variant="caption" color="muted" style={styles.progressText}>
          Step 6 of {totalSteps}
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2">How do you feel loved?</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Select up to {AppConstants.maxLoveLanguages} love languages that resonate with you
        </Text>
      </View>

      {/* Counter */}
      <View style={styles.counterContainer}>
        <Text
          variant="body"
          color={selected.length > 0 ? 'success' : 'secondary'}
        >
          {selected.length} of {AppConstants.maxLoveLanguages} selected
        </Text>
      </View>

      {/* Options */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.options}
        showsVerticalScrollIndicator={false}
      >
        {LOVE_LANGUAGES.map((language, index) => {
          const isSelected = selected.includes(language.value);
          const isDisabled =
            !isSelected && selected.length >= AppConstants.maxLoveLanguages;
          const rank = selected.indexOf(language.value) + 1;

          return (
            <TouchableOpacity
              key={language.value}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                isDisabled && styles.optionDisabled,
              ]}
              onPress={() => toggleLanguage(language.value)}
              disabled={isDisabled}
            >
              <Text style={styles.optionEmoji}>{language.emoji}</Text>
              <View style={styles.optionText}>
                <Text
                  variant="body"
                  weight={isSelected ? 'semibold' : 'normal'}
                  style={isSelected ? styles.selectedText : undefined}
                >
                  {language.label}
                </Text>
                <Text variant="bodySmall" color="secondary">
                  {language.description}
                </Text>
              </View>
              {isSelected && (
                <View style={styles.rankBadge}>
                  <Text variant="caption" style={styles.rankText}>
                    #{rank}
                  </Text>
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
          disabled={selected.length === 0}
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
  optionDisabled: {
    opacity: 0.4,
  },
  optionEmoji: {
    fontSize: 32,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  selectedText: {
    color: Colors.primary[600],
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    paddingVertical: Spacing.lg,
  },
});
