// Notification Service - Triggers push notifications to users
import { supabase } from './supabase';
import { NotificationTemplates } from './notifications';

const EDGE_FUNCTION_URL = process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1/send-notification';

interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

async function sendNotification({ userId, title, body, data }: SendNotificationParams): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.session?.access_token}`,
      },
      body: JSON.stringify({ userId, title, body, data }),
    });

    if (!response.ok) {
      console.error('Failed to send notification:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// ============================================
// NOTIFICATION TRIGGERS
// ============================================

/**
 * Notify user of new connection request
 */
export async function notifyConnectionRequest(
  toUserId: string,
  fromUserName: string
): Promise<void> {
  const template = NotificationTemplates.connectionRequest(fromUserName);
  await sendNotification({
    userId: toUserId,
    title: template.title,
    body: template.body,
    data: { type: 'connection_request' },
  });
}

/**
 * Notify user their connection request was approved
 */
export async function notifyConnectionApproved(
  toUserId: string,
  approverName: string,
  matchId: string
): Promise<void> {
  const template = NotificationTemplates.connectionApproved(approverName);
  await sendNotification({
    userId: toUserId,
    title: template.title,
    body: template.body,
    data: { type: 'connection_approved', matchId },
  });
}

/**
 * Notify user a new round has started
 */
export async function notifyRoundStarted(
  toUserId: string,
  partnerName: string,
  roundNumber: number,
  matchId: string
): Promise<void> {
  const template = NotificationTemplates.roundStarted(partnerName, roundNumber);
  await sendNotification({
    userId: toUserId,
    title: template.title,
    body: template.body,
    data: { type: 'round_started', matchId, roundNumber },
  });
}

/**
 * Notify user their partner has responded
 */
export async function notifyPartnerResponded(
  toUserId: string,
  partnerName: string,
  matchId: string
): Promise<void> {
  const template = NotificationTemplates.partnerResponded(partnerName);
  await sendNotification({
    userId: toUserId,
    title: template.title,
    body: template.body,
    data: { type: 'partner_responded', matchId },
  });
}

/**
 * Notify user of timer warning
 */
export async function notifyTimerWarning(
  toUserId: string,
  partnerName: string,
  hoursLeft: number,
  matchId: string
): Promise<void> {
  const template = NotificationTemplates.timerWarning(partnerName, hoursLeft);
  await sendNotification({
    userId: toUserId,
    title: template.title,
    body: template.body,
    data: { type: 'timer_warning', matchId },
  });
}

/**
 * Notify user the reveal is ready
 */
export async function notifyRevealReady(
  toUserId: string,
  partnerName: string,
  matchId: string
): Promise<void> {
  const template = NotificationTemplates.revealReady(partnerName);
  await sendNotification({
    userId: toUserId,
    title: template.title,
    body: template.body,
    data: { type: 'reveal_ready', matchId },
  });
}

/**
 * Notify user of new message
 */
export async function notifyNewMessage(
  toUserId: string,
  senderName: string,
  matchId: string
): Promise<void> {
  const template = NotificationTemplates.newMessage(senderName);
  await sendNotification({
    userId: toUserId,
    title: template.title,
    body: template.body,
    data: { type: 'message_received', matchId },
  });
}
