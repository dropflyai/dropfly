import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Card } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({ errorInfo });

    // TODO: Send to error tracking service like Sentry
    // Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={64} color={Colors.error} />
            </View>

            {/* Error Message */}
            <Text variant="h3" align="center" style={styles.title}>
              Something went wrong
            </Text>
            <Text variant="body" color="secondary" align="center" style={styles.description}>
              We're sorry, but something unexpected happened. Please try again or restart the app.
            </Text>

            {/* Error Details (development only) */}
            {__DEV__ && this.state.error && (
              <Card variant="outlined" style={styles.errorCard}>
                <Text variant="label" color="muted" style={styles.errorLabel}>
                  ERROR DETAILS
                </Text>
                <ScrollView style={styles.errorScroll} showsVerticalScrollIndicator={false}>
                  <Text variant="bodySmall" style={styles.errorText}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text variant="caption" color="muted" style={styles.stackTrace}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </ScrollView>
              </Card>
            )}

            {/* Retry Button */}
            <View style={styles.actions}>
              <Button
                title="Try Again"
                onPress={this.handleRetry}
                fullWidth
                size="lg"
              />
            </View>

            {/* Support Link */}
            <Text variant="caption" color="muted" align="center" style={styles.supportText}>
              If this keeps happening, please contact support
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  description: {
    maxWidth: 300,
    marginBottom: Spacing.xl,
  },
  errorCard: {
    width: '100%',
    maxHeight: 200,
    marginBottom: Spacing.lg,
  },
  errorLabel: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  errorScroll: {
    maxHeight: 150,
  },
  errorText: {
    color: Colors.error,
    fontFamily: 'monospace',
  },
  stackTrace: {
    marginTop: Spacing.sm,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  actions: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  supportText: {
    marginTop: Spacing.md,
  },
});

export default ErrorBoundary;
