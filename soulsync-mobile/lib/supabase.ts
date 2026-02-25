import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper to get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Auth helpers
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Storage helpers
export const uploadVoiceNote = async (
  filePath: string,
  fileUri: string,
  contentType = 'audio/m4a'
) => {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('voice-notes')
    .upload(filePath, blob, {
      contentType,
      upsert: true,
    });

  if (error) throw error;
  return data;
};

export const getVoiceNoteUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('voice-notes')
    .getPublicUrl(filePath);
  return data.publicUrl;
};

export const uploadPhoto = async (
  filePath: string,
  fileUri: string,
  contentType = 'image/jpeg'
) => {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('photos')
    .upload(filePath, blob, {
      contentType,
      upsert: true,
    });

  if (error) throw error;
  return data;
};

export const getPhotoUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(filePath);
  return data.publicUrl;
};

export const uploadVideo = async (
  filePath: string,
  fileUri: string,
  contentType = 'video/mp4'
) => {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('videos')
    .upload(filePath, blob, {
      contentType,
      upsert: true,
    });

  if (error) throw error;
  return data;
};

export const getVideoUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('videos')
    .getPublicUrl(filePath);
  return data.publicUrl;
};
