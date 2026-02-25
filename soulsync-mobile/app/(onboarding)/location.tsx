import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, ProgressBar } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboardingStore } from '@/lib/store';

export default function LocationScreen() {
  const { data, setLocation, totalSteps } = useOnboardingStore();
  const [isLA, setIsLA] = useState(data.location === 'Los Angeles');
  const [selectedOption, setSelectedOption] = useState<'la' | 'other' | null>(
    data.location === 'Los Angeles' ? 'la' : data.location ? 'other' : null
  );

  const handleNext = () => {
    if (selectedOption === 'la') {
      setLocation('Los Angeles');
      router.push('/(onboarding)/goal');
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
        <ProgressBar progress={2 / totalSteps} />
        <Text variant="caption" color="muted" style={styles.progressText}>
          Step 2 of {totalSteps}
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2">Where are you?</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          SoulSync is launching exclusively in Los Angeles
        </Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        <TouchableOpacity
          style={[
            styles.option,
            selectedOption === 'la' && styles.optionSelected,
          ]}
          onPress={() => setSelectedOption('la')}
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionEmoji}>🌴</Text>
            <View style={styles.optionText}>
              <Text variant="h4">Los Angeles</Text>
              <Text variant="bodySmall" color="secondary">
                Get early access to SoulSync
              </Text>
            </View>
          </View>
          {selectedOption === 'la' && (
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary[500]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            selectedOption === 'other' && styles.optionSelected,
          ]}
          onPress={() => setSelectedOption('other')}
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionEmoji}>🌎</Text>
            <View style={styles.optionText}>
              <Text variant="h4">Somewhere else</Text>
              <Text variant="bodySmall" color="secondary">
                Join the waitlist for your city
              </Text>
            </View>
          </View>
          {selectedOption === 'other' && (
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary[500]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Waitlist Message */}
      {selectedOption === 'other' && (
        <View style={styles.waitlistCard}>
          <Ionicons name="heart" size={24} color={Colors.primary[500]} />
          <Text variant="body" align="center" style={styles.waitlistText}>
            We'd love to have you! Join the waitlist and we'll notify you when SoulSync launches in your area.
          </Text>
          <Button
            title="Join Waitlist"
            onPress={() => {
              // TODO: Implement waitlist signup
              router.replace('/(auth)');
            }}
            variant="outline"
            fullWidth
          />
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleNext}
          fullWidth
          disabled={selectedOption !== 'la'}
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
  options: {
    gap: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  optionEmoji: {
    fontSize: 32,
  },
  optionText: {
    gap: Spacing.xs / 2,
  },
  waitlistCard: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  waitlistText: {
    maxWidth: 280,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: Spacing.lg,
  },
});
