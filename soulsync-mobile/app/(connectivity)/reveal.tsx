import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Card } from '@/components/ui';
import { Colors, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { formatCompatibility, getCompatibilityColor } from '@/lib/utils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

interface RevealData {
  matchId: string;
  partnerName: string;
  partnerPhotos: string[];
  myPhotos: string[];
  compatibilityScore: number;
}

export default function RevealScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user } = useAuthStore();

  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [decision, setDecision] = useState<'continue' | 'exit' | null>(null);

  // Animations
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRevealData();
  }, [matchId]);

  const fetchRevealData = async () => {
    if (!matchId || !user) return;

    try {
      const { data: match, error } = await supabase
        .from('matches')
        .select(`
          *,
          user1:profiles!matches_user1_id_fkey(id, name, photo_urls),
          user2:profiles!matches_user2_id_fkey(id, name, photo_urls)
        `)
        .eq('id', matchId)
        .single();

      if (error) throw error;

      const isUser1 = match.user1_id === user.id;
      const partner = isUser1 ? match.user2 : match.user1;
      const me = isUser1 ? match.user1 : match.user2;

      setRevealData({
        matchId: match.id,
        partnerName: partner.name,
        partnerPhotos: partner.photo_urls || [],
        myPhotos: me.photo_urls || [],
        compatibilityScore: match.compatibility_score || 85,
      });
    } catch (error) {
      console.error('Failed to fetch reveal data:', error);
      Alert.alert('Error', 'Failed to load reveal data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReveal = () => {
    // Animate the reveal
    Animated.sequence([
      Animated.parallel([
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsRevealed(true);
    });
  };

  const handleDecision = async (choice: 'continue' | 'exit') => {
    if (!matchId || !user) return;

    setDecision(choice);

    try {
      // Get existing reveal or create one
      const { data: existingReveal } = await supabase
        .from('reveals')
        .select('*')
        .eq('match_id', matchId)
        .single();

      const { data: match } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single();

      const isUser1 = match?.user1_id === user.id;
      const continueField = isUser1 ? 'user1_continue' : 'user2_continue';

      if (existingReveal) {
        await supabase
          .from('reveals')
          .update({ [continueField]: choice === 'continue' })
          .eq('match_id', matchId);
      } else {
        await supabase.from('reveals').insert({
          match_id: matchId,
          user1_approved: true,
          user2_approved: true,
          revealed_at: new Date().toISOString(),
          [continueField]: choice === 'continue',
        });
      }

      if (choice === 'continue') {
        // Check if both want to continue
        const { data: reveal } = await supabase
          .from('reveals')
          .select('*')
          .eq('match_id', matchId)
          .single();

        if (reveal?.user1_continue && reveal?.user2_continue) {
          // Both want to continue - go to messages
          router.replace({
            pathname: '/(main)/messages',
            params: { matchId },
          });
        } else {
          // Waiting for partner
          Alert.alert(
            'Decision Saved',
            `Waiting for ${revealData?.partnerName} to make their decision.`,
            [{ text: 'OK', onPress: () => router.replace('/(main)/connections') }]
          );
        }
      } else {
        // User chose to exit
        await supabase
          .from('matches')
          .update({ status: 'exited' })
          .eq('id', matchId);

        Alert.alert(
          'Connection Ended',
          "No worries! There are more great connections waiting for you.",
          [{ text: 'OK', onPress: () => router.replace('/(main)/discover') }]
        );
      }
    } catch (error) {
      console.error('Failed to save decision:', error);
      Alert.alert('Error', 'Failed to save your decision. Please try again.');
      setDecision(null);
    }
  };

  if (isLoading || !revealData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Preparing the reveal...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['180deg', '90deg', '0deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3" align="center">
          {isRevealed ? 'The Reveal' : 'Ready for the Reveal?'}
        </Text>
        <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
          {isRevealed
            ? `You and ${revealData.partnerName}`
            : 'After all your conversations, it\'s time to see each other'}
        </Text>
      </View>

      {/* Compatibility Score */}
      {isRevealed && (
        <Animated.View style={[styles.compatibilityContainer, { opacity: fadeAnim }]}>
          <View
            style={[
              styles.compatibilityBadge,
              { backgroundColor: getCompatibilityColor(revealData.compatibilityScore) + '20' },
            ]}
          >
            <Text
              variant="h2"
              style={{ color: getCompatibilityColor(revealData.compatibilityScore) }}
            >
              {formatCompatibility(revealData.compatibilityScore)}
            </Text>
            <Text variant="bodySmall" color="secondary">
              Compatibility
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Photo Cards */}
      <View style={styles.cardsContainer}>
        {/* Partner's Photo */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { perspective: 1000 },
                { rotateY: isRevealed ? '0deg' : frontInterpolate },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {isRevealed && revealData.partnerPhotos[0] ? (
            <Image
              source={{ uri: revealData.partnerPhotos[0] }}
              style={styles.photo}
            />
          ) : (
            <View style={styles.cardBack}>
              <Ionicons name="person" size={48} color={Colors.neutral[400]} />
              <Text variant="body" color="muted">
                {revealData.partnerName}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* My Photo */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { perspective: 1000 },
                { rotateY: isRevealed ? '0deg' : frontInterpolate },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {isRevealed && revealData.myPhotos[0] ? (
            <Image
              source={{ uri: revealData.myPhotos[0] }}
              style={styles.photo}
            />
          ) : (
            <View style={styles.cardBack}>
              <Ionicons name="person" size={48} color={Colors.neutral[400]} />
              <Text variant="body" color="muted">
                You
              </Text>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!isRevealed ? (
          <Button
            title="Reveal Photos"
            onPress={handleReveal}
            fullWidth
            size="lg"
          />
        ) : (
          <Animated.View style={[styles.decisionContainer, { opacity: fadeAnim }]}>
            <Text variant="body" align="center" style={styles.decisionText}>
              Would you like to continue to Real Life Ready?
            </Text>

            <View style={styles.decisionButtons}>
              <Button
                title="Exit Gracefully"
                onPress={() => handleDecision('exit')}
                variant="outline"
                disabled={decision !== null}
              />
              <Button
                title="Continue!"
                onPress={() => handleDecision('continue')}
                disabled={decision !== null}
                loading={decision === 'continue'}
              />
            </View>
          </Animated.View>
        )}
      </View>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  compatibilityContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  compatibilityBadge: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  cardsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  cardBack: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  decisionContainer: {
    gap: Spacing.lg,
  },
  decisionText: {
    marginBottom: Spacing.sm,
  },
  decisionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
