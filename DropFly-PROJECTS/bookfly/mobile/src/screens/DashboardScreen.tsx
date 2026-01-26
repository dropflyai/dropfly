/**
 * DashboardScreen - Main landing screen
 * Features:
 * - Current client indicator
 * - Stats: transactions today, pending review, sync status
 * - Quick action buttons (Scan, Review)
 * - Recent activity feed
 * - Last synced timestamp
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ClientPicker } from '@/components/ClientPicker';
import { useAuth } from '@/hooks/useAuth';
import { useClients, Client } from '@/hooks/useClients';
import { useTransactions, Transaction } from '@/hooks/useTransactions';

// ============================================================================
// Types
// ============================================================================

type RootStackParamList = {
  Dashboard: undefined;
  Scanner: { clientId?: string };
  Review: { batchId: string; documents: [] };
  Clients: undefined;
  Settings: undefined;
};

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface ActivityItem {
  id: string;
  type: 'scan' | 'approve' | 'reject' | 'sync';
  message: string;
  timestamp: Date;
  clientName?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Stat card component
 */
function StatCard({
  title,
  value,
  subtitle,
  color = '#4CAF50',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

/**
 * Quick action button
 */
function QuickAction({
  title,
  subtitle,
  onPress,
  color = '#4CAF50',
  disabled = false,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: color }, disabled && styles.quickActionDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.quickActionTitle}>{title}</Text>
      {subtitle && <Text style={styles.quickActionSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
}

/**
 * Activity item component
 */
function ActivityItemRow({ item }: { item: ActivityItem }) {
  const iconColors = {
    scan: '#2196F3',
    approve: '#4CAF50',
    reject: '#F44336',
    sync: '#9C27B0',
  };

  const icons = {
    scan: '[S]',
    approve: '[A]',
    reject: '[R]',
    sync: '[~]',
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: iconColors[item.type] }]}>
        <Text style={styles.activityIconText}>{icons[item.type]}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{item.message}</Text>
        <Text style={styles.activityTime}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();

  // Hooks
  const { user, signOut } = useAuth();
  const { clients, activeClient, activeClientId, setActiveClient, fetchClients } = useClients();
  const {
    transactions,
    pendingCount,
    syncedCount,
    fetchTransactions,
    syncTransactions,
    isSyncing,
  } = useTransactions();

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // ============================================================================
  // Computed Values
  // ============================================================================

  // Get today's transactions
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayTransactions = transactions.filter(
    t => t.clientId === activeClientId && t.createdAt >= todayStart
  );

  const approvedToday = todayTransactions.filter(t => t.status === 'approved').length;

  // Pending for active client
  const pendingForClient = transactions.filter(
    t => t.clientId === activeClientId && t.status === 'pending_review'
  ).length;

  // Last synced time
  const lastSyncedAt = activeClient?.lastSyncedAt;

  const formatLastSynced = (date: Date | null) => {
    if (!date) return 'Never';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return date.toLocaleDateString();
  };

  // ============================================================================
  // Effects
  // ============================================================================

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchClients();
      fetchTransactions();
    }, [fetchClients, fetchTransactions])
  );

  // Generate activity feed from transactions
  useEffect(() => {
    const activities: ActivityItem[] = transactions
      .filter(t => t.clientId === activeClientId)
      .slice(0, 10)
      .map(t => {
        let type: ActivityItem['type'] = 'scan';
        let message = 'Document scanned';

        if (t.status === 'approved') {
          type = 'approve';
          message = `Approved ${t.vendor || 'transaction'} - $${t.amount?.toFixed(2) || '0.00'}`;
        } else if (t.status === 'rejected') {
          type = 'reject';
          message = `Rejected ${t.vendor || 'transaction'}`;
        } else if (t.syncStatus === 'synced') {
          type = 'sync';
          message = `Synced ${t.vendor || 'transaction'} to accounting`;
        }

        return {
          id: t.id,
          type,
          message,
          timestamp: t.updatedAt,
          clientName: activeClient?.name,
        };
      });

    setRecentActivity(activities);
  }, [transactions, activeClientId, activeClient]);

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchClients(), fetchTransactions()]);
    setRefreshing(false);
  }, [fetchClients, fetchTransactions]);

  /**
   * Handle client selection
   */
  const handleClientSelect = useCallback(
    (clientId: string) => {
      setActiveClient(clientId);
      setShowClientPicker(false);
    },
    [setActiveClient]
  );

  /**
   * Navigate to scanner
   */
  const handleScan = useCallback(() => {
    if (!activeClientId) {
      setShowClientPicker(true);
      return;
    }
    navigation.navigate('Scanner', { clientId: activeClientId });
  }, [activeClientId, navigation]);

  /**
   * Navigate to review
   */
  const handleReview = useCallback(() => {
    // Navigate to review with pending transactions
    // In production, this would gather pending transactions into a batch
    navigation.navigate('Review', { batchId: 'pending', documents: [] });
  }, [navigation]);

  /**
   * Trigger sync for active client
   */
  const handleSync = useCallback(async () => {
    if (!activeClientId) return;

    try {
      await syncTransactions(activeClientId);
    } catch (error) {
      console.error('Sync error:', error);
    }
  }, [activeClientId, syncTransactions]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4CAF50" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.email?.split('@')[0] || 'there'}
            </Text>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Active Client Indicator */}
        <TouchableOpacity
          style={styles.clientIndicator}
          onPress={() => setShowClientPicker(true)}
        >
          {activeClient ? (
            <>
              <View style={styles.clientAvatar}>
                <Text style={styles.clientAvatarText}>
                  {activeClient.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{activeClient.name}</Text>
                <Text style={styles.clientStatus}>
                  {activeClient.syncStatus === 'synced' ? 'Synced' : 'Sync pending'}
                </Text>
              </View>
              <Text style={styles.clientChevron}>Switch</Text>
            </>
          ) : (
            <View style={styles.noClientContainer}>
              <Text style={styles.noClientText}>Select a client to get started</Text>
              <Text style={styles.clientChevron}>Select</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Today"
            value={todayTransactions.length}
            subtitle={`${approvedToday} approved`}
            color="#2196F3"
          />
          <StatCard
            title="Pending"
            value={pendingForClient}
            subtitle="Need review"
            color={pendingForClient > 0 ? '#FF9800' : '#4CAF50'}
          />
          <StatCard
            title="Synced"
            value={syncedCount}
            subtitle={formatLastSynced(lastSyncedAt)}
            color="#4CAF50"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <QuickAction
              title="Scan"
              subtitle="Capture receipts"
              onPress={handleScan}
              color="#2196F3"
            />
            <QuickAction
              title="Review"
              subtitle={`${pendingForClient} pending`}
              onPress={handleReview}
              color="#FF9800"
              disabled={pendingForClient === 0}
            />
          </View>
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
            onPress={handleSync}
            disabled={isSyncing || !activeClientId}
          >
            {isSyncing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.syncButtonText}>Sync to Accounting</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>
                No recent activity. Start scanning receipts!
              </Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {recentActivity.map(item => (
                <ActivityItemRow key={item.id} item={item} />
              ))}
            </View>
          )}
        </View>

        {/* Last Synced Info */}
        <View style={styles.lastSyncedContainer}>
          <Text style={styles.lastSyncedLabel}>Last synced:</Text>
          <Text style={styles.lastSyncedValue}>{formatLastSynced(lastSyncedAt)}</Text>
        </View>
      </ScrollView>

      {/* Client Picker Modal */}
      <ClientPicker
        visible={showClientPicker}
        clients={clients}
        selectedClientId={activeClientId}
        onSelect={handleClientSelect}
        onClose={() => setShowClientPicker(false)}
      />
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    color: '#888',
  },

  // Client Indicator
  clientIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a4e',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clientAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  clientStatus: {
    color: '#888',
    fontSize: 12,
  },
  clientChevron: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  noClientContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noClientText: {
    color: '#888',
    fontSize: 14,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statTitle: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    color: '#666',
    fontSize: 10,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  quickAction: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickActionDisabled: {
    opacity: 0.5,
  },
  quickActionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  syncButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Activity
  activityList: {
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  activityTime: {
    color: '#666',
    fontSize: 12,
  },
  emptyActivity: {
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyActivityText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },

  // Last Synced
  lastSyncedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  lastSyncedLabel: {
    color: '#666',
    fontSize: 12,
    marginRight: 4,
  },
  lastSyncedValue: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DashboardScreen;
