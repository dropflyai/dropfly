import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/components/ui';
import { ReportModal } from '@/components/shared/ReportModal';
import { Colors, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { notifyNewMessage } from '@/lib/notificationService';
import { moderateContent } from '@/lib/ai';

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

interface MatchInfo {
  id: string;
  partnerName: string;
  partnerPhotoUrl: string | null;
}

export default function MessagesScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const fetchData = useCallback(async () => {
    if (!matchId || !user) return;

    try {
      // Fetch match info
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select(`
          id,
          user1:profiles!matches_user1_id_fkey(id, name, photo_urls),
          user2:profiles!matches_user2_id_fkey(id, name, photo_urls)
        `)
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      // Type assertion for Supabase joined data
      const user1 = match.user1 as unknown as { id: string; name: string; photo_urls: string[] | null };
      const user2 = match.user2 as unknown as { id: string; name: string; photo_urls: string[] | null };

      const isUser1 = user1.id === user.id;
      const partner = isUser1 ? user2 : user1;

      setMatchInfo({
        id: match.id,
        partnerName: partner.name,
        partnerPhotoUrl: partner.photo_urls?.[0] || null,
      });
      setPartnerId(partner.id);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setMessages(messagesData || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('match_id', matchId)
        .neq('sender_id', user.id)
        .is('read_at', null);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [matchId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    if (!matchId) return;

    const subscription = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);

          // Mark as read if not from current user
          if (newMsg.sender_id !== user?.id) {
            supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId, user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !matchId || !user || isSending || !matchInfo) return;

    const messageText = newMessage.trim();

    // Content moderation check
    const moderation = moderateContent(messageText);
    if (moderation.flagged) {
      if (moderation.categories.includes('harassment')) {
        Alert.alert(
          'Message Blocked',
          'Your message contains content that violates our community guidelines.',
          [{ text: 'OK' }]
        );
        return;
      }
      if (moderation.categories.includes('contact_sharing')) {
        Alert.alert(
          'Hold On!',
          'Sharing contact info is available after you both reach Real Life Ready. Keep chatting here for now!',
          [{ text: 'OK' }]
        );
        return;
      }
      // Other flags - warn but allow
      Alert.alert(
        'Friendly Reminder',
        'Please keep conversations respectful. This helps create a safe space for everyone.',
        [
          { text: 'Edit Message', style: 'cancel' },
          { text: 'Send Anyway', onPress: () => sendMessageContent(messageText) },
        ]
      );
      return;
    }

    await sendMessageContent(messageText);
  };

  const sendMessageContent = async (messageText: string) => {
    if (!user || !matchId) return;

    setNewMessage('');
    setIsSending(true);

    try {
      const { error } = await supabase.from('messages').insert({
        match_id: matchId,
        sender_id: user.id,
        content: messageText,
      });

      if (error) throw error;

      // Get partner ID and send notification
      const { data: match } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single();

      if (match) {
        const recipientId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        await notifyNewMessage(recipientId, profile?.name || 'Someone', matchId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.sender_id === user?.id;
    const showTimestamp =
      index === 0 ||
      new Date(item.created_at).getTime() -
        new Date(messages[index - 1].created_at).getTime() >
        300000; // 5 minutes

    return (
      <View style={styles.messageWrapper}>
        {showTimestamp && (
          <Text variant="caption" color="muted" align="center" style={styles.timestamp}>
            {formatRelativeTime(item.created_at)}
          </Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.theirMessage,
          ]}
        >
          <Text
            variant="body"
            style={isMyMessage ? styles.myMessageText : undefined}
          >
            {item.content}
          </Text>
        </View>
      </View>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.avatar}>
              <Text variant="body" weight="semibold" style={styles.avatarText}>
                {matchInfo?.partnerName?.charAt(0) || '?'}
              </Text>
            </View>
            <View>
              <Text variant="body" weight="semibold">
                {matchInfo?.partnerName}
              </Text>
              <Text variant="caption" color="success">
                Real Life Ready
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setShowReportModal(true)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Report Modal */}
        {partnerId && matchInfo && (
          <ReportModal
            visible={showReportModal}
            onClose={() => setShowReportModal(false)}
            reportedUserId={partnerId}
            reportedUserName={matchInfo.partnerName}
            onReportSubmitted={() => router.back()}
          />
        )}

        {/* Connection Info Card */}
        {messages.length === 0 && (
          <Card variant="filled" style={styles.welcomeCard}>
            <Ionicons name="heart" size={24} color={Colors.primary[500]} />
            <Text variant="body" align="center" style={styles.welcomeText}>
              You're both ready to connect in real life! Start the conversation
              and plan your first date.
            </Text>
          </Card>
        )}

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={Colors.neutral[400]}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled,
              ]}
              disabled={!newMessage.trim() || isSending}
            >
              <Ionicons
                name="send"
                size={20}
                color={newMessage.trim() ? '#fff' : Colors.neutral[400]}
              />
            </TouchableOpacity>
          </View>
        </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.primary[600],
  },
  moreButton: {
    padding: Spacing.xs,
  },
  welcomeCard: {
    margin: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  welcomeText: {
    maxWidth: 280,
  },
  messagesList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  messageWrapper: {
    marginBottom: Spacing.sm,
  },
  timestamp: {
    marginVertical: Spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary[500],
    borderBottomRightRadius: Spacing.xs,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.neutral[100],
    borderBottomLeftRadius: Spacing.xs,
  },
  myMessageText: {
    color: '#fff',
  },
  inputContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    backgroundColor: Colors.background.light,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.xl,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral[200],
  },
});
