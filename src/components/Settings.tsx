import type { Settings } from '../hooks/useGameState'

interface Props {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
}

const MOTION_OPTIONS: { label: string; value: boolean | null }[] = [
  { label: 'System', value: null },
  { label: 'Full', value: false },
  { label: 'Reduced', value: true },
]

export default function SettingsPanel({ settings, onChange }: Props) {
  return (
    <div className="settings">
      <div className="settings-row">
        <span className="settings-label">Sound</span>
        <div className="segmented" role="group" aria-label="Sound">
          <button
            type="button"
            className={!settings.muted ? 'is-on' : ''}
            aria-pressed={!settings.muted}
            onClick={() => onChange({ muted: false })}
          >
            On
          </button>
          <button
            type="button"
            className={settings.muted ? 'is-on' : ''}
            aria-pressed={settings.muted}
            onClick={() => onChange({ muted: true })}
          >
            Muted
          </button>
        </div>
      </div>

      <div className="settings-row">
        <span className="settings-label">Motion</span>
        <div className="segmented" role="group" aria-label="Motion">
          {MOTION_OPTIONS.map((o) => (
            <button
              key={o.label}
              type="button"
              className={settings.reducedMotion === o.value ? 'is-on' : ''}
              aria-pressed={settings.reducedMotion === o.value}
              onClick={() => onChange({ reducedMotion: o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-row">
        <span className="settings-label">Progress readout</span>
        <div className="segmented" role="group" aria-label="Progress readout">
          <button
            type="button"
            className={settings.showObjectives ? 'is-on' : ''}
            aria-pressed={settings.showObjectives}
            onClick={() => onChange({ showObjectives: true })}
          >
            Shown
          </button>
          <button
            type="button"
            className={!settings.showObjectives ? 'is-on' : ''}
            aria-pressed={!settings.showObjectives}
            onClick={() => onChange({ showObjectives: false })}
          >
            Hidden
          </button>
        </div>
      </div>

      <p className="settings-note">
        Settings are stored locally. Undo remains unavailable due to organisational policy.
      </p>
    </div>
  )
}
