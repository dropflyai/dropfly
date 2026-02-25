import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useMatchStore, useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime, formatTimeRemaining, getSecondsUntilDeadline } from '@/lib/utils';
import type { Match } from '@/types';

interface ConnectionItem {
  match: Match;
  partnerName: string;
  currentRound: number;
  deadline: string | null;
  hasUnread: boolean;
}

export default function ConnectionsScreen() {
  const { user } = useAuthStore();
  const { matches, setMatches, setLoading, isLoading } = useMatchStore();

  const [connections, setConnections] = useState<ConnectionItem[]>([]);

  const fetchConnections = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch matches where user is either user1 or user2
      const { data: matchData, error } = await supabase
        .from('matches')
        .select(`
          *,
          user1:profiles!matches_user1_id_fkey(id, name),
          user2:profiles!matches_user2_id_fkey(id, name),
          rounds:connectivity_rounds(deadline_at, status)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .in('status', ['active', 'completed'])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const connectionItems: ConnectionItem[] = (matchData || []).map((m) => {
        const isUser1 = m.user1_id === user.id;
        const partner = isUser1 ? m.user2 : m.user1;
        const activeRound = m.rounds?.find((r: { status: string }) => r.status === 'pending');

        return {
          match: m,
          partnerName: partner?.name || 'Unknown',
          currentRound: m.current_round,
          deadline: activeRound?.deadline_at || null,
          hasUnread: false, // TODO: implement read tracking
        };
      });

      setConnections(connectionItems);
      setMatches(matchData || []);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  }, [user, setMatches, setLoading]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return Colors.success;
      case 'completed':
        return Colors.primary[500];
      default:
        return Colors.neutral[400];
    }
  };

  const renderConnection = ({ item }: { item: ConnectionItem }) => {
    const timeRemaining = item.deadline
      ? getSecondsUntilDeadline(item.deadline)
      : null;
    const isUrgent = timeRemaining !== null && timeRemaining < 3600; // < 1 hour

    return (
      <TouchableOpacity
        onPress={() => {
          // Navigate to connectivity round
          router.push(`/(connectivity)/${item.match.id}`);
        }}
      >
        <Card style={styles.connectionCard}>
          <View style={styles.cardHeader}>
            {/* Avatar placeholder */}
            <View style={styles.avatar}>
              <Text variant="h4" style={styles.avatarText}>
                {item.partnerName.charAt(0)}
              </Text>
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text variant="body" weight="semibold">
                  {item.partnerName}
                </Text>
                {item.hasUnread && <View style={styles.unreadDot} />}
              </View>
              <Text variant="bodySmall" color="secondary">
                Round {item.currentRound} of Connectivity
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(item.match.status) },
                ]}
              />
            </View>
          </View>

          {/* Timer */}
          {timeRemaining !== null && (
            <View
              style={[
                styles.timerRow,
                isUrgent && styles.timerUrgent,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={isUrgent ? Colors.error : Colors.neutral[500]}
              />
              <Text
                variant="bodySmall"
                color={isUrgent ? 'error' : 'secondary'}
              >
                {formatTimeRemaining(timeRemaining)} remaining
              </Text>
            </View>
          )}

          {/* Action hint */}
          <View style={styles.actionHint}>
            <Text variant="caption" color="muted">
              Tap to continue
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.neutral[400]}
            />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3">Connections</Text>
      </View>

      {connections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={Colors.neutral[300]} />
          <Text variant="h4" align="center" style={styles.emptyTitle}>
            No active connections
          </Text>
          <Text variant="body" color="secondary" align="center">
            When someone accepts your connection request or you accept theirs,
            they'll appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={connections}
          renderItem={renderConnection}
          keyExtractor={(item) => item.match.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  connectionCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.primary[600],
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[500],
  },
  statusBadge: {
    padding: Spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
  },
  timerUrgent: {
    backgroundColor: Colors.error + '15',
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
});
