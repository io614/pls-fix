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

      <nav className="ribbon" aria-label="Toolbar">
        {RIBBON.map((tab) => (
          <span key={tab} className={`ribbon-tab${tab === 'Home' ? ' is-active' : ''}`}>
            {tab}
          </span>
        ))}
        <span className="ribbon-spacer" />
        <span className="ribbon-note">Autosave on</span>
      </nav>

      {children}
    </div>
  )
}
