import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Text, Button, Input } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useOnboardingStore, useProfileStore } from '@/lib/store';
import { isValidEmail } from '@/lib/utils';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { setUser, setSession } = useAuthStore();
  const { isCompleted: onboardingCompleted } = useOnboardingStore();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at,
        });
        setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at!,
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
          },
        });

        // Check if onboarding is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();

        if (profile?.onboarding_completed) {
          router.replace('/(main)/discover');
        } else {
          router.replace('/(onboarding)/basics');
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Sign In Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) throw error;

        if (data.user && data.session) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
          });
          setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at!,
            user: {
              id: data.user.id,
              email: data.user.email!,
              created_at: data.user.created_at,
            },
          });

          // Check if onboarding is complete
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', data.user.id)
            .single();

          if (profile?.onboarding_completed) {
            router.replace('/(main)/discover');
          } else {
            router.replace('/(onboarding)/basics');
          }
        }
      }
    } catch (error: unknown) {
      if ((error as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        const message = error instanceof Error ? error.message : 'Apple Sign In failed';
        Alert.alert('Error', message);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !isValidEmail(email)) {
      Alert.alert('Enter Email', 'Please enter your email address first');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());
      if (error) throw error;
      Alert.alert('Check Your Email', 'We sent you a password reset link');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Error', message);
    }
  };

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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text variant="h2">Welcome Back</Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              Sign in to continue your connections
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail-outline"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPassword}
            >
              <Text variant="bodySmall" style={styles.linkText}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="caption" color="muted" style={styles.dividerText}>
                or continue with
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Apple Sign In */}
            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              />
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="body" color="secondary">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-up')}>
              <Text variant="body" style={styles.linkText}>
                Sign Up
              </Text>
            </TouchableOpacity>
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
  header: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  backButton: {
    marginBottom: Spacing.md,
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  form: {
    flex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingVertical: Spacing.lg,
  },
  linkText: {
    color: Colors.primary[500],
    fontWeight: '600',
  },
});
