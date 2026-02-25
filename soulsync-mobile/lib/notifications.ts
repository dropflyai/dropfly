import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import type { NotificationType } from '@/types';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Register for push notifications and return the token
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permissions not granted');
    return null;
  }

  // Get the token
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    // Configure for Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F43F5E',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

// Save push token to database
export async function savePushToken(userId: string, token: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .upsert({
        user_id: userId,
        token,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save push token:', error);
  }
}

// Remove push token on logout
export async function removePushToken(userId: string): Promise<void> {
  try {
    await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId);
  } catch (error) {
    console.error('Failed to remove push token:', error);
  }
}

// Schedule a local notification (for timer warnings)
export async function scheduleTimerWarning(
  matchId: string,
  partnerName: string,
  hoursRemaining: number
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time Running Out!',
        body: `Only ${hoursRemaining} hours left to respond to ${partnerName}`,
        data: { type: 'timer_warning', matchId },
      },
      trigger: null, // Immediate
    });
    return id;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

// Cancel a scheduled notification
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Handle notification response (when user taps)
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Handle notification received (when app is open)
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

// Get the badge count
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

// Set the badge count
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Notification templates for different events
export const NotificationTemplates = {
  connectionRequest: (senderName: string) => ({
    title: 'New Connection Request',
    body: `${senderName} wants to connect with you!`,
  }),
  connectionApproved: (approverName: string) => ({
    title: 'Connection Accepted!',
    body: `${approverName} accepted your connection request. Start Connectivity now!`,
  }),
  roundStarted: (partnerName: string, roundNumber: number) => ({
    title: 'New Round Started',
    body: `Round ${roundNumber} with ${partnerName} is ready. Share your response!`,
  }),
  partnerResponded: (partnerName: string) => ({
    title: `${partnerName} Responded`,
    body: `Listen to their response and continue your conversation.`,
  }),
  timerWarning: (partnerName: string, hoursLeft: number) => ({
    title: 'Time Running Out!',
    body: `Only ${hoursLeft}h left to respond to ${partnerName}. Don't lose this connection!`,
  }),
  timerExpired: (partnerName: string) => ({
    title: 'Connection Expired',
    body: `Time ran out with ${partnerName}. Keep discovering new connections!`,
  }),
  revealReady: (partnerName: string) => ({
    title: 'Ready for Reveal!',
    body: `You and ${partnerName} completed Connectivity. See each other now!`,
  }),
  newMessage: (senderName: string) => ({
    title: `Message from ${senderName}`,
    body: 'Tap to read and reply.',
  }),
};
