import { useEffect, useState } from 'react'
import type { Settings } from '../hooks/useGameState'
import SettingsPanel from './Settings'

interface Props {
  settings: Settings
  onSettingsChange: (patch: Partial<Settings>) => void
  onResume: () => void
  onResign: () => void
}

type View = 'menu' | 'settings' | 'resign'

export default function PauseMenu({ settings, onSettingsChange, onResume, onResign }: Props) {
  const [view, setView] = useState<View>('menu')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onResume()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onResume])

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Status: away">
      <div className="overlay-card">
        <p className="overlay-kicker">Status</p>
        <h2 className="overlay-title">Away</h2>

        {view === 'menu' ? (
          <div className="overlay-actions">
            <button type="button" className="cta cta--wide" onClick={onResume}>
              Return to work
            </button>
            <button type="button" className="ghost-button" onClick={() => setView('settings')}>
              Settings
            </button>
            <button type="button" className="ghost-button ghost-button--quiet" onClick={() => setView('resign')}>
              Resign
            </button>
          </div>
        ) : null}

        {view === 'settings' ? (
          <>
            <SettingsPanel settings={settings} onChange={onSettingsChange} />
            <button type="button" className="ghost-button" onClick={() => setView('menu')}>
              Back
            </button>
          </>
        ) : null}

        {view === 'resign' ? (
          <div className="overlay-confirm">
            <p className="overlay-question">Are you sure?</p>
            <p className="overlay-sub">Your contributions to the organisation are valued.</p>
            <div className="overlay-actions">
              <button type="button" className="cta cta--wide" onClick={() => setView('menu')}>
                Continue contributing
              </button>
              <button type="button" className="ghost-button ghost-button--quiet" onClick={onResign}>
                Resign anyway
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
