import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button } from '@/components/ui';
import { VoicePlayer } from '@/components/voice';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore, useProfileStore, useOnboardingStore } from '@/lib/store';
import { supabase, signOut } from '@/lib/supabase';
import { capitalize } from '@/lib/utils';
import type { UserProfile } from '@/types';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { profile, setProfile, setLoading, isLoading } = useProfileStore();
  const { resetOnboarding } = useOnboardingStore();

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              logout();
              resetOnboarding();
              router.replace('/(auth)');
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ]
    );
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h3">Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text variant="h1" style={styles.avatarText}>
              {profile.name?.charAt(0) || '?'}
            </Text>
          </View>

          <Text variant="h2" align="center">
            {profile.name}
          </Text>
          <Text variant="body" color="secondary" align="center">
            {profile.age} years old • {profile.location}
          </Text>

          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color={Colors.primary[500]} />
            <Text variant="bodySmall" style={styles.editText}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Voice Intro */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="label" color="muted">
              VOICE INTRO
            </Text>
            <TouchableOpacity>
              <Text variant="bodySmall" style={styles.editText}>
                Re-record
              </Text>
            </TouchableOpacity>
          </View>
          {profile.voice_intro_url ? (
            <VoicePlayer uri={profile.voice_intro_url} />
          ) : (
            <Text variant="body" color="muted">
              No voice intro recorded
            </Text>
          )}
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <Text variant="label" color="muted" style={styles.sectionLabel}>
            ABOUT ME
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="heart-outline" size={20} color={Colors.neutral[500]} />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" color="muted">
                Looking for
              </Text>
              <Text variant="body">
                {capitalize(profile.relationship_goal?.replace('-', ' ') || 'Not set')}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="star-outline" size={20} color={Colors.neutral[500]} />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" color="muted">
                Core Values
              </Text>
              <View style={styles.tags}>
                {profile.core_values?.map((value) => (
                  <View key={value} style={styles.tag}>
                    <Text variant="caption">{capitalize(value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="link-outline" size={20} color={Colors.neutral[500]} />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" color="muted">
                Attachment Style
              </Text>
              <Text variant="body">
                {capitalize(profile.attachment_style?.replace('-', ' ') || 'Not set')}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.neutral[500]} />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" color="muted">
                Love Languages
              </Text>
              <View style={styles.tags}>
                {profile.love_languages?.map((lang) => (
                  <View key={lang} style={styles.tag}>
                    <Text variant="caption">{capitalize(lang.replace(/-/g, ' '))}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="help-circle-outline" size={24} color={Colors.text.secondary} />
            <Text variant="body">Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="shield-outline" size={24} color={Colors.text.secondary} />
            <Text variant="body">Privacy & Safety</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="document-text-outline" size={24} color={Colors.text.secondary} />
            <Text variant="body">Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="ghost"
          fullWidth
          style={styles.signOutButton}
        />

        <Text variant="caption" color="muted" align="center" style={styles.version}>
          SoulSync v1.0.0
        </Text>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingsButton: {
    padding: Spacing.xs,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: Colors.primary[600],
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
  editText: {
    color: Colors.primary[500],
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    marginBottom: Spacing.md,
    fontSize: 11,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.neutral[100],
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  actions: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  signOutButton: {
    marginBottom: Spacing.md,
  },
  version: {
    marginBottom: Spacing.lg,
  },
});
