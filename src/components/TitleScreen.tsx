import { useState } from 'react'
import type { Settings } from '../hooks/useGameState'
import SettingsPanel from './Settings'

interface Props {
  hasProgress: boolean
  completedCount: number
  totalCount: number
  settings: Settings
  onSettingsChange: (patch: Partial<Settings>) => void
  onContinue: () => void
  onStartNew: () => void
}

export default function TitleScreen({
  hasProgress,
  completedCount,
  totalCount,
  settings,
  onSettingsChange,
  onContinue,
  onStartNew,
}: Props) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <main className="title-screen">
      <div className="title-inner">
        <div className="title-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h1 className="title-word">pls fix</h1>
        <p className="title-tagline">A corporate alignment simulator.</p>

        <div className="title-actions">
          <button type="button" className="cta cta--wide" onClick={onContinue}>
            {hasProgress ? 'Continue work' : 'Start work'}
          </button>
          <button type="button" className="ghost-button" onClick={() => setShowSettings((v) => !v)}>
            Settings
          </button>
          {hasProgress ? (
            <button type="button" className="ghost-button ghost-button--quiet" onClick={onStartNew}>
              Start new role
            </button>
          ) : null}
        </div>

        {showSettings ? <SettingsPanel settings={settings} onChange={onSettingsChange} /> : null}

        {hasProgress ? (
          <p className="title-progress">
            {completedCount} of {totalCount} tasks closed
          </p>
        ) : null}

        <p className="title-footnote">Build 26.3.1 · internal use only</p>
      </div>
    </main>
  )
}
