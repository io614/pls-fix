export interface AmbientNotification {
  title: string
  body?: string
  tone?: 'neutral' | 'urgent' | 'system'
}

/** Atmosphere only. These never block input and never gate progress. */
export const AMBIENT: AmbientNotification[] = [
  { title: 'Reminder', body: 'Complete mandatory cybersecurity training.', tone: 'system' },
  { title: 'Account', body: 'Your password expires in 2 days.', tone: 'system' },
  { title: 'Town Hall', body: 'Starts in 10 minutes.', tone: 'neutral' },
  { title: 'Inbox', body: 'You have 17 unread messages.', tone: 'neutral' },
  { title: 'Expense report rejected', body: 'Reason: missing receipt.', tone: 'urgent' },
  { title: 'Mandatory Engagement Survey', body: 'Tell us how empowered you feel.', tone: 'system' },
  { title: 'Calendar', body: 'Weekly Alignment moved to 07:30.', tone: 'neutral' },
  { title: 'IT', body: 'Restart pending. 4 days overdue.', tone: 'system' },
  { title: 'Facilities', body: 'Desk booking required from Monday.', tone: 'neutral' },
  { title: 'Learning', body: 'New course assigned: Strategic Listening.', tone: 'system' },
  { title: 'Undo unavailable', body: 'Restricted by organisational policy.', tone: 'system' },
  { title: 'Sync complete', body: 'Alignment failed successfully.', tone: 'system' },
]

export function ambientAt(index: number): AmbientNotification {
  return AMBIENT[index % AMBIENT.length]
}

/**
 * Replies to an escalation. Each one travels a rung further up the organisation
 * and arrives back where it started. The ladder resets per task, so escalating
 * always begins politely.
 */
export const ESCALATION_REPLIES: AmbientNotification[] = [
  { title: 'Sarah', body: 'Thanks for flagging.', tone: 'neutral' },
  { title: 'Sarah', body: 'Looping in Priya.', tone: 'neutral' },
  { title: 'Priya', body: 'Logged as a risk. Owner: you.', tone: 'system' },
  { title: 'Marcus', body: '?', tone: 'urgent' },
  { title: 'Priya', body: 'Escalation closed. No action taken.', tone: 'system' },
  { title: 'David', body: "Let's socialise this.", tone: 'neutral' },
  { title: 'Alex', body: "It's a few pixels. You've got this.", tone: 'neutral' },
  { title: 'Sarah', body: 'Out of office. Back Monday.', tone: 'system' },
  { title: 'Marcus', body: 'Removing myself from this thread.', tone: 'system' },
]

/** First reference number issued once the humans have stopped replying. */
const FIRST_REF = 4471

/**
 * Once the ladder is exhausted nobody answers personally again. The service desk
 * takes over and files each escalation under a fresh reference, so the replies
 * keep arriving and never repeat.
 */
export function escalationReply(count: number): AmbientNotification {
  const i = Math.max(1, count) - 1
  if (i < ESCALATION_REPLIES.length) return ESCALATION_REPLIES[i]
  const ref = FIRST_REF + (i - ESCALATION_REPLIES.length)
  return {
    title: 'Service Desk',
    body: `Escalation logged. Ref: ESC-${ref}.`,
    tone: 'system',
  }
}
