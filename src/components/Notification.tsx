import { castRole, initials } from '../content/messages'
import AppIcon from './AppIcon'

export interface Toast {
  id: number
  title: string
  body?: string
  tone?: 'neutral' | 'urgent' | 'system'
}

interface Props {
  toasts: Toast[]
}

/**
 * Desktop notifications. A message from a colleague is presented as one — avatar,
 * name, role — while anything from the organisation itself arrives under the
 * application's own mark, the way a system toast does.
 *
 * Pointer events are disabled throughout: notifications are atmosphere and must
 * never intercept a drag.
 */
export default function NotificationStack({ toasts }: Props) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => {
        const role = castRole(t.title)
        const fromPerson = role !== undefined

        return (
          <article key={t.id} className={`toast toast--${t.tone ?? 'neutral'}`}>
            {fromPerson ? (
              <span className="toast-avatar" aria-hidden="true">
                {initials(t.title)}
              </span>
            ) : (
              <span className="toast-app" aria-hidden="true">
                <AppIcon className="toast-app-icon" />
              </span>
            )}

            <div className="toast-content">
              <header className="toast-head">
                <span className="toast-title">{t.title}</span>
                {fromPerson ? (
                  <span className="toast-role">{role}</span>
                ) : (
                  <span className="toast-role">pls fix</span>
                )}
                <span className="toast-time">now</span>
              </header>
              {t.body ? <p className="toast-body">{t.body}</p> : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}
