import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppShell from './components/AppShell'
import KPIWidget from './components/KPIWidget'
import NotificationStack from './components/Notification'
import type { Toast } from './components/Notification'
import PauseMenu from './components/PauseMenu'
import PerformanceReview from './components/PerformanceReview'
import SplashScreen from './components/SplashScreen'
import StatusBar from './components/StatusBar'
import TaskPanel from './components/TaskPanel'
import type { ThreadEntry } from './components/TaskPanel'
import TitleScreen from './components/TitleScreen'
import Workspace from './components/Workspace'
import { ambientAt, escalationReply } from './content/notifications'
import { hasObjective, isShapeComplete } from './game/alignment'
import { resolveTolerance } from './game/constants'
import {
  applyTwist,
  attemptSolve,
  computeHints,
  instantiate,
  levelStatus,
  validateLevel,
} from './game/engine'
import { computeKpis, formatClock, performanceRating } from './game/scoring'
import type { GameShape, HintGhost, Level } from './game/types'
import { useDrag } from './hooks/useDrag'
import { useGameState, usePrefersReducedMotion } from './hooks/useGameState'
import { useSound } from './hooks/useSound'
import { LEVELS, levelAt } from './levels'

type Phase = 'working' | 'amending' | 'complete'

const FALLBACK_FILES: Record<string, string> = {
  slide: 'Deck_v3.pptx',
  doc: 'Summary_v4.docx',
  sheet: 'Model_v11.xlsx',
  board: 'Board_Pack.pptx',
}

const DEBUG =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === 'true'

function requestEntry(level: Level): ThreadEntry {
  return {
    key: `${level.id}-request`,
    name: level.sender.name,
    role: level.sender.role,
    time: level.sender.time ?? '09:00',
    lines: level.message,
  }
}

function fileFor(level: Level): string {
  return level.filename ?? FALLBACK_FILES[level.canvas.surface] ?? 'Untitled.pptx'
}

export default function App() {
  const game = useGameState()
  const reducedMotion = usePrefersReducedMotion(game.settings.reducedMotion)
  const play = useSound(game.settings.muted)

  const level = levelAt(game.activeIndex)
  const reviewing = game.reopened !== null
  const tol = useMemo(() => resolveTolerance(level.tolerance), [level])
  const surfaceRef = useRef<HTMLDivElement | null>(null)

  const [shapes, setShapes] = useState<GameShape[]>(() => instantiate(level))
  const [loadedFor, setLoadedFor] = useState(`${game.sessionKey}:${level.id}`)
  const [phase, setPhase] = useState<Phase>('working')
  const [thread, setThread] = useState<ThreadEntry[]>(() => [requestEntry(level)])
  /* Tagged with its session so a stale tick can never be read against a new level. */
  const [tick, setTick] = useState(() => ({ session: '', seconds: 0 }))
  const [deadline, setDeadline] = useState(300)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [filename, setFilename] = useState(() => fileFor(level))
  const [saveState, setSaveState] = useState('Saved locally.')
  const [twistIndex, setTwistIndex] = useState(0)
  const [meetingDelayed, setMeetingDelayed] = useState(false)
  const [ctaReady, setCtaReady] = useState(false)
  const [scale, setScale] = useState(1)
  const [hints, setHints] = useState<HintGhost[]>([])
  const [hintToken, setHintToken] = useState(0)
  const [escalations, setEscalations] = useState(0)
  const [hintCooling, setHintCooling] = useState(false)
  const [hintLeaving, setHintLeaving] = useState(false)
  const [fading, setFading] = useState(false)
  /* The launch splash shows once per page load, like the application it imitates. */
  const [splashDone, setSplashDone] = useState(false)

  const timers = useRef<number[]>([])
  const toastId = useRef(0)
  const firedNotifications = useRef(new Set<number>())
  const ambientIndex = useRef(0)
  const saveTimer = useRef<number | null>(null)

  /*
   * Swap the shapes in during render, not in an effect. If `shapes` were allowed to lag
   * one commit behind `level`, the new level would be evaluated against the previous
   * level's (already solved) shapes and complete itself instantly.
   */
  const sessionId = `${game.sessionKey}:${level.id}`
  if (loadedFor !== sessionId) {
    setLoadedFor(sessionId)
    setShapes(instantiate(level))
  }

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }, [])

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id)
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  /* Reset the rest of the session whenever the assigned task changes. */
  useEffect(() => {
    clearTimers()
    setPhase('working')
    setThread([requestEntry(level)])
    setTick({ session: sessionId, seconds: 0 })
    setDeadline(level.countdown ?? 300)
    setToasts([])
    setFilename(fileFor(level))
    setSaveState('Saved locally.')
    setTwistIndex(0)
    setMeetingDelayed(false)
    setCtaReady(false)
    setHints([])
    setHintLeaving(false)
    setHintCooling(false)
    // Each task is judged on its own merits.
    setEscalations(0)
    setFading(false)
    firedNotifications.current = new Set()
    ambientIndex.current = 0
    if (DEBUG) {
      const problems = validateLevel(level)
      if (problems.length > 0) console.warn(`[pls fix] ${level.id}:`, problems)
    }
  }, [sessionId, level, clearTimers])

  const pushToast = useCallback(
    (title: string, body?: string, tone?: Toast['tone']) => {
      toastId.current += 1
      const id = toastId.current
      setToasts((prev) => [...prev.slice(-2), { id, title, body, tone }])
      play('notify', 0.55)
      later(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6200)
    },
    [play, later],
  )

  const pushEntry = useCallback((entry: ThreadEntry) => {
    setThread((prev) => (prev.some((e) => e.key === entry.key) ? prev : [...prev, entry]))
  }, [])

  const noteSaving = useCallback(() => {
    setSaveState('Saving…')
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => setSaveState('Saved locally.'), 650)
  }, [])

  useEffect(
    () => () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    },
    [],
  )

  useEffect(() => {
    document.body.dataset.reducedMotion = reducedMotion ? 'true' : 'false'
  }, [reducedMotion])

  const elapsed = tick.session === sessionId ? tick.seconds : 0

  /**
   * Reveals the solution for a moment. Costs nothing mechanically, but the organisation
   * does notice: the escalation is acknowledged, and Ownership quietly drops.
   */
  const escalate = useCallback(() => {
    if (phase !== 'working' || hintCooling) return
    const ghosts = computeHints(shapes, level)
    if (ghosts.length === 0) return
    const rung = escalations + 1
    setHints(ghosts)
    setHintLeaving(false)
    setHintToken((n) => n + 1)
    setEscalations(rung)
    setHintCooling(true)
    play('hint')
    later(() => setHintLeaving(true), 1750)
    later(() => setHints([]), 2050)
    later(() => setHintCooling(false), 3400)
    // The reply lands while the answer is still on screen.
    const reply = escalationReply(rung)
    later(() => pushToast(reply.title, reply.body, reply.tone), 1200)
  }, [phase, hintCooling, shapes, level, escalations, play, later, pushToast])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'h' && e.key !== 'H') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = document.activeElement
      if (el instanceof HTMLSelectElement || el instanceof HTMLInputElement) return
      e.preventDefault()
      escalate()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [escalate])

  const status = useMemo(() => levelStatus(shapes, level), [shapes, level])

  const satisfiedIds = useMemo(() => {
    const set = new Set<string>()
    for (const s of shapes) if (hasObjective(s) && isShapeComplete(s, tol)) set.add(s.id)
    return set
  }, [shapes, tol])

  const interactive = phase === 'working' && !game.paused && game.screen === 'playing'

  const drag = useDrag({
    shapes,
    setShapes,
    constraints: level.constraints,
    tol,
    canvas: level.canvas,
    surfaceRef,
    interactive,
    snapEnabled: true,
    onGrab: () => play('click', 0.7),
    onSnap: () => play('snap'),
    onRelease: (moved) => {
      if (moved) noteSaving()
    },
    onNudge: () => play('nudge', 0.8),
  })

  /* Clock. Also drives scripted notifications and the deadline gag. */
  useEffect(() => {
    if (game.screen !== 'playing' || game.paused) return
    if (phase === 'complete') return
    const id = window.setInterval(
      () =>
        setTick((c) =>
          c.session === sessionId ? { ...c, seconds: c.seconds + 1 } : { session: sessionId, seconds: 0 },
        ),
      1000,
    )
    return () => window.clearInterval(id)
  }, [game.screen, game.paused, phase, sessionId])

  useEffect(() => {
    if (elapsed === 0) return

    for (const [i, n] of (level.notifications ?? []).entries()) {
      if (elapsed >= n.at && !firedNotifications.current.has(i)) {
        firedNotifications.current.add(i)
        pushToast(n.from ?? 'Message', n.text, n.tone ?? 'neutral')
      }
    }

    if (elapsed % 46 === 0) {
      const ambient = ambientAt(ambientIndex.current)
      ambientIndex.current += 1
      pushToast(ambient.title, ambient.body, ambient.tone)
    }

    if (level.countdown) {
      if (elapsed >= level.countdown && !meetingDelayed) {
        setMeetingDelayed(true)
        pushToast('Meeting delayed', undefined, 'system')
        later(() => pushToast('CEO running 15 mins late.', undefined, 'neutral'), 2400)
      }
    } else if (elapsed >= deadline) {
      setDeadline((d) => d + 300)
      pushToast('Deadline missed', 'Deadline extended.', 'system')
    }
  }, [elapsed, level, deadline, meetingDelayed, pushToast, later])

  /* Completion. */
  useEffect(() => {
    if (phase !== 'working' || !status.complete || game.screen !== 'playing') return

    const twists = level.twists ?? []
    if (twistIndex < twists.length) {
      const twist = twists[twistIndex]
      const tag = `${level.id}-twist${twistIndex}`
      setPhase('amending')
      play('complete', 0.7)

      const senderTime = level.sender.time ?? '09:00'
      for (const [i, line] of twist.interlude.entries()) {
        later(
          () =>
            pushEntry({
              key: `${tag}-interlude-${i}`,
              name: level.sender.name,
              role: level.sender.role,
              time: senderTime,
              lines: [line],
            }),
          400 + i * 1200,
        )
      }

      const noticeAt = 400 + twist.interlude.length * 1200 + 1600
      later(() => {
        pushEntry({
          key: `${tag}-notice`,
          name: twist.notice.from,
          role: twist.notice.role,
          time: twist.notice.time ?? senderTime,
          lines: [twist.notice.text],
        })
        play('revert')
      }, noticeAt)

      later(() => {
        setShapes((prev) => applyTwist(prev, level, twist))
        setTwistIndex((i) => i + 1)
        setPhase('working')
        if (twist.systemNote) {
          pushEntry({
            key: `${tag}-system`,
            name: 'system',
            time: '',
            lines: [twist.systemNote],
            tone: 'system',
          })
        }
        if (twist.toast) pushToast(twist.toast.title, twist.toast.body, 'system')
      }, noticeAt + 1100)
      return
    }

    setPhase('complete')
    play('complete')
    game.markComplete(level.id)

    const time = level.sender.time ?? '09:00'
    let offset = 500
    for (const [i, line] of level.completion.entries()) {
      later(
        () =>
          pushEntry({
            key: `${level.id}-completion-${i}`,
            name: level.sender.name,
            role: level.sender.role,
            time,
            lines: [line],
          }),
        offset,
      )
      offset += 1500
    }

    if (level.filenameAfter) {
      later(() => {
        setFilename(level.filenameAfter!)
        setSaveState('Saving…')
      }, offset)
      later(() => {
        setSaveState('Saved locally.')
        pushEntry({
          key: `${level.id}-saved`,
          name: 'system',
          time: '',
          lines: ['Saved.'],
          tone: 'system',
        })
      }, offset + 700)
    }

    // Replaying the finale must not restart the campaign out from under the player.
    if (level.finale && !reviewing) {
      later(() => setFading(true), 700)
      later(() => game.setScreen('review'), reducedMotion ? 1400 : 2400)
    } else {
      // Let the stakeholder finish talking before offering the next task.
      later(() => setCtaReady(true), offset + (level.filenameAfter ? 900 : 0))
    }
  }, [
    phase,
    status.complete,
    level,
    twistIndex,
    game,
    play,
    later,
    pushEntry,
    pushToast,
    reducedMotion,
    reviewing,
  ])

  const kpis = useMemo(
    () => computeKpis(level.id, status.smooth, elapsed, escalations),
    [level.id, status.smooth, elapsed, escalations],
  )

  /* The version history nobody has ever pruned. */
  const revisions = useMemo(() => {
    const base = filename.replace(/\.(pptx|xlsx|docx)$/, '')
    const ext = filename.slice(base.length)
    return [
      { name: filename, when: saveState === 'Saving…' ? 'saving' : 'now' },
      { name: `${base}_old${ext}`, when: '11:04' },
      { name: `${base.replace(/_?v?\d*$/, '')}_draft${ext}`, when: 'yesterday' },
      { name: `${base.slice(0, 10)}_DO_NOT_USE${ext}`, when: 'last week' },
    ]
  }, [filename, saveState])

  const rating = phase === 'complete' ? performanceRating(level.id, elapsed) : undefined

  const clock = level.countdown
    ? meetingDelayed
      ? '0:00'
      : formatClock(level.countdown - elapsed)
    : formatClock(deadline - elapsed)

  const clockLabel = level.countdown
    ? meetingDelayed
      ? 'Meeting delayed'
      : (level.countdownLabel ?? 'CEO review in')
    : 'until EOD'

  const statusText =
    phase === 'complete'
      ? 'Alignment approved'
      : phase === 'amending'
        ? 'Awaiting stakeholder input'
        : status.satisfied === status.total
          ? 'Reviewing'
          : 'Alignment pending'

  const ctaLabel =
    phase === 'complete' && ctaReady && (!level.finale || reviewing)
      ? reviewing
        ? 'Back to current task'
        : game.levelIndex >= LEVELS.length - 1
          ? 'Close task'
          : 'Open next task'
      : null

  const handleCta = useCallback(() => {
    play('click')
    if (reviewing) game.returnToCurrent()
    else game.advance()
  }, [game, play, reviewing])

  const handleReviewFinish = useCallback(() => {
    game.restartCampaign()
  }, [game])

  const dismissSplash = useCallback(() => setSplashDone(true), [])

  if (!splashDone) {
    return <SplashScreen onDone={dismissSplash} reducedMotion={reducedMotion} />
  }

  if (game.screen === 'title') {
    return (
      <TitleScreen
        hasProgress={game.hasProgress}
        completedCount={game.completed.length}
        totalCount={LEVELS.length}
        settings={game.settings}
        onSettingsChange={game.updateSettings}
        onContinue={game.hasProgress ? game.continueWork : game.startWork}
        onStartNew={game.startWork}
      />
    )
  }

  if (game.screen === 'review') {
    return <PerformanceReview onFinish={handleReviewFinish} reducedMotion={reducedMotion} />
  }

  return (
    <AppShell
      filename={filename}
      saveState={saveState}
      taskTitle={level.title}
      muted={game.settings.muted}
      debug={DEBUG}
      onToggleMute={game.toggleMute}
      onPause={() => game.setPaused(true)}
      onEscalate={escalate}
      escalateLabel={hintCooling ? 'Escalated.' : 'Escalate'}
      escalateDisabled={phase !== 'working' || hintCooling}
    >
      {DEBUG ? (
        <div className="debugbar">
          <span>debug</span>
          <select
            value={game.activeIndex}
            onChange={(e) => game.goToLevel(Number(e.target.value))}
            aria-label="Jump to level"
          >
            {LEVELS.map((l, i) => (
              <option key={l.id} value={i}>
                {i + 1}. {l.title}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setShapes(attemptSolve(level))}>
            solve
          </button>
          <button type="button" onClick={() => setShapes(instantiate(level))}>
            reset
          </button>
          <span>
            {status.satisfied}/{status.total} · tol {tol.position}px · snap {tol.snap}px
          </span>
        </div>
      ) : null}

      <div className="workarea">
        <TaskPanel
          levelIndex={game.levelIndex}
          activeIndex={game.activeIndex}
          onOpenTask={game.reopenLevel}
          completedIds={game.completed}
          thread={thread}
          ctaLabel={ctaLabel}
          onCta={handleCta}
        />

        <Workspace
          level={level}
          shapes={shapes}
          selectedId={drag.selectedId}
          activeId={drag.activeId}
          guides={drag.guides}
          gaps={drag.gaps}
          hints={hints}
          hintToken={hintToken}
          hintLeaving={hintLeaving}
          snapPulse={drag.snapPulse}
          interactive={interactive}
          debug={DEBUG}
          satisfiedIds={satisfiedIds}
          fading={fading}
          surfaceRef={surfaceRef}
          onShapePointerDown={drag.onShapePointerDown}
          onHandlePointerDown={drag.onHandlePointerDown}
          onRotatePointerDown={drag.onRotatePointerDown}
          onSelect={drag.setSelectedId}
          onKeyDown={drag.onKeyDown}
          onScale={setScale}
        />

        <div className="rail">
          <KPIWidget kpis={kpis} rating={rating} />
          <section className="rail-section">
            <h2 className="panel-heading">Revision history</h2>
            <ul className="revisions">
              {revisions.map((rev) => (
                <li key={rev.name}>
                  <span>{rev.name}</span>
                  <span>{rev.when}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <StatusBar
        taskLabel={`Task ${game.activeIndex + 1} of ${LEVELS.length}`}
        taskReopened={reviewing}
        status={statusText}
        note={level.statusNote}
        satisfied={status.satisfied}
        total={status.total}
        progress={status.smooth}
        showProgress={game.settings.showObjectives}
        clock={clock}
        clockLabel={clockLabel}
        clockUrgent={Boolean(level.countdown) && !meetingDelayed && level.countdown! - elapsed < 60}
        nudgeHint={Boolean(drag.selectedId) && interactive}
        zoom={`${Math.round(scale * 100)}%`}
        onHint={escalate}
        hintDisabled={phase !== 'working' || hintCooling}
        hintLabel={hintCooling ? 'Escalated.' : 'Escalate'}
      />

      <NotificationStack toasts={toasts} />

      {game.paused ? (
        <PauseMenu
          settings={game.settings}
          onSettingsChange={game.updateSettings}
          onResume={() => game.setPaused(false)}
          onResign={game.resign}
        />
      ) : null}
    </AppShell>
  )
}
