import type { ReactNode } from 'react'
import AppIcon from './AppIcon'

interface Props {
  filename: string
  saveState: string
  taskTitle: string
  muted: boolean
  debug: boolean
  onToggleMute: () => void
  onPause: () => void
  onEscalate: () => void
  escalateLabel: string
  escalateDisabled: boolean
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

/*
 * Quick-access toolbar glyphs. Line icons rather than CSS shapes — at 16px the
 * stroke weight is what makes them read as an Office toolbar instead of blobs.
 */
const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function SaveIcon() {
  return (
    <svg className="qat-glyph" viewBox="0 0 16 16" {...strokeProps} strokeWidth={1.2}>
      <path d="M2.5 2.5h8.2l2.8 2.8v8.2a.5.5 0 0 1-.5.5h-10.5a.5.5 0 0 1-.5-.5v-10.5a.5.5 0 0 1 .5-.5z" />
      <path d="M5 2.5h5v4h-5z" />
      <path d="M4 9.5h8v4.5h-8z" />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg className="qat-glyph" viewBox="0 0 16 16" {...strokeProps} strokeWidth={1.4}>
      <path d="M5.5 4 2 7.5 5.5 11" />
      <path d="M2 7.5h6.5a3.75 3.75 0 0 1 0 7.5H6.5" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg
      className="qat-glyph qat-glyph--flip"
      viewBox="0 0 16 16"
      {...strokeProps}
      strokeWidth={1.4}
    >
      <path d="M2.6 9.6A5.2 5.2 0 1 1 8 14.2" />
      <path d="M.9 7.2 2.7 10.1 5.6 8.4" />
    </svg>
  )
}

function Caret() {
  return (
    <svg className="qat-caret" viewBox="0 0 8 8" {...strokeProps} strokeWidth={1}>
      <path d="M1.5 3 4 5.5 6.5 3" />
    </svg>
  )
}

/** The one ribbon command that does something. Flagged, in the Outlook sense. */
function FlagIcon() {
  return (
    <svg className="ribbon-flag" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M3.4 14.4V2.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4.6 2.6h7.6l-1.7 2.9 1.7 2.9H4.6z" fill="var(--red)" />
    </svg>
  )
}

export default function AppShell({
  filename,
  saveState,
  taskTitle,
  muted,
  debug,
  onToggleMute,
  onPause,
  onEscalate,
  escalateLabel,
  escalateDisabled,
  children,
}: Props) {
  return (
    <div className={`shell${debug ? ' is-debug' : ''}`}>
      <header className="titlebar">
        <div className="titlebar-left">
          <AppIcon className="app-mark" />
          <span className="app-name">pls fix</span>

          <span className="autosave" aria-hidden="true">
            <span className="autosave-label">AutoSave</span>
            <span className="autosave-switch">
              <span className="autosave-knob" />
            </span>
            <span className="autosave-state">On</span>
          </span>

          <span className="qat" aria-hidden="true">
            <span className="qat-btn" title="Save">
              <SaveIcon />
            </span>
            <span className="qat-btn qat-btn--split" title="Undo">
              <UndoIcon />
              <Caret />
            </span>
            <span className="qat-btn" title="Redo">
              <RedoIcon />
            </span>
            <span className="qat-btn qat-btn--overflow" title="Customize Quick Access Toolbar">
              <Caret />
            </span>
          </span>

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
          <span className="ribbon-note">Comments</span>
        </nav>

        {/* The pane is scenery except for Review, which is the real control. */}
        <div className="ribbon-pane">
          <div className="ribbon-group ribbon-group--font" aria-hidden="true">
            <div className="ribbon-group-stack">
              <div className="ribbon-row">
                <span className="ribbon-select ribbon-select--name">
                  Calibri (Body)
                  <Caret />
                </span>
                <span className="ribbon-select ribbon-select--size">
                  18
                  <Caret />
                </span>
              </div>
              <div className="ribbon-row">
                <span className="ribbon-icon-btn ribbon-type ribbon-type--b">B</span>
                <span className="ribbon-icon-btn ribbon-type ribbon-type--i">I</span>
                <span className="ribbon-icon-btn ribbon-type ribbon-type--u">U</span>
                <span className="ribbon-rule" />
                <span className="ribbon-icon-btn ribbon-swatch">
                  A<span className="ribbon-swatch-bar" />
                </span>
              </div>
            </div>
            <span className="ribbon-group-label">Font</span>
          </div>

          <div className="ribbon-group ribbon-group--para" aria-hidden="true">
            <div className="ribbon-group-stack">
              <div className="ribbon-row">
                {['bullets', 'numbers', 'outdent', 'indent'].map((k) => (
                  <span key={k} className="ribbon-icon-btn">
                    <span className={`ribbon-icon ribbon-icon--${k}`} />
                  </span>
                ))}
              </div>
              <div className="ribbon-row">
                {['left', 'center', 'right', 'justify'].map((k) => (
                  <span key={k} className="ribbon-icon-btn">
                    <span className={`ribbon-icon ribbon-icon--text-${k}`} />
                  </span>
                ))}
              </div>
            </div>
            <span className="ribbon-group-label">Paragraph</span>
          </div>

          <div className="ribbon-group ribbon-group--draw" aria-hidden="true">
            <div className="ribbon-gallery">
              {['rect', 'round', 'circle', 'tri', 'arrow', 'line'].map((k) => (
                <span key={k} className="ribbon-shape">
                  <span className={`ribbon-shape-glyph ribbon-shape-glyph--${k}`} />
                </span>
              ))}
            </div>
            <span className="ribbon-group-label">Drawing</span>
          </div>

          <div className="ribbon-group" aria-hidden="true">
            <div className="ribbon-group-grid">
              {ALIGN_ICONS.map((icon) => (
                <span key={icon.key} className="ribbon-icon-btn" title={icon.label}>
                  <span className={`ribbon-icon ribbon-icon--${icon.key}`} />
                </span>
              ))}
            </div>
            <span className="ribbon-group-label">Align</span>
          </div>

          <div className="ribbon-group" aria-hidden="true">
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

          <div className="ribbon-group" aria-hidden="true">
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

          <div className="ribbon-group">
            <button
              type="button"
              className="ribbon-cmd"
              onClick={onEscalate}
              disabled={escalateDisabled}
              title="Escalate for visibility on intended positioning (H)"
            >
              <FlagIcon />
              <span className="ribbon-cmd-label">{escalateLabel}</span>
            </button>
            <span className="ribbon-group-label">Review</span>
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}
