import { useCallback, useEffect, useMemo, useState } from 'react'
import { LEVELS } from '../levels'

const STORAGE_KEY = 'pls-fix.save.v1'

export type Screen = 'title' | 'playing' | 'review'

export interface Settings {
  muted: boolean
  /** null follows the OS preference. */
  reducedMotion: boolean | null
  showObjectives: boolean
}

export interface SaveData {
  levelIndex: number
  completed: string[]
  settings: Settings
}

const DEFAULT_SAVE: SaveData = {
  levelIndex: 0,
  completed: [],
  settings: { muted: false, reducedMotion: null, showObjectives: true },
}

function readSave(): SaveData {
  if (typeof localStorage === 'undefined') return DEFAULT_SAVE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SAVE
    const parsed = JSON.parse(raw) as Partial<SaveData>
    const levelIndex = Math.min(Math.max(parsed.levelIndex ?? 0, 0), LEVELS.length - 1)
    return {
      levelIndex,
      completed: Array.isArray(parsed.completed) ? parsed.completed.filter((v) => typeof v === 'string') : [],
      settings: { ...DEFAULT_SAVE.settings, ...parsed.settings },
    }
  } catch {
    return DEFAULT_SAVE
  }
}

function writeSave(save: SaveData) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
  } catch {
    // Storage can be unavailable in private modes; progress simply will not persist.
  }
}

export function useGameState() {
  const [save, setSave] = useState<SaveData>(readSave)
  const [screen, setScreen] = useState<Screen>('title')
  const [paused, setPaused] = useState(false)
  /** Bumped whenever a fresh run begins, so a level restarts even at the same index. */
  const [sessionKey, setSessionKey] = useState(0)
  /*
   * A closed task the player has reopened to look at again. Deliberately separate
   * from levelIndex — revisiting old work must never move the campaign pointer —
   * and deliberately not persisted, so a refresh returns to the real assignment.
   */
  const [reopened, setReopened] = useState<number | null>(null)

  useEffect(() => {
    writeSave(save)
  }, [save])

  const hasProgress = save.completed.length > 0 || save.levelIndex > 0

  const startWork = useCallback(() => {
    setSave((s) => ({ ...s, levelIndex: 0, completed: [] }))
    setReopened(null)
    setSessionKey((k) => k + 1)
    setScreen('playing')
  }, [])

  const continueWork = useCallback(() => setScreen('playing'), [])

  const goToLevel = useCallback((index: number) => {
    setSave((s) => ({ ...s, levelIndex: Math.min(Math.max(index, 0), LEVELS.length - 1) }))
    setReopened(null)
    setSessionKey((k) => k + 1)
    setScreen('playing')
  }, [])

  /** Reopen a closed task for another look. Progress is left exactly where it was. */
  const reopenLevel = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), LEVELS.length - 1)
      // Reopening the task you are already assigned is just going back to work.
      setReopened(clamped === save.levelIndex ? null : clamped)
      setSessionKey((k) => k + 1)
      setScreen('playing')
    },
    [save.levelIndex],
  )

  const returnToCurrent = useCallback(() => {
    setReopened(null)
    setSessionKey((k) => k + 1)
  }, [])

  const markComplete = useCallback((levelId: string) => {
    setSave((s) =>
      s.completed.includes(levelId) ? s : { ...s, completed: [...s.completed, levelId] },
    )
  }, [])

  const advance = useCallback(() => {
    setSave((s) => ({ ...s, levelIndex: Math.min(s.levelIndex + 1, LEVELS.length - 1) }))
  }, [])

  const restartCampaign = useCallback(() => {
    setSave((s) => ({ ...s, levelIndex: 0, completed: [] }))
    setReopened(null)
    setSessionKey((k) => k + 1)
    setScreen('playing')
  }, [])

  const resign = useCallback(() => {
    setPaused(false)
    setReopened(null)
    setScreen('title')
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSave((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const toggleMute = useCallback(() => {
    setSave((s) => ({ ...s, settings: { ...s.settings, muted: !s.settings.muted } }))
  }, [])

  return useMemo(
    () => ({
      screen,
      setScreen,
      paused,
      sessionKey,
      setPaused,
      levelIndex: save.levelIndex,
      /** The task actually on screen, which may be a reopened one. */
      activeIndex: reopened ?? save.levelIndex,
      reopened,
      completed: save.completed,
      settings: save.settings,
      hasProgress,
      startWork,
      continueWork,
      goToLevel,
      reopenLevel,
      returnToCurrent,
      markComplete,
      advance,
      restartCampaign,
      resign,
      updateSettings,
      toggleMute,
    }),
    [
      screen,
      paused,
      sessionKey,
      save.levelIndex,
      reopened,
      save.completed,
      save.settings,
      hasProgress,
      startWork,
      continueWork,
      goToLevel,
      reopenLevel,
      returnToCurrent,
      markComplete,
      advance,
      restartCampaign,
      resign,
      updateSettings,
      toggleMute,
    ],
  )
}

export function usePrefersReducedMotion(override: boolean | null): boolean {
  const [system, setSystem] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => setSystem(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return override ?? system
}
