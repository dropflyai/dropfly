import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button } from '@/components/ui';
import { VoicePlayer } from '@/components/voice';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useMatchStore, useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { notifyConnectionApproved } from '@/lib/notificationService';
import { calculateCompatibility } from '@/lib/ai';
import type { ConnectionRequest } from '@/types';

interface InboxItem extends ConnectionRequest {
  senderName: string;
  senderAge: number;
}

export default function InboxScreen() {
  const { user } = useAuthStore();
  const { pendingApprovals, setPendingApprovals, setLoading, isLoading } = useMatchStore();

  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);

  const fetchInbox = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch pending connection requests sent TO this user
      const { data, error } = await supabase
        .from('connection_requests')
        .select(`
          *,
          sender:profiles!connection_requests_from_user_id_fkey(id, name, age)
        `)
        .eq('to_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items: InboxItem[] = (data || []).map((r) => ({
        ...r,
        senderName: r.sender?.name || 'Unknown',
        senderAge: r.sender?.age || 0,
      }));

      setInboxItems(items);
      setPendingApprovals(data || []);
    } catch (error) {
      console.error('Failed to fetch inbox:', error);
    } finally {
      setLoading(false);
    }
  }, [user, setPendingApprovals, setLoading]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  const handleApprove = async (request: InboxItem) => {
    try {
      // Update request status
      const { error: requestError } = await supabase
        .from('connection_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (requestError) throw requestError;

      // Get both users' profiles for compatibility calculation
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, core_values, attachment_style, relationship_goal, love_languages')
        .in('id', [user!.id, request.from_user_id]);

      const myProfile = profiles?.find(p => p.id === user!.id);
      const theirProfile = profiles?.find(p => p.id === request.from_user_id);

      // Calculate initial compatibility
      const myValues = myProfile?.core_values || [];
      const theirValues = theirProfile?.core_values || [];
      const sharedValues = myValues.filter((v: string) => theirValues.includes(v));

      const initialCompatibility = calculateCompatibility({
        sharedValues,
        user1Values: myValues,
        user2Values: theirValues,
        user1AttachmentStyle: myProfile?.attachment_style || 'secure',
        user2AttachmentStyle: theirProfile?.attachment_style || 'secure',
        user1RelationshipGoal: myProfile?.relationship_goal || 'not-sure',
        user2RelationshipGoal: theirProfile?.relationship_goal || 'not-sure',
        user1LoveLanguages: myProfile?.love_languages || [],
        user2LoveLanguages: theirProfile?.love_languages || [],
      });

      // Create a match with compatibility score
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          user1_id: user!.id, // Woman (approver)
          user2_id: request.from_user_id, // Man (requester)
          status: 'active',
          current_round: 1,
          compatibility_score: initialCompatibility,
        })
        .select('id')
        .single();

      if (matchError) throw matchError;

      // Get current user's name for notification
      const profile = myProfile;

      // Send push notification to the requester
      await notifyConnectionApproved(
        request.from_user_id,
        profile?.name || 'Someone',
        matchData.id
      );

      // Remove from inbox
      setInboxItems((prev) => prev.filter((item) => item.id !== request.id));
      Alert.alert('Connected!', `You and ${request.senderName} are now in Connectivity`);
    } catch (error) {
      console.error('Failed to approve:', error);
      Alert.alert('Error', 'Failed to approve connection. Please try again.');
    }
  };

  const handleDecline = async (request: InboxItem) => {
    try {
      const { error } = await supabase
        .from('connection_requests')
        .update({ status: 'declined' })
        .eq('id', request.id);

      if (error) throw error;

      setInboxItems((prev) => prev.filter((item) => item.id !== request.id));
    } catch (error) {
      console.error('Failed to decline:', error);
      Alert.alert('Error', 'Failed to decline connection. Please try again.');
    }
  };

  const renderRequest = ({ item }: { item: InboxItem }) => (
    <Card style={styles.requestCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text variant="h4" style={styles.avatarText}>
            {item.senderName.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text variant="body" weight="semibold">
            {item.senderName}, {item.senderAge}
          </Text>
          <Text variant="caption" color="muted">
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>
      </View>

      {/* Voice Note */}
      <View style={styles.voiceSection}>
        <Text variant="label" color="muted" style={styles.sectionLabel}>
          VOICE MESSAGE
        </Text>
        <VoicePlayer uri={item.voice_note_url} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDecline(item)}
        >
          <Ionicons name="close" size={24} color={Colors.neutral[600]} />
          <Text variant="bodySmall">Pass</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApprove(item)}
        >
          <Ionicons name="checkmark" size={24} color="#fff" />
          <Text variant="bodySmall" style={styles.approveText}>
            Connect
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

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
        <Text variant="h3">Inbox</Text>
        {inboxItems.length > 0 && (
          <View style={styles.badge}>
            <Text variant="caption" style={styles.badgeText}>
              {inboxItems.length}
            </Text>
          </View>
        )}
      </View>

      {inboxItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-outline" size={64} color={Colors.neutral[300]} />
          <Text variant="h4" align="center" style={styles.emptyTitle}>
            No pending requests
          </Text>
          <Text variant="body" color="secondary" align="center">
            When someone sends you a connection request, it will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={inboxItems}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
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
  },
  requestCard: {
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
    marginLeft: Spacing.md,
  },
  voiceSection: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    fontSize: 11,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  declineButton: {
    backgroundColor: Colors.neutral[100],
  },
  approveButton: {
    backgroundColor: Colors.primary[500],
  },
  approveText: {
    color: '#fff',
  },
});
