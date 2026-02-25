import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Card, ProgressBar } from '@/components/ui';
import { VoiceRecorder, VoicePlayer } from '@/components/voice';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useConnectivityStore, useAuthStore, useMatchStore } from '@/lib/store';
import { supabase, uploadVoiceNote, getVoiceNoteUrl } from '@/lib/supabase';
import {
  formatTimeRemaining,
  getSecondsUntilDeadline,
  calculateDeadline,
  extendDeadline,
} from '@/lib/utils';
import { notifyPartnerResponded } from '@/lib/notificationService';
import {
  transcribeAudio,
  analyzeResponse,
  generateNarratorMessage,
  generatePromptIntro,
  decideRoundProgression,
  moderateContentAI,
} from '@/lib/ai';
import type { ConnectivityRound, Match } from '@/types';

export default function ConnectivityRoundScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user } = useAuthStore();
  const {
    currentRound,
    remainingLifelines,
    timeRemaining,
    isRecording,
    hasResponded,
    partnerHasResponded,
    setCurrentRound,
    setRemainingLifelines,
    setTimeRemaining,
    setHasResponded,
    setPartnerHasResponded,
    useLifeline,
  } = useConnectivityStore();
  const { activeMatch, setActiveMatch } = useMatchStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [partnerResponse, setPartnerResponse] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [narratorMessage, setNarratorMessage] = useState('');
  const [promptIntro, setPromptIntro] = useState('');

  const isUser1 = activeMatch?.user1_id === user?.id;

  const fetchRoundData = useCallback(async () => {
    if (!matchId || !user) return;

    setIsLoading(true);
    try {
      // Fetch match with partner info
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          user1:profiles!matches_user1_id_fkey(id, name),
          user2:profiles!matches_user2_id_fkey(id, name)
        `)
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      setActiveMatch(matchData);
      const partner = matchData.user1_id === user.id ? matchData.user2 : matchData.user1;
      setPartnerName(partner?.name || 'Your match');

      // Fetch current round
      const { data: roundData, error: roundError } = await supabase
        .from('connectivity_rounds')
        .select('*')
        .eq('match_id', matchId)
        .eq('round_number', matchData.current_round)
        .single();

      if (roundError && roundError.code !== 'PGRST116') {
        // PGRST116 = no rows found
        throw roundError;
      }

      if (roundData) {
        setCurrentRound(roundData);

        // Check response status
        const isUser1InRound = matchData.user1_id === user.id;
        if (isUser1InRound) {
          setHasResponded(!!roundData.user1_responded_at);
          setPartnerHasResponded(!!roundData.user2_responded_at);
          if (roundData.user2_response_url && roundData.user1_responded_at) {
            setPartnerResponse(roundData.user2_response_url);
          }
          setRemainingLifelines(2 - (roundData.user1_lifelines_used || 0));
        } else {
          setHasResponded(!!roundData.user2_responded_at);
          setPartnerHasResponded(!!roundData.user1_responded_at);
          if (roundData.user1_response_url && roundData.user2_responded_at) {
            setPartnerResponse(roundData.user1_response_url);
          }
          setRemainingLifelines(2 - (roundData.user2_lifelines_used || 0));
        }

        // Calculate time remaining
        const seconds = getSecondsUntilDeadline(roundData.deadline_at);
        setTimeRemaining(seconds);

        // Generate narrator message
        const hasPartnerRespondedNow = isUser1InRound
          ? !!roundData.user2_responded_at
          : !!roundData.user1_responded_at;

        setNarratorMessage(generateNarratorMessage({
          roundNumber: roundData.round_number,
          roundType: roundData.round_type,
          partnerName: partner?.name || 'Your match',
          hasPartnerResponded: hasPartnerRespondedNow,
          timeRemainingHours: Math.floor(seconds / 3600),
          compatibilityScore: matchData.compatibility_score,
        }));
        setPromptIntro(generatePromptIntro(
          roundData.prompt_text,
          roundData.round_number,
          roundData.prompt?.category
        ));
      } else {
        // Create first round
        await createNewRound(matchData.current_round);
      }
    } catch (error) {
      console.error('Failed to fetch round data:', error);
      Alert.alert('Error', 'Failed to load connectivity round');
    } finally {
      setIsLoading(false);
    }
  }, [matchId, user, setActiveMatch, setCurrentRound, setHasResponded, setPartnerHasResponded, setRemainingLifelines, setTimeRemaining]);

  const createNewRound = async (roundNumber: number) => {
    // Get a random prompt
    const { data: prompts, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .eq('round_type', roundNumber <= 3 ? 'voice' : 'video')
      .eq('active', true);

    if (promptError) throw promptError;

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const deadline = calculateDeadline(roundNumber <= 3 ? 'voice' : 'video');

    const { data: newRound, error } = await supabase
      .from('connectivity_rounds')
      .insert({
        match_id: matchId,
        round_number: roundNumber,
        round_type: roundNumber <= 3 ? 'voice' : 'video',
        prompt_id: randomPrompt.id,
        prompt_text: randomPrompt.prompt_text,
        deadline_at: deadline.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    setCurrentRound(newRound);
    setTimeRemaining(getSecondsUntilDeadline(newRound.deadline_at));

    // Generate narrator message and prompt intro
    setNarratorMessage(generateNarratorMessage({
      roundNumber,
      roundType: roundNumber <= 3 ? 'voice' : 'video',
      partnerName,
      hasPartnerResponded: false,
      timeRemainingHours: roundNumber <= 3 ? 8 : 24,
    }));
    setPromptIntro(generatePromptIntro(
      randomPrompt.prompt_text,
      roundNumber,
      randomPrompt.category
    ));
  };

  useEffect(() => {
    fetchRoundData();
  }, [fetchRoundData]);

  useEffect(() => {
    // Timer countdown
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      if (timeRemaining !== null && timeRemaining > 0) {
        setTimeRemaining(Math.max(0, timeRemaining - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, setTimeRemaining]);

  const handleRecordingComplete = async (uri: string) => {
    setRecordingUri(uri);
  };

  const handleSubmitResponse = async () => {
    if (!recordingUri || !currentRound || !user) return;

    setIsSubmitting(true);
    try {
      // Upload recording
      const filePath = `rounds/${matchId}/${currentRound.round_number}/${user.id}.m4a`;
      await uploadVoiceNote(filePath, recordingUri);
      const publicUrl = getVoiceNoteUrl(filePath);

      // Start transcription in background
      setIsTranscribing(true);
      const transcript = await transcribeAudio(recordingUri);

      // Content moderation check on transcript
      if (transcript) {
        const moderation = await moderateContentAI(transcript);
        if (moderation.flagged && moderation.categories.includes('harassment')) {
          setIsTranscribing(false);
          setIsSubmitting(false);
          Alert.alert(
            'Content Flagged',
            'Your response contains content that may violate our community guidelines. Please re-record your message.',
            [{ text: 'OK', onPress: () => setRecordingUri(null) }]
          );
          return;
        }
      }

      // Analyze response if we have transcript
      let aiAnalysis = null;
      if (transcript && currentRound.prompt_text) {
        aiAnalysis = await analyzeResponse(transcript, currentRound.prompt_text);
      }

      // Update round with response and AI analysis
      const updateField = isUser1
        ? {
            user1_response_url: publicUrl,
            user1_responded_at: new Date().toISOString(),
            ai_analysis: aiAnalysis ? {
              ...((currentRound as any).ai_analysis || {}),
              user1: { transcript, analysis: aiAnalysis },
            } : undefined,
          }
        : {
            user2_response_url: publicUrl,
            user2_responded_at: new Date().toISOString(),
            ai_analysis: aiAnalysis ? {
              ...((currentRound as any).ai_analysis || {}),
              user2: { transcript, analysis: aiAnalysis },
            } : undefined,
          };

      // Check if both have responded
      const bothResponded = partnerHasResponded;
      const newStatus = bothResponded ? 'completed' : (isUser1 ? 'user1_responded' : 'user2_responded');

      const { error } = await supabase
        .from('connectivity_rounds')
        .update({
          ...updateField,
          status: newStatus,
        })
        .eq('id', currentRound.id);

      if (error) throw error;

      setHasResponded(true);
      setIsTranscribing(false);

      // Notify partner that we responded
      const partnerId = isUser1 ? activeMatch?.user2_id : activeMatch?.user1_id;
      if (partnerId && matchId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        await notifyPartnerResponded(partnerId, profile?.name || 'Your match', matchId);
      }

      if (bothResponded) {
        // Fetch partner's response
        const partnerUrl = isUser1 ? currentRound.user2_response_url : currentRound.user1_response_url;
        setPartnerResponse(partnerUrl);
      }

      Alert.alert('Submitted!', 'Your response has been recorded.');
    } catch (error) {
      console.error('Failed to submit response:', error);
      Alert.alert('Error', 'Failed to submit your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseLifeline = async () => {
    if (remainingLifelines <= 0 || !currentRound) return;

    Alert.alert(
      'Use Lifeline?',
      'This will extend the deadline by 12 hours. You have ' + remainingLifelines + ' lifeline(s) remaining.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Lifeline',
          onPress: async () => {
            try {
              const newDeadline = extendDeadline(new Date(currentRound.deadline_at));
              const lifelineField = isUser1 ? 'user1_lifelines_used' : 'user2_lifelines_used';
              const currentUsed = isUser1
                ? currentRound.user1_lifelines_used
                : currentRound.user2_lifelines_used;

              const { error } = await supabase
                .from('connectivity_rounds')
                .update({
                  deadline_at: newDeadline.toISOString(),
                  [lifelineField]: (currentUsed || 0) + 1,
                })
                .eq('id', currentRound.id);

              if (error) throw error;

              useLifeline();
              setTimeRemaining(getSecondsUntilDeadline(newDeadline));
              Alert.alert('Lifeline Used!', 'Your deadline has been extended by 12 hours.');
            } catch (error) {
              console.error('Failed to use lifeline:', error);
              Alert.alert('Error', 'Failed to use lifeline. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleContinueToNextRound = async () => {
    if (!activeMatch || !currentRound) return;

    try {
      // Fetch all completed rounds for AI analysis
      const { data: completedRounds } = await supabase
        .from('connectivity_rounds')
        .select('*')
        .eq('match_id', matchId)
        .eq('status', 'completed')
        .order('round_number', { ascending: true });

      // Extract analyses from rounds
      const roundAnalyses = (completedRounds || [])
        .filter(r => r.ai_analysis)
        .flatMap(r => {
          const analyses = [];
          if (r.ai_analysis?.user1?.analysis) analyses.push(r.ai_analysis.user1.analysis);
          if (r.ai_analysis?.user2?.analysis) analyses.push(r.ai_analysis.user2.analysis);
          return analyses;
        });

      // Get AI decision on progression
      const decision = await decideRoundProgression(
        currentRound.round_number,
        roundAnalyses,
        activeMatch.compatibility_score || 70
      );

      const nextRound = (activeMatch.current_round || 1) + 1;

      // Update match with new round and compatibility
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          current_round: nextRound,
          compatibility_score: decision.compatibilityEstimate,
          // If moving to reveal phase
          status: decision.nextRoundType === 'reveal' ? 'completed' : 'active',
        })
        .eq('id', matchId);

      if (matchError) throw matchError;

      // If ready for reveal, go to reveal screen
      if (decision.nextRoundType === 'reveal') {
        router.replace({
          pathname: '/(connectivity)/reveal',
          params: { matchId: matchId as string },
        });
        return;
      }

      // Show progression message
      if (decision.nextRoundType === 'video' && currentRound.round_type === 'voice') {
        Alert.alert(
          'Video Round!',
          decision.reason,
          [{ text: 'Continue', onPress: () => fetchRoundData() }]
        );
      } else {
        // Refresh for next round
        fetchRoundData();
      }
    } catch (error) {
      console.error('Failed to continue:', error);
      Alert.alert('Error', 'Failed to continue to next round.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text variant="body" color="secondary" style={styles.loadingText}>
            Loading Connectivity...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isTimerUrgent = timeRemaining !== null && timeRemaining < 3600;
  const roundComplete = hasResponded && partnerHasResponded;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text variant="label" color="muted">
            ROUND {currentRound?.round_number || 1}
          </Text>
          <Text variant="body" weight="semibold">
            with {partnerName}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {remainingLifelines > 0 && (
            <TouchableOpacity onPress={handleUseLifeline} style={styles.lifelineButton}>
              <Ionicons name="hourglass-outline" size={20} color={Colors.primary[500]} />
              <Text variant="caption" style={styles.lifelineText}>
                {remainingLifelines}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Timer */}
      {!roundComplete && timeRemaining !== null && (
        <View style={[styles.timerContainer, isTimerUrgent && styles.timerUrgent]}>
          <Ionicons
            name="time-outline"
            size={20}
            color={isTimerUrgent ? Colors.error : Colors.text.secondary}
          />
          <Text
            variant="body"
            weight="semibold"
            color={isTimerUrgent ? 'error' : 'secondary'}
          >
            {formatTimeRemaining(timeRemaining)}
          </Text>
          <Text variant="bodySmall" color="muted">
            remaining
          </Text>
        </View>
      )}

      {/* AI Narrator Message */}
      {narratorMessage && !roundComplete && (
        <View style={styles.narratorContainer}>
          <Ionicons name="sparkles" size={16} color={Colors.primary[500]} />
          <Text variant="bodySmall" color="secondary" style={styles.narratorText}>
            {narratorMessage}
          </Text>
        </View>
      )}

      {/* Prompt */}
      <Card style={styles.promptCard}>
        <Text variant="label" color="muted" style={styles.promptLabel}>
          {promptIntro || 'YOUR PROMPT'}
        </Text>
        <Text variant="h4" align="center">
          "{currentRound?.prompt_text || 'Loading prompt...'}"
        </Text>
      </Card>

      {/* Response Area */}
      <View style={styles.responseArea}>
        {!hasResponded ? (
          <>
            {recordingUri ? (
              <View style={styles.reviewContainer}>
                <Text variant="label" color="muted" style={styles.sectionLabel}>
                  YOUR RESPONSE
                </Text>
                <VoicePlayer uri={recordingUri} />

                <View style={styles.reviewActions}>
                  <Button
                    title="Re-record"
                    onPress={() => setRecordingUri(null)}
                    variant="outline"
                  />
                  <Button
                    title="Submit"
                    onPress={handleSubmitResponse}
                    loading={isSubmitting}
                  />
                </View>
              </View>
            ) : (
              <VoiceRecorder
                maxDuration={120}
                onRecordingComplete={handleRecordingComplete}
              />
            )}
          </>
        ) : roundComplete ? (
          <View style={styles.completeContainer}>
            {/* Your Response */}
            <View style={styles.responseSection}>
              <Text variant="label" color="muted" style={styles.sectionLabel}>
                YOUR RESPONSE
              </Text>
              <Card variant="filled" padding="md">
                <Text variant="body" align="center" color="muted">
                  Submitted!
                </Text>
              </Card>
            </View>

            {/* Partner's Response */}
            <View style={styles.responseSection}>
              <Text variant="label" color="muted" style={styles.sectionLabel}>
                {partnerName.toUpperCase()}'S RESPONSE
              </Text>
              {partnerResponse ? (
                <VoicePlayer uri={partnerResponse} />
              ) : (
                <Card variant="filled" padding="md">
                  <Text variant="body" align="center" color="muted">
                    Loading...
                  </Text>
                </Card>
              )}
            </View>

            {/* Continue Button */}
            <Button
              title="Continue to Next Round"
              onPress={handleContinueToNextRound}
              fullWidth
              style={styles.continueButton}
            />
          </View>
        ) : (
          <View style={styles.waitingContainer}>
            <Ionicons name="hourglass-outline" size={48} color={Colors.neutral[400]} />
            <Text variant="h4" align="center" style={styles.waitingTitle}>
              Waiting for {partnerName}
            </Text>
            <Text variant="body" color="secondary" align="center">
              You'll both see each other's responses once {partnerName} submits theirs.
            </Text>
          </View>
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
  loadingText: {
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  lifelineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: Spacing.xs,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.full,
  },
  lifelineText: {
    color: Colors.primary[600],
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
  },
  timerUrgent: {
    backgroundColor: Colors.error + '15',
  },
  narratorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
  },
  narratorText: {
    flex: 1,
    fontStyle: 'italic',
  },
  promptCard: {
    margin: Spacing.lg,
    alignItems: 'center',
  },
  promptLabel: {
    marginBottom: Spacing.sm,
    fontSize: 11,
    letterSpacing: 1,
  },
  responseArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  reviewContainer: {
    gap: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    fontSize: 11,
    letterSpacing: 1,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  completeContainer: {
    flex: 1,
    gap: Spacing.lg,
  },
  responseSection: {
    gap: Spacing.sm,
  },
  continueButton: {
    marginTop: 'auto',
    marginBottom: Spacing.lg,
  },
  waitingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  waitingTitle: {
    marginTop: Spacing.md,
  },
});
