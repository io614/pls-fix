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
 * Pointer events are disabled throughout: notifications are atmosphere and must never
 * intercept a drag.
 */
export default function NotificationStack({ toasts }: Props) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <article key={t.id} className={`toast toast--${t.tone ?? 'neutral'}`}>
          <span className="toast-bar" aria-hidden="true" />
          <div className="toast-content">
            <p className="toast-title">{t.title}</p>
            {t.body ? <p className="toast-body">{t.body}</p> : null}
          </div>
        </article>
      ))}
    </div>
  )
}
