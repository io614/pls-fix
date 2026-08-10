import type { ReactNode } from 'react'

interface Props {
  filename: string
  saveState: string
  taskTitle: string
  muted: boolean
  debug: boolean
  onToggleMute: () => void
  onPause: () => void
  children: ReactNode
}

const RIBBON = ['File', 'Home', 'Insert', 'Design', 'Transitions', 'Review', 'View', 'Help']

const ALIGN_ICONS: { key: string; label: string }[] = [
  { key: 'left', label: 'Align Left' },
  { key: 'center', label: 'Align Center' },
  { key: 'right', label: 'Align Right' },
  { key: 'top', label: 'Align Top' },
  { key: 'middle', label: 'Align Middle' },
  { key: 'bottom', label: 'Align Bottom' },
]

export default function AppShell({
  filename,
  saveState,
  taskTitle,
  muted,
  debug,
  onToggleMute,
  onPause,
  children,
}: Props) {
  return (
    <div className={`shell${debug ? ' is-debug' : ''}`}>
      <header className="titlebar">
        <div className="titlebar-left">
          <span className="app-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="qat" aria-hidden="true">
            <span className="qat-btn qat-btn--save" />
            <span className="qat-btn qat-btn--undo" />
            <span className="qat-btn qat-btn--redo" />
          </span>
          <span className="app-name">pls fix</span>
          <span className="app-divider" aria-hidden="true" />
          <span className="app-file" title={filename}>
            {filename}
          </span>
          <span className="app-save">{saveState}</span>
        </div>

        <div className="titlebar-center">
          <span className="chip">{taskTitle}</span>
        </div>

        <div className="titlebar-right">
          <span className="presence" aria-label="Also viewing">
            <span className="presence-dot">SA</span>
            <span className="presence-dot">MA</span>
            <span className="presence-dot">PR</span>
          </span>
          <button
            type="button"
            className="icon-button"
            aria-pressed={muted}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            onClick={onToggleMute}
          >
            {muted ? 'Muted' : 'Sound'}
          </button>
          <button type="button" className="icon-button" onClick={onPause}>
            Away
          </button>
        </div>
      </header>

      <div className="ribbon-wrap">
        <nav className="ribbon" aria-label="Toolbar">
          {RIBBON.map((tab) => (
            <span key={tab} className={`ribbon-tab${tab === 'Home' ? ' is-active' : ''}`}>
              {tab}
            </span>
          ))}
          <span className="ribbon-spacer" />
          <span className="ribbon-note">Autosave on</span>
        </nav>

        <div className="ribbon-pane" aria-hidden="true">
          <div className="ribbon-group">
            <div className="ribbon-group-grid">
              {ALIGN_ICONS.map((icon) => (
                <span key={icon.key} className="ribbon-icon-btn" title={icon.label}>
                  <span className={`ribbon-icon ribbon-icon--${icon.key}`} />
                </span>
              ))}
            </div>
            <span className="ribbon-group-label">Align</span>
          </div>

          <div className="ribbon-group">
            <div className="ribbon-group-stack">
              <span className="ribbon-icon-btn ribbon-icon-btn--wide">
                <span className="ribbon-icon ribbon-icon--front" />
                Bring Forward
              </span>
              <span className="ribbon-icon-btn ribbon-icon-btn--wide">
                <span className="ribbon-icon ribbon-icon--back" />
                Send Backward
              </span>
            </div>
            <span className="ribbon-group-label">Arrange</span>
          </div>

          <div className="ribbon-group">
            <div className="ribbon-group-stack">
              <label className="ribbon-field">
                <span className="ribbon-icon ribbon-icon--height" />
                <span className="ribbon-field-value">1.2&quot;</span>
              </label>
              <label className="ribbon-field">
                <span className="ribbon-icon ribbon-icon--width" />
                <span className="ribbon-field-value">2.4&quot;</span>
              </label>
            </div>
            <span className="ribbon-group-label">Size</span>
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}
