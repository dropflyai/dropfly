import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Illustration area */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Text variant="h1" align="center" style={styles.logo}>
              SoulSync
            </Text>
            <Text variant="body" color="secondary" align="center" style={styles.tagline}>
              Connect deeper. Before you see them.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon="🎙️"
            title="Voice First"
            description="Fall for their voice before their face"
          />
          <FeatureItem
            icon="💫"
            title="Connectivity"
            description="Gamified rounds that build real connection"
          />
          <FeatureItem
            icon="✨"
            title="Reveal"
            description="Photos unlock when you're both ready"
          />
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttons}>
          <Button
            title="Create Account"
            onPress={() => router.push('/(auth)/sign-up')}
            fullWidth
          />
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/sign-in')}
            variant="outline"
            fullWidth
          />
        </View>

        <Text variant="caption" color="muted" align="center" style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureText}>
        <Text variant="label" weight="semibold">
          {title}
        </Text>
        <Text variant="bodySmall" color="secondary">
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    color: Colors.primary[500],
    marginBottom: Spacing.sm,
  },
  tagline: {
    maxWidth: 250,
  },
  features: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureText: {
    flex: 1,
  },
  buttons: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  terms: {
    marginBottom: Spacing.lg,
  },
});
