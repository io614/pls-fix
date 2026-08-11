import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LOADING_COPY } from '../content/messages'
import AppIcon from './AppIcon'

interface Props {
  onDone: () => void
  reducedMotion: boolean
}

const STEPS = 3
const STEP_MS = 720
/* Long enough to register as a hand-off, short enough not to be a wait. */
const EXIT_MS = 260

/** A different set of meaningless preparations each launch. */
function pickCopy(): string[] {
  const pool = [...LOADING_COPY]
  const picked: string[] = []
  while (picked.length < STEPS && pool.length > 0) {
    picked.push(...pool.splice(Math.floor(Math.random() * pool.length), 1))
  }
  return picked
}

/**
 * The launch splash. Every application of this kind insists on telling you what it
 * is doing while it starts, and none of it is ever verifiable.
 *
 * Dismissable at any point, and skipped almost entirely under reduced motion, so
 * it is never something to sit through twice.
 */
export default function SplashScreen({ onDone, reducedMotion }: Props) {
  const copy = useMemo(pickCopy, [])
  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const closing = useRef(false)

  /*
   * Fades itself out before handing over. Without a break the title screen —
   * same mark, same wordmark, same centred card — simply replaces this one, and
   * the opening it plays on arrival is invisible against a near-identical image.
   */
  const finish = useCallback(() => {
    if (closing.current) return
    closing.current = true
    if (reducedMotion) {
      onDone()
      return
    }
    setLeaving(true)
    window.setTimeout(onDone, EXIT_MS)
  }, [onDone, reducedMotion])

  useEffect(() => {
    if (reducedMotion) {
      const t = window.setTimeout(finish, 420)
      return () => window.clearTimeout(t)
    }

    const id = window.setInterval(() => {
      setStep((s) => {
        if (s + 1 >= copy.length) {
          window.clearInterval(id)
          finish()
          return s
        }
        return s + 1
      })
    }, STEP_MS)

    return () => window.clearInterval(id)
  }, [copy.length, finish, reducedMotion])

  /* Nobody should be made to watch this a second time. */
  useEffect(() => {
    const skip = () => finish()
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [finish])

  return (
    <div className={`splash${leaving ? ' is-leaving' : ''}`} role="status" aria-label="Starting pls fix">
      <div className="splash-window">
        <AppIcon className="splash-mark" />
        <h1 className="splash-word">pls fix</h1>
        <p className="splash-sub">Corporate Alignment Suite</p>

        <span className="splash-track" aria-hidden="true">
          <span className="splash-fill" />
        </span>

        <p className="splash-status">{copy[step]}…</p>

        <p className="splash-footer">Please do not turn off your computer.</p>
      </div>
    </div>
  )
}
