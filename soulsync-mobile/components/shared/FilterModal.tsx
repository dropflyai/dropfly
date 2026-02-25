import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Text, Button, Card } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import type { RelationshipGoal } from '@/types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: DiscoveryFilters) => void;
  initialFilters?: DiscoveryFilters;
}

export interface DiscoveryFilters {
  minAge: number;
  maxAge: number;
  showMe: 'men' | 'women' | 'everyone';
  relationshipGoals: RelationshipGoal[];
}

const SHOW_ME_OPTIONS: { value: DiscoveryFilters['showMe']; label: string }[] = [
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'everyone', label: 'Everyone' },
];

const GOAL_OPTIONS: { value: RelationshipGoal; label: string }[] = [
  { value: 'long-term', label: 'Long-term' },
  { value: 'short-term', label: 'Short-term' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendship', label: 'Friendship' },
  { value: 'not-sure', label: 'Not sure' },
];

const DEFAULT_FILTERS: DiscoveryFilters = {
  minAge: 18,
  maxAge: 50,
  showMe: 'everyone',
  relationshipGoals: [],
};

export function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters = DEFAULT_FILTERS,
}: FilterModalProps) {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<DiscoveryFilters>(initialFilters);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      loadPreferences();
    }
  }, [visible]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setFilters({
          minAge: data.min_age || DEFAULT_FILTERS.minAge,
          maxAge: data.max_age || DEFAULT_FILTERS.maxAge,
          showMe: data.show_me || DEFAULT_FILTERS.showMe,
          relationshipGoals: data.relationship_goals || [],
        });
      }
    } catch (error) {
      // No preferences saved yet
    }
  };

  const handleApply = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await supabase.from('user_preferences').upsert({
        user_id: user.id,
        min_age: filters.minAge,
        max_age: filters.maxAge,
        show_me: filters.showMe,
        relationship_goals: filters.relationshipGoals,
      }, {
        onConflict: 'user_id',
      });

      onApply(filters);
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleGoal = (goal: RelationshipGoal) => {
    setFilters((prev) => ({
      ...prev,
      relationshipGoals: prev.relationshipGoals.includes(goal)
        ? prev.relationshipGoals.filter((g) => g !== goal)
        : [...prev.relationshipGoals, goal],
    }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
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
          <Text variant="h4">Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text variant="body" style={styles.resetText}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Age Range */}
          <View style={styles.section}>
            <Text variant="label" style={styles.sectionTitle}>
              AGE RANGE
            </Text>
            <Text variant="h4" align="center" style={styles.ageDisplay}>
              {filters.minAge} - {filters.maxAge}
            </Text>

            <View style={styles.sliderContainer}>
              <Text variant="caption" color="muted">
                {filters.minAge}
              </Text>
              <View style={styles.sliderWrapper}>
                <Slider
                  style={styles.slider}
                  minimumValue={18}
                  maximumValue={filters.maxAge - 1}
                  value={filters.minAge}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, minAge: Math.round(value) }))
                  }
                  minimumTrackTintColor={Colors.primary[500]}
                  maximumTrackTintColor={Colors.neutral[200]}
                  thumbTintColor={Colors.primary[500]}
                />
                <Slider
                  style={styles.slider}
                  minimumValue={filters.minAge + 1}
                  maximumValue={100}
                  value={filters.maxAge}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, maxAge: Math.round(value) }))
                  }
                  minimumTrackTintColor={Colors.primary[500]}
                  maximumTrackTintColor={Colors.neutral[200]}
                  thumbTintColor={Colors.primary[500]}
                />
              </View>
              <Text variant="caption" color="muted">
                {filters.maxAge}
              </Text>
            </View>
          </View>

          {/* Show Me */}
          <View style={styles.section}>
            <Text variant="label" style={styles.sectionTitle}>
              SHOW ME
            </Text>
            <View style={styles.optionsRow}>
              {SHOW_ME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    filters.showMe === option.value && styles.optionSelected,
                  ]}
                  onPress={() =>
                    setFilters((prev) => ({ ...prev, showMe: option.value }))
                  }
                >
                  <Text
                    variant="body"
                    weight={filters.showMe === option.value ? 'semibold' : 'normal'}
                    style={
                      filters.showMe === option.value ? styles.optionTextSelected : undefined
                    }
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Relationship Goals */}
          <View style={styles.section}>
            <Text variant="label" style={styles.sectionTitle}>
              LOOKING FOR
            </Text>
            <Text variant="caption" color="muted" style={styles.sectionHint}>
              Select all that apply (leave empty for any)
            </Text>
            <View style={styles.goalsContainer}>
              {GOAL_OPTIONS.map((option) => {
                const isSelected = filters.relationshipGoals.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.goalChip,
                      isSelected && styles.goalChipSelected,
                    ]}
                    onPress={() => toggleGoal(option.value)}
                  >
                    <Text
                      variant="bodySmall"
                      style={isSelected ? styles.goalChipTextSelected : undefined}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary[600]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Apply Filters"
            onPress={handleApply}
            fullWidth
            loading={isSaving}
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
  resetText: {
    color: Colors.primary[500],
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
  sectionHint: {
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
  },
  ageDisplay: {
    marginBottom: Spacing.md,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sliderWrapper: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  optionTextSelected: {
    color: Colors.primary[600],
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalChipSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  goalChipTextSelected: {
    color: Colors.primary[600],
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
});
