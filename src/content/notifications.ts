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
