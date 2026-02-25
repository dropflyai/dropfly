import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Button, Input, ProgressBar } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboardingStore } from '@/lib/store';
import { calculateAge, isValidAge } from '@/lib/utils';
import type { Gender } from '@/types';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Man' },
  { value: 'female', label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' },
];

export default function BasicsScreen() {
  const { data, setName, setBirthdate, setGender, currentStep, totalSteps } = useOnboardingStore();

  const [name, setNameLocal] = useState(data.name);
  const [birthdate, setBirthdateLocal] = useState<Date>(
    data.birthdate ? new Date(data.birthdate) : new Date(2000, 0, 1)
  );
  const [gender, setGenderLocal] = useState<Gender | null>(data.gender);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!isValidAge(birthdate.toISOString())) {
      newErrors.birthdate = 'You must be 18 or older to use SoulSync';
    }

    if (!gender) {
      newErrors.gender = 'Please select your gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    setName(name.trim());
    setBirthdate(birthdate.toISOString());
    setGender(gender!);
    router.push('/(onboarding)/location');
  };

  const age = calculateAge(birthdate.toISOString());

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress */}
          <View style={styles.progressContainer}>
            <ProgressBar progress={1 / totalSteps} />
            <Text variant="caption" color="muted" style={styles.progressText}>
              Step 1 of {totalSteps}
            </Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text variant="h2">Let's start with the basics</Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              We'll keep this between us
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="What's your first name?"
              placeholder="Your first name"
              value={name}
              onChangeText={setNameLocal}
              autoCapitalize="words"
              error={errors.name}
            />

            {/* Birthdate */}
            <View style={styles.fieldContainer}>
              <Text variant="label" style={styles.label}>
                When's your birthday?
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  errors.birthdate && styles.dateButtonError,
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text variant="body">
                  {birthdate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text variant="body" color="secondary">
                  {age} years old
                </Text>
              </TouchableOpacity>
              {errors.birthdate && (
                <Text variant="caption" color="error" style={styles.errorText}>
                  {errors.birthdate}
                </Text>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={birthdate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setBirthdateLocal(date);
                }}
                maximumDate={new Date()}
                minimumDate={new Date(1924, 0, 1)}
              />
            )}

            {/* Gender */}
            <View style={styles.fieldContainer}>
              <Text variant="label" style={styles.label}>
                I am a...
              </Text>
              <View style={styles.optionsRow}>
                {GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={[
                      styles.genderOption,
                      gender === g.value && styles.genderOptionSelected,
                    ]}
                    onPress={() => setGenderLocal(g.value)}
                  >
                    <Text
                      variant="body"
                      weight={gender === g.value ? 'semibold' : 'normal'}
                      style={gender === g.value ? styles.selectedText : undefined}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender && (
                <Text variant="caption" color="error" style={styles.errorText}>
                  {errors.gender}
                </Text>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Button title="Continue" onPress={handleNext} fullWidth />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
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
  form: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    color: Colors.text.primary,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateButtonError: {
    borderColor: Colors.error,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  genderOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderOptionSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  selectedText: {
    color: Colors.primary[600],
  },
  errorText: {
    marginTop: Spacing.xs,
  },
  footer: {
    paddingVertical: Spacing.lg,
  },
});
