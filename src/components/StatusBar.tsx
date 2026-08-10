interface Props {
  status: string
  note?: string
  satisfied: number
  total: number
  progress: number
  showProgress: boolean
  clock: string
  clockLabel: string
  clockUrgent: boolean
  nudgeHint: boolean
  zoom: string
  onHint: () => void
  hintDisabled: boolean
  hintLabel: string
}

export default function StatusBar({
  status,
  note,
  satisfied,
  total,
  progress,
  showProgress,
  clock,
  clockLabel,
  clockUrgent,
  nudgeHint,
  zoom,
  onHint,
  hintDisabled,
  hintLabel,
}: Props) {
  return (
    <footer className="statusbar">
      <span className="status-dot" aria-hidden="true" />
      <span className="status-text">{status}</span>
      {note ? <span className="status-note">{note}</span> : null}

      {nudgeHint ? (
        <span className="nudge-hint">
          <kbd>↑</kbd>
          <kbd>↓</kbd>
          <kbd>←</kbd>
          <kbd>→</kbd>
          <span>nudge</span>
          <kbd>shift</kbd>
          <span>10px</span>
        </span>
      ) : null}

      <span className="status-spacer" />

      <button
        type="button"
        className="status-hint"
        onClick={onHint}
        disabled={hintDisabled}
        title="Escalate for visibility on intended positioning (H)"
      >
        {hintLabel}
      </button>

      {showProgress ? (
        <span className="status-progress" aria-label={`${satisfied} of ${total} objectives aligned`}>
          <span className="status-progress-label">
            {satisfied}/{total} aligned
          </span>
          <span className="status-progress-track" aria-hidden="true">
            <span
              className="status-progress-fill"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </span>
        </span>
      ) : null}

      <span className="status-zoom">{zoom}</span>

      <span className={`status-clock${clockUrgent ? ' is-urgent' : ''}`}>
        <span className="status-clock-label">{clockLabel}</span>
        <span className="status-clock-value">{clock}</span>
      </span>
    </footer>
  )
}
