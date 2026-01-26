/**
 * BookFly Mobile App - Main Entry Point
 *
 * Features:
 * - Bottom tab navigation (Dashboard, Scan, Review, Clients, Settings)
 * - Auth wrapper with session management
 * - Supabase session listener
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAuth } from '@/hooks/useAuth';

// Screens
import { DashboardScreen } from '@/screens/DashboardScreen';
import { ScannerScreen } from '@/screens/ScannerScreen';
import { ReviewScreen } from '@/screens/ReviewScreen';
import { ClientsScreen } from '@/screens/ClientsScreen';

// ============================================================================
// Types
// ============================================================================

type RootStackParamList = {
  Main: undefined;
  Scanner: { clientId?: string };
  Review: { batchId: string; documents: [] };
};

type TabParamList = {
  Dashboard: undefined;
  Clients: undefined;
  ScanTab: undefined;
  ReviewTab: undefined;
  Settings: undefined;
};

// ============================================================================
// Navigation Setup
// ============================================================================

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Custom dark theme
const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50',
    background: '#1a1a2e',
    card: '#2a2a4e',
    text: '#ffffff',
    border: '#3a3a5e',
    notification: '#FF9800',
  },
};

// ============================================================================
// Tab Navigator
// ============================================================================

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: 'D',
    Clients: 'C',
    Scan: 'S',
    Review: 'R',
    Settings: '⚙',
  };

  return (
    <View
      style={[
        styles.tabIcon,
        focused && styles.tabIconFocused,
      ]}
    >
      <Text style={[styles.tabIconText, focused && styles.tabIconTextFocused]}>
        {icons[name] || '?'}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Dashboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Clients" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ScanTab"
        component={ScanPlaceholder}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ focused }) => <TabIcon name="Scan" focused={focused} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('Scanner');
          },
        })}
      />
      <Tab.Screen
        name="ReviewTab"
        component={ReviewPlaceholder}
        options={{
          tabBarLabel: 'Review',
          tabBarIcon: ({ focused }) => <TabIcon name="Review" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Placeholder for scan tab (actual scanner is a modal/stack screen)
function ScanPlaceholder() {
  return null;
}

// Placeholder for review tab
function ReviewPlaceholder() {
  return (
    <SafeAreaView style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>No transactions to review</Text>
      <Text style={styles.placeholderSubtext}>
        Scan some receipts to get started
      </Text>
    </SafeAreaView>
  );
}

// ============================================================================
// Settings Screen
// ============================================================================

function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.settingsContainer}>
      <StatusBar barStyle="light-content" />

      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>Settings</Text>
      </View>

      <View style={styles.settingsContent}>
        {/* User Info */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Account</Text>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemLabel}>Email</Text>
            <Text style={styles.settingsItemValue}>{user?.email || 'Not signed in'}</Text>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>About</Text>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemLabel}>Version</Text>
            <Text style={styles.settingsItemValue}>1.0.0</Text>
          </View>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemLabel}>Build</Text>
            <Text style={styles.settingsItemValue}>1</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// Auth Screen
// ============================================================================

function AuthScreen() {
  const { signIn, signUp, error, isLoading, clearError } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both email and password');
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert(
          'Check Your Email',
          'We sent you a confirmation link. Please verify your email to continue.'
        );
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      // Error is handled by the hook and displayed via the error state
    }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.authContent}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo / Title */}
        <View style={styles.authHeader}>
          <Text style={styles.authLogo}>BookFly</Text>
          <Text style={styles.authTagline}>Smart Receipt Management</Text>
        </View>

        {/* Form */}
        <View style={styles.authForm}>
          <TextInput
            style={styles.authInput}
            value={email}
            onChangeText={text => {
              setEmail(text);
              clearError();
            }}
            placeholder="Email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.authInput}
            value={password}
            onChangeText={text => {
              setPassword(text);
              clearError();
            }}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry
          />

          {error && <Text style={styles.authError}>{error}</Text>}

          <TouchableOpacity
            style={[styles.authButton, isLoading && styles.authButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.authButtonText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authToggle}
            onPress={() => {
              setIsSignUp(!isSignUp);
              clearError();
            }}
          >
            <Text style={styles.authToggleText}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================================
// Loading Screen
// ============================================================================

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

// ============================================================================
// Main App Component
// ============================================================================

function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1a1a2e' },
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer theme={DarkTheme}>
        {isAuthenticated ? <AppNavigator /> : <AuthScreen />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    marginTop: 16,
  },

  // Tab Bar
  tabBar: {
    backgroundColor: '#2a2a4e',
    borderTopWidth: 0,
    height: 80,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3a3a5e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconFocused: {
    backgroundColor: '#4CAF50',
  },
  tabIconText: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabIconTextFocused: {
    color: '#fff',
  },

  // Placeholder
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 32,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },

  // Auth
  authContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  authContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  authLogo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  authTagline: {
    fontSize: 16,
    color: '#888',
  },
  authForm: {
    width: '100%',
  },
  authInput: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  authError: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  authButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  authToggle: {
    alignItems: 'center',
    padding: 8,
  },
  authToggleText: {
    color: '#888',
    fontSize: 14,
  },

  // Settings
  settingsContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  settingsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  settingsSection: {
    marginBottom: 32,
  },
  settingsSectionTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a4e',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingsItemLabel: {
    color: '#fff',
    fontSize: 16,
  },
  settingsItemValue: {
    color: '#888',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 32,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
