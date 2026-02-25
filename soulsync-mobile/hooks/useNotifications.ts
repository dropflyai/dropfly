import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotifications,
  savePushToken,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '@/lib/notifications';
import { useAuthStore } from '@/lib/store';

export function useNotifications() {
  const { user, isAuthenticated } = useAuthStore();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Register for notifications
    const setupNotifications = async () => {
      const token = await registerForPushNotifications();
      if (token) {
        await savePushToken(user.id, token);
      }
    };

    setupNotifications();

    // Handle notifications received while app is open
    notificationListener.current = addNotificationReceivedListener((notification) => {
      // Could update badge count or show in-app notification
      console.log('Notification received:', notification);
    });

    // Handle notification taps
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;

      // Navigate based on notification type
      switch (data?.type) {
        case 'connection_request':
          router.push('/(main)/inbox');
          break;
        case 'connection_approved':
        case 'round_started':
        case 'partner_responded':
          if (data.matchId) {
            router.push(`/(connectivity)/${data.matchId}`);
          } else {
            router.push('/(main)/connections');
          }
          break;
        case 'timer_warning':
          if (data.matchId) {
            router.push(`/(connectivity)/${data.matchId}`);
          }
          break;
        case 'reveal_ready':
          if (data.matchId) {
            router.push({
              pathname: '/(connectivity)/reveal',
              params: { matchId: data.matchId as string },
            });
          }
          break;
        case 'message_received':
          if (data.matchId) {
            router.push({
              pathname: '/(main)/messages',
              params: { matchId: data.matchId as string },
            });
          }
          break;
        default:
          // Default to connections
          router.push('/(main)/connections');
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated, user]);
}
