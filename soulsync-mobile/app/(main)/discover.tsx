import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button } from '@/components/ui';
import { VoicePlayer } from '@/components/voice';
import { FilterModal, type DiscoveryFilters } from '@/components/shared/FilterModal';
import { ReportModal } from '@/components/shared/ReportModal';
import { Colors, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useDiscoveryStore, useAuthStore, useMatchStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { calculateCompatibility } from '@/lib/ai';
import type { DiscoveryProfile } from '@/types';

const { width } = Dimensions.get('window');

export default function DiscoverScreen() {
  const { user } = useAuthStore();
  const {
    profiles,
    currentIndex,
    isLoading,
    setProfiles,
    nextProfile,
    setLoading,
    removeProfile,
  } = useDiscoveryStore();
  const { addConnectionRequest } = useMatchStore();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DiscoveryFilters | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const currentProfile = profiles[currentIndex];

  const fetchProfiles = useCallback(async (appliedFilters?: DiscoveryFilters) => {
    if (!user) return;

    setLoading(true);
    try {
      // First, get current user's profile for compatibility calculation
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('core_values, attachment_style, relationship_goal, love_languages')
        .eq('id', user.id)
        .single();

      // Build query with filters
      let query = supabase
        .from('profiles')
        .select('id, name, age, location, voice_intro_url, relationship_goal, core_values, gender, attachment_style, love_languages')
        .neq('id', user.id)
        .eq('onboarding_completed', true)
        .eq('location', 'Los Angeles'); // MVP: LA only

      // Apply filters
      const activeFilters = appliedFilters || filters;
      if (activeFilters) {
        if (activeFilters.minAge) {
          query = query.gte('age', activeFilters.minAge);
        }
        if (activeFilters.maxAge) {
          query = query.lte('age', activeFilters.maxAge);
        }
        if (activeFilters.showMe !== 'everyone') {
          const genderFilter = activeFilters.showMe === 'men' ? 'male' : 'female';
          query = query.eq('gender', genderFilter);
        }
        if (activeFilters.relationshipGoals?.length > 0) {
          query = query.in('relationship_goal', activeFilters.relationshipGoals);
        }
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;

      const discoveryProfiles: DiscoveryProfile[] = (data || []).map((p) => {
        // Calculate real compatibility score
        const myValues = myProfile?.core_values || [];
        const theirValues = p.core_values || [];
        const sharedValues = myValues.filter((v: string) => theirValues.includes(v));

        const compatibility = calculateCompatibility({
          sharedValues,
          user1Values: myValues,
          user2Values: theirValues,
          user1AttachmentStyle: myProfile?.attachment_style || 'secure',
          user2AttachmentStyle: p.attachment_style || 'secure',
          user1RelationshipGoal: myProfile?.relationship_goal || 'not-sure',
          user2RelationshipGoal: p.relationship_goal || 'not-sure',
          user1LoveLanguages: myProfile?.love_languages || [],
          user2LoveLanguages: p.love_languages || [],
        });

        return {
          id: p.id,
          name: p.name,
          age: p.age,
          location: p.location,
          voice_intro_url: p.voice_intro_url,
          relationship_goal: p.relationship_goal,
          core_values: p.core_values || [],
          compatibility_preview: compatibility,
        };
      });

      // Sort by compatibility (highest first)
      discoveryProfiles.sort((a, b) => b.compatibility_preview - a.compatibility_preview);

      setProfiles(discoveryProfiles);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filters, setProfiles, setLoading]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handlePass = () => {
    nextProfile();
  };

  const handleConnect = () => {
    if (!currentProfile) return;
    router.push({
      pathname: '/(main)/send-request',
      params: {
        profileId: currentProfile.id,
        profileName: currentProfile.name,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text variant="body" color="secondary" style={styles.loadingText}>
            Finding people for you...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color={Colors.neutral[300]} />
          <Text variant="h3" align="center" style={styles.emptyTitle}>
            No more profiles
          </Text>
          <Text variant="body" color="secondary" align="center">
            Check back later for new people to discover
          </Text>
          <Button
            title="Refresh"
            onPress={fetchProfiles}
            variant="outline"
            style={styles.refreshButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleApplyFilters = (newFilters: DiscoveryFilters) => {
    setFilters(newFilters);
    fetchProfiles(newFilters);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        initialFilters={filters || undefined}
      />

      {/* Report Modal */}
      {currentProfile && (
        <ReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUserId={currentProfile.id}
          reportedUserName={currentProfile.name}
          onReportSubmitted={() => {
            setShowReportModal(false);
            nextProfile();
          }}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3">Discover</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.filterButton, filters && styles.filterButtonActive]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons
              name="options-outline"
              size={24}
              color={filters ? Colors.primary[500] : Colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Card */}
      <View style={styles.cardContainer}>
        <Card style={styles.profileCard} padding="lg">
          {/* Name & Age */}
          <View style={styles.profileHeader}>
            <View style={styles.profileHeaderLeft}>
              <Text variant="h2">
                {currentProfile.name}, {currentProfile.age}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={Colors.neutral[400]} />
                <Text variant="bodySmall" color="secondary">
                  {currentProfile.location}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => setShowReportModal(true)}
            >
              <Ionicons name="flag-outline" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          {/* Compatibility Preview */}
          <View style={styles.compatibilityBadge}>
            <Text variant="caption" style={styles.compatibilityText}>
              {currentProfile.compatibility_preview}% compatibility
            </Text>
          </View>

          {/* Voice Intro */}
          <View style={styles.voiceSection}>
            <Text variant="label" color="muted" style={styles.sectionLabel}>
              VOICE INTRO
            </Text>
            {currentProfile.voice_intro_url ? (
              <VoicePlayer uri={currentProfile.voice_intro_url} />
            ) : (
              <View style={styles.noVoice}>
                <Text variant="body" color="muted">
                  No voice intro yet
                </Text>
              </View>
            )}
          </View>

          {/* Values */}
          <View style={styles.valuesSection}>
            <Text variant="label" color="muted" style={styles.sectionLabel}>
              VALUES
            </Text>
            <View style={styles.valuesTags}>
              {currentProfile.core_values.slice(0, 3).map((value) => (
                <View key={value} style={styles.valueTag}>
                  <Text variant="caption">{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Goal */}
          <View style={styles.goalSection}>
            <Text variant="label" color="muted" style={styles.sectionLabel}>
              LOOKING FOR
            </Text>
            <Text variant="body">
              {currentProfile.relationship_goal?.replace('-', ' ')}
            </Text>
          </View>
        </Card>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={handlePass}
        >
          <Ionicons name="close" size={32} color={Colors.neutral[500]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.connectButton]}
          onPress={handleConnect}
        >
          <Ionicons name="mic" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text variant="caption" color="muted" align="center" style={styles.hint}>
        Tap the mic to send a voice connection request
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  refreshButton: {
    marginTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterButton: {
    padding: Spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  profileCard: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  profileHeaderLeft: {
    flex: 1,
  },
  reportButton: {
    padding: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  compatibilityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary[100],
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  compatibilityText: {
    color: Colors.primary[600],
    fontWeight: '600',
  },
  voiceSection: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    fontSize: 11,
    letterSpacing: 1,
  },
  noVoice: {
    padding: Spacing.lg,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  valuesSection: {
    marginBottom: Spacing.lg,
  },
  valuesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  valueTag: {
    backgroundColor: Colors.neutral[100],
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  goalSection: {
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  passButton: {
    backgroundColor: Colors.background.light,
  },
  connectButton: {
    backgroundColor: Colors.primary[500],
  },
  hint: {
    paddingBottom: Spacing.lg,
  },
});
