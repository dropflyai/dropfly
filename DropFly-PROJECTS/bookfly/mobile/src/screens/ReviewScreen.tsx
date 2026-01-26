/**
 * ReviewScreen - Swipeable transaction review cards
 * Features:
 * - Card stack of parsed transactions
 * - Swipe right to approve, left to reject
 * - Edit capability for each card
 * - Confidence badges
 * - Bulk approve option
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { TransactionCard } from '@/components/TransactionCard';
import { useTransactions, Transaction, UpdateTransactionInput } from '@/hooks/useTransactions';
import { ScannedDocument } from '@/lib/scanner';

// ============================================================================
// Types
// ============================================================================

type RootStackParamList = {
  Review: { batchId: string; documents: ScannedDocument[] };
  Dashboard: undefined;
  Scanner: { clientId?: string };
};

type ReviewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Review'>;
type ReviewScreenRouteProp = RouteProp<RootStackParamList, 'Review'>;

interface ReviewItem {
  document: ScannedDocument;
  transaction: Transaction | null;
  status: 'pending' | 'approved' | 'rejected' | 'editing';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

// ============================================================================
// Component
// ============================================================================

export function ReviewScreen() {
  const navigation = useNavigation<ReviewScreenNavigationProp>();
  const route = useRoute<ReviewScreenRouteProp>();
  const { batchId, documents } = route.params;

  // Transactions hook
  const {
    createTransaction,
    updateTransaction,
    approveTransaction,
    rejectTransaction,
    bulkApprove,
    isLoading,
  } = useTransactions();

  // Review state
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(() =>
    documents.map(doc => ({
      document: doc,
      transaction: null,
      status: 'pending' as const,
    }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingItem, setEditingItem] = useState<ReviewItem | null>(null);

  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Current item being reviewed
  const currentItem = reviewItems[currentIndex];
  const remainingCount = reviewItems.filter(item => item.status === 'pending').length;
  const approvedCount = reviewItems.filter(item => item.status === 'approved').length;
  const rejectedCount = reviewItems.filter(item => item.status === 'rejected').length;

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Move to next card
   */
  const goToNextCard = useCallback(() => {
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
      translateX.value = 0;
      translateY.value = 0;
      rotation.value = 0;
    }
  }, [currentIndex, reviewItems.length, translateX, translateY, rotation]);

  /**
   * Handle approve action
   */
  const handleApprove = useCallback(async () => {
    if (!currentItem || isProcessing) return;

    setIsProcessing(true);

    try {
      // Update local state
      setReviewItems(prev =>
        prev.map((item, idx) =>
          idx === currentIndex ? { ...item, status: 'approved' as const } : item
        )
      );

      // If transaction exists, approve it in DB
      if (currentItem.transaction) {
        await approveTransaction(currentItem.transaction.id);
      }

      // Animate out to the right
      translateX.value = withSpring(SCREEN_WIDTH * 1.5, { damping: 15 }, () => {
        runOnJS(goToNextCard)();
      });
    } catch (error) {
      console.error('Approve error:', error);
      Alert.alert('Error', 'Failed to approve transaction');
    } finally {
      setIsProcessing(false);
    }
  }, [currentItem, currentIndex, isProcessing, approveTransaction, translateX, goToNextCard]);

  /**
   * Handle reject action
   */
  const handleReject = useCallback(async () => {
    if (!currentItem || isProcessing) return;

    setIsProcessing(true);

    try {
      // Update local state
      setReviewItems(prev =>
        prev.map((item, idx) =>
          idx === currentIndex ? { ...item, status: 'rejected' as const } : item
        )
      );

      // If transaction exists, reject it in DB
      if (currentItem.transaction) {
        await rejectTransaction(currentItem.transaction.id);
      }

      // Animate out to the left
      translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 15 }, () => {
        runOnJS(goToNextCard)();
      });
    } catch (error) {
      console.error('Reject error:', error);
      Alert.alert('Error', 'Failed to reject transaction');
    } finally {
      setIsProcessing(false);
    }
  }, [currentItem, currentIndex, isProcessing, rejectTransaction, translateX, goToNextCard]);

  /**
   * Handle edit action
   */
  const handleEdit = useCallback((item: ReviewItem) => {
    setEditingItem(item);
  }, []);

  /**
   * Save edited transaction
   */
  const handleSaveEdit = useCallback(
    async (updates: UpdateTransactionInput) => {
      if (!editingItem?.transaction) return;

      try {
        await updateTransaction(editingItem.transaction.id, updates);
        setEditingItem(null);
      } catch (error) {
        console.error('Save edit error:', error);
        Alert.alert('Error', 'Failed to save changes');
      }
    },
    [editingItem, updateTransaction]
  );

  /**
   * Bulk approve all remaining
   */
  const handleBulkApprove = useCallback(async () => {
    const pendingItems = reviewItems.filter(item => item.status === 'pending');

    if (pendingItems.length === 0) return;

    Alert.alert(
      'Approve All',
      `Are you sure you want to approve all ${pendingItems.length} remaining transactions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve All',
          onPress: async () => {
            setIsProcessing(true);
            try {
              // Update local state
              setReviewItems(prev =>
                prev.map(item =>
                  item.status === 'pending' ? { ...item, status: 'approved' as const } : item
                )
              );

              // Bulk approve in DB
              const transactionIds = pendingItems
                .filter(item => item.transaction)
                .map(item => item.transaction!.id);

              if (transactionIds.length > 0) {
                await bulkApprove(transactionIds);
              }

              // Navigate to dashboard
              navigation.navigate('Dashboard');
            } catch (error) {
              console.error('Bulk approve error:', error);
              Alert.alert('Error', 'Failed to approve transactions');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  }, [reviewItems, bulkApprove, navigation]);

  /**
   * Finish review and go to dashboard
   */
  const handleFinish = useCallback(() => {
    if (remainingCount > 0) {
      Alert.alert(
        'Pending Reviews',
        `You still have ${remainingCount} transaction(s) to review. Are you sure you want to exit?`,
        [
          { text: 'Keep Reviewing', style: 'cancel' },
          {
            text: 'Exit',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ]
      );
    } else {
      navigation.navigate('Dashboard');
    }
  }, [remainingCount, navigation]);

  // ============================================================================
  // Gesture Handling
  // ============================================================================

  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5; // Dampen vertical movement
      rotation.value = (event.translationX / SCREEN_WIDTH) * 15; // Rotate based on swipe
    })
    .onEnd(event => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right - approve
        runOnJS(handleApprove)();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left - reject
        runOnJS(handleReject)();
      } else {
        // Reset position
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  // ============================================================================
  // Render
  // ============================================================================

  // All reviewed
  if (currentIndex >= reviewItems.length) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>Review Complete</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{approvedCount}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{rejectedCount}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.finishButton} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.finishButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleFinish}>
            <Text style={styles.headerButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentIndex + 1} of {reviewItems.length}
          </Text>
          <TouchableOpacity onPress={handleBulkApprove} disabled={remainingCount === 0}>
            <Text style={[styles.headerButton, remainingCount === 0 && styles.headerButtonDisabled]}>
              Approve All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((currentIndex + 1) / reviewItems.length) * 100}%` }]} />
        </View>

        {/* Card Stack */}
        <View style={styles.cardContainer}>
          {/* Background cards (next in stack) */}
          {reviewItems.slice(currentIndex + 1, currentIndex + 3).map((item, idx) => (
            <View
              key={item.document.id}
              style={[
                styles.stackedCard,
                {
                  top: 20 - idx * 8,
                  transform: [{ scale: 1 - (idx + 1) * 0.05 }],
                  opacity: 0.8 - idx * 0.2,
                },
              ]}
            >
              <TransactionCard
                transaction={item.transaction}
                document={item.document}
                disabled
              />
            </View>
          ))}

          {/* Current card (swipeable) */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.currentCard, animatedCardStyle]}>
              {/* Swipe indicators */}
              <View style={[styles.swipeIndicator, styles.swipeIndicatorLeft]}>
                <Text style={styles.swipeIndicatorText}>REJECT</Text>
              </View>
              <View style={[styles.swipeIndicator, styles.swipeIndicatorRight]}>
                <Text style={styles.swipeIndicatorText}>APPROVE</Text>
              </View>

              <TransactionCard
                transaction={currentItem.transaction}
                document={currentItem.document}
                onEdit={() => handleEdit(currentItem)}
              />
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Reject</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(currentItem)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={handleApprove}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Approve</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Swipe right to approve, left to reject
        </Text>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtonDisabled: {
    color: '#666',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Progress
  progressContainer: {
    height: 4,
    backgroundColor: '#333',
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },

  // Card Stack
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  stackedCard: {
    position: 'absolute',
    width: '100%',
    alignSelf: 'center',
  },
  currentCard: {
    width: '100%',
  },

  // Swipe Indicators
  swipeIndicator: {
    position: 'absolute',
    top: '40%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
    zIndex: 100,
  },
  swipeIndicatorLeft: {
    left: 20,
    borderColor: '#F44336',
    transform: [{ rotate: '-15deg' }],
  },
  swipeIndicatorRight: {
    right: 20,
    borderColor: '#4CAF50',
    transform: [{ rotate: '15deg' }],
  },
  swipeIndicatorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Action Buttons
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  actionButton: {
    width: 100,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Instructions
  instructions: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    paddingBottom: 16,
  },

  // Completed Screen
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 48,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 32,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ReviewScreen;
