import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AuthUser,
  Session,
  OnboardingData,
  UserProfile,
  Match,
  ConnectionRequest,
  ConnectivityRound,
  DiscoveryProfile,
  Gender,
  RelationshipGoal,
  CoreValue,
  AttachmentStyle,
  LoveLanguage,
} from '@/types';

// ============================================
// AUTH STORE
// ============================================
interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, session: null, isAuthenticated: false }),
    }),
    {
      name: 'soulsync-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// ONBOARDING STORE
// ============================================
interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  isCompleted: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  setName: (name: string) => void;
  setBirthdate: (birthdate: string) => void;
  setGender: (gender: Gender) => void;
  setLocation: (location: string) => void;
  setRelationshipGoal: (goal: RelationshipGoal) => void;
  setCoreValues: (values: CoreValue[]) => void;
  setAttachmentStyle: (style: AttachmentStyle) => void;
  setLoveLanguages: (languages: LoveLanguage[]) => void;
  setVoiceIntroUrl: (url: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialOnboardingData: OnboardingData = {
  name: '',
  birthdate: '',
  gender: null,
  location: '',
  relationship_goal: null,
  core_values: [],
  attachment_style: null,
  love_languages: [],
  voice_intro_url: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      totalSteps: 7,
      data: initialOnboardingData,
      isCompleted: false,
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({
        currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1)
      })),
      prevStep: () => set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 0)
      })),
      updateData: (updates) => set((state) => ({
        data: { ...state.data, ...updates }
      })),
      setName: (name) => set((state) => ({
        data: { ...state.data, name }
      })),
      setBirthdate: (birthdate) => set((state) => ({
        data: { ...state.data, birthdate }
      })),
      setGender: (gender) => set((state) => ({
        data: { ...state.data, gender }
      })),
      setLocation: (location) => set((state) => ({
        data: { ...state.data, location }
      })),
      setRelationshipGoal: (relationship_goal) => set((state) => ({
        data: { ...state.data, relationship_goal }
      })),
      setCoreValues: (core_values) => set((state) => ({
        data: { ...state.data, core_values }
      })),
      setAttachmentStyle: (attachment_style) => set((state) => ({
        data: { ...state.data, attachment_style }
      })),
      setLoveLanguages: (love_languages) => set((state) => ({
        data: { ...state.data, love_languages }
      })),
      setVoiceIntroUrl: (voice_intro_url) => set((state) => ({
        data: { ...state.data, voice_intro_url }
      })),
      completeOnboarding: () => set({ isCompleted: true }),
      resetOnboarding: () => set({
        currentStep: 0,
        data: initialOnboardingData,
        isCompleted: false
      }),
    }),
    {
      name: 'soulsync-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// PROFILE STORE
// ============================================
interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null,
  })),
}));

// ============================================
// MATCH STORE
// ============================================
interface MatchState {
  matches: Match[];
  activeMatch: Match | null;
  connectionRequests: ConnectionRequest[];
  pendingApprovals: ConnectionRequest[];
  isLoading: boolean;
  setMatches: (matches: Match[]) => void;
  setActiveMatch: (match: Match | null) => void;
  addMatch: (match: Match) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  setConnectionRequests: (requests: ConnectionRequest[]) => void;
  setPendingApprovals: (approvals: ConnectionRequest[]) => void;
  addConnectionRequest: (request: ConnectionRequest) => void;
  setLoading: (loading: boolean) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  matches: [],
  activeMatch: null,
  connectionRequests: [],
  pendingApprovals: [],
  isLoading: false,
  setMatches: (matches) => set({ matches }),
  setActiveMatch: (activeMatch) => set({ activeMatch }),
  addMatch: (match) => set((state) => ({
    matches: [...state.matches, match]
  })),
  updateMatch: (matchId, updates) => set((state) => ({
    matches: state.matches.map((m) =>
      m.id === matchId ? { ...m, ...updates } : m
    ),
    activeMatch: state.activeMatch?.id === matchId
      ? { ...state.activeMatch, ...updates }
      : state.activeMatch,
  })),
  setConnectionRequests: (connectionRequests) => set({ connectionRequests }),
  setPendingApprovals: (pendingApprovals) => set({ pendingApprovals }),
  addConnectionRequest: (request) => set((state) => ({
    connectionRequests: [...state.connectionRequests, request]
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));

// ============================================
// CONNECTIVITY STORE
// ============================================
interface ConnectivityState {
  currentRound: ConnectivityRound | null;
  rounds: ConnectivityRound[];
  remainingLifelines: number;
  timeRemaining: number | null; // seconds
  isRecording: boolean;
  hasResponded: boolean;
  partnerHasResponded: boolean;
  setCurrentRound: (round: ConnectivityRound | null) => void;
  setRounds: (rounds: ConnectivityRound[]) => void;
  addRound: (round: ConnectivityRound) => void;
  updateRound: (roundId: string, updates: Partial<ConnectivityRound>) => void;
  setRemainingLifelines: (count: number) => void;
  useLifeline: () => void;
  setTimeRemaining: (seconds: number | null) => void;
  setIsRecording: (recording: boolean) => void;
  setHasResponded: (responded: boolean) => void;
  setPartnerHasResponded: (responded: boolean) => void;
  resetConnectivity: () => void;
}

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  currentRound: null,
  rounds: [],
  remainingLifelines: 2,
  timeRemaining: null,
  isRecording: false,
  hasResponded: false,
  partnerHasResponded: false,
  setCurrentRound: (currentRound) => set({ currentRound }),
  setRounds: (rounds) => set({ rounds }),
  addRound: (round) => set((state) => ({
    rounds: [...state.rounds, round]
  })),
  updateRound: (roundId, updates) => set((state) => ({
    rounds: state.rounds.map((r) =>
      r.id === roundId ? { ...r, ...updates } : r
    ),
    currentRound: state.currentRound?.id === roundId
      ? { ...state.currentRound, ...updates }
      : state.currentRound,
  })),
  setRemainingLifelines: (remainingLifelines) => set({ remainingLifelines }),
  useLifeline: () => set((state) => ({
    remainingLifelines: Math.max(0, state.remainingLifelines - 1)
  })),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setHasResponded: (hasResponded) => set({ hasResponded }),
  setPartnerHasResponded: (partnerHasResponded) => set({ partnerHasResponded }),
  resetConnectivity: () => set({
    currentRound: null,
    rounds: [],
    remainingLifelines: 2,
    timeRemaining: null,
    isRecording: false,
    hasResponded: false,
    partnerHasResponded: false,
  }),
}));

// ============================================
// DISCOVERY STORE
// ============================================
interface DiscoveryState {
  profiles: DiscoveryProfile[];
  currentIndex: number;
  isLoading: boolean;
  setProfiles: (profiles: DiscoveryProfile[]) => void;
  addProfiles: (profiles: DiscoveryProfile[]) => void;
  nextProfile: () => void;
  setCurrentIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  removeProfile: (profileId: string) => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
  profiles: [],
  currentIndex: 0,
  isLoading: false,
  setProfiles: (profiles) => set({ profiles, currentIndex: 0 }),
  addProfiles: (profiles) => set((state) => ({
    profiles: [...state.profiles, ...profiles]
  })),
  nextProfile: () => set((state) => ({
    currentIndex: state.currentIndex + 1
  })),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setLoading: (isLoading) => set({ isLoading }),
  removeProfile: (profileId) => set((state) => ({
    profiles: state.profiles.filter((p) => p.id !== profileId),
  })),
}));
