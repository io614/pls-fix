import { useEffect, useRef } from 'react'
import { initials } from '../content/messages'
import { LEVELS } from '../levels'

export interface ThreadEntry {
  key: string
  name: string
  role?: string
  time: string
  lines: string[]
  tone?: 'incoming' | 'system'
}

interface Props {
  /** Where the campaign actually is. */
  levelIndex: number
  /** What is on screen — the current task, or a closed one reopened for review. */
  activeIndex: number
  completedIds: string[]
  thread: ThreadEntry[]
  ctaLabel: string | null
  onCta: () => void
  onOpenTask: (index: number) => void
}

export default function TaskPanel({
  levelIndex,
  activeIndex,
  completedIds,
  thread,
  ctaLabel,
  onCta,
  onOpenTask,
}: Props) {
  const threadRef = useRef<HTMLDivElement | null>(null)

  /* Keep the latest message in view as replies trickle in. */
  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [thread.length])

  return (
    <aside className="sidebar" aria-label="Tasks and messages">
      <div className="sidebar-section">
        <h2 className="panel-heading">
          Tasks
          <span className="panel-count">
            {completedIds.length}/{LEVELS.length}
          </span>
        </h2>
        <ol className="task-list">
          {LEVELS.map((lvl, i) => {
            const done = completedIds.includes(lvl.id)
            const current = i === levelIndex
            const viewing = i === activeIndex
            const state = done ? 'done' : current ? 'current' : 'queued'
            /* Closed work can be reopened; so can the current task, to come back to it. */
            const openable = (done || current) && !viewing

            const label = done
              ? viewing && !current
                ? 'Reopened'
                : 'Closed'
              : current
                ? 'Open'
                : lvl.priority === 'overdue'
                  ? 'Overdue'
                  : '—'

            const body = (
              <>
                <span className="task-index">{String(i + 1).padStart(2, '0')}</span>
                <span
                  className={`task-dot task-dot--${lvl.priority ?? 'normal'}`}
                  aria-hidden="true"
                />
                <span className="task-body">
                  <span className="task-title">{lvl.title}</span>
                  <span className="task-brief">{lvl.brief}</span>
                </span>
                <span className="task-state">{label}</span>
              </>
            )

            return (
              <li key={lvl.id}>
                {openable ? (
                  <button
                    type="button"
                    className={`task task--${state} task--openable`}
                    onClick={() => onOpenTask(i)}
                    title={done ? `Reopen: ${lvl.title}` : `Return to: ${lvl.title}`}
                  >
                    {body}
                  </button>
                ) : (
                  <div
                    className={`task task--${state}${viewing ? ' task--viewing' : ''}`}
                    aria-current={viewing ? 'step' : undefined}
                  >
                    {body}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="sidebar-section sidebar-thread">
        <h2 className="panel-heading">
          Thread
          <span className="panel-count">Task {activeIndex + 1}</span>
        </h2>
        <div className="thread" ref={threadRef}>
          {thread.map((entry) => (
            <article
              key={entry.key}
              className={`message message--${entry.tone ?? 'incoming'}`}
            >
              {entry.tone === 'system' ? (
                <p className="message-system">{entry.lines.join(' ')}</p>
              ) : (
                <>
                  <header className="message-head">
                    <span className="avatar" aria-hidden="true">
                      {initials(entry.name)}
                    </span>
                    <span className="message-who">
                      <span className="message-name">{entry.name}</span>
                      {entry.role ? <span className="message-role">{entry.role}</span> : null}
                    </span>
                    <time className="message-time">{entry.time}</time>
                  </header>
                  <div className="message-body">
                    {entry.lines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </>
              )}
            </article>
          ))}
        </div>

        {ctaLabel ? (
          <button type="button" className="cta" onClick={onCta}>
            {ctaLabel}
          </button>
        ) : null}
      </div>
    </aside>
  )
}
