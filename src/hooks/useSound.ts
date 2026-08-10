import { useCallback, useEffect, useRef } from 'react'

export type SoundName =
  | 'snap'
  | 'click'
  | 'nudge'
  | 'notify'
  | 'complete'
  | 'error'
  | 'revert'
  | 'hint'

interface Voice {
  freq: number
  /** Seconds. */
  duration: number
  type?: OscillatorType
  gain?: number
  /** Seconds after the sound starts. */
  delay?: number
  /** Glide to this frequency over the note. */
  slideTo?: number
}

/** Everything is synthesised so the game ships with no audio assets. */
const RECIPES: Record<SoundName, Voice[]> = {
  snap: [{ freq: 660, duration: 0.07, type: 'sine', gain: 0.16, slideTo: 880 }],
  click: [{ freq: 320, duration: 0.035, type: 'triangle', gain: 0.09 }],
  nudge: [{ freq: 1180, duration: 0.022, type: 'sine', gain: 0.05 }],
  notify: [
    { freq: 784, duration: 0.09, type: 'sine', gain: 0.1 },
    { freq: 1046, duration: 0.11, type: 'sine', gain: 0.09, delay: 0.09 },
  ],
  complete: [
    { freq: 523.25, duration: 0.13, type: 'sine', gain: 0.11 },
    { freq: 659.25, duration: 0.13, type: 'sine', gain: 0.1, delay: 0.1 },
    { freq: 783.99, duration: 0.26, type: 'sine', gain: 0.11, delay: 0.2 },
  ],
  error: [{ freq: 210, duration: 0.14, type: 'sine', gain: 0.09, slideTo: 160 }],
  hint: [
    { freq: 880, duration: 0.08, type: 'sine', gain: 0.07 },
    { freq: 1174.66, duration: 0.12, type: 'sine', gain: 0.06, delay: 0.07 },
  ],
  revert: [
    { freq: 520, duration: 0.1, type: 'sine', gain: 0.09 },
    { freq: 392, duration: 0.16, type: 'sine', gain: 0.09, delay: 0.08 },
  ],
}

let ctx: AudioContext | null = null

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function emit(name: SoundName, master: number) {
  const ac = audioContext()
  if (!ac) return
  const now = ac.currentTime
  for (const voice of RECIPES[name]) {
    const start = now + (voice.delay ?? 0)
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = voice.type ?? 'sine'
    osc.frequency.setValueAtTime(voice.freq, start)
    if (voice.slideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(voice.slideTo, start + voice.duration)
    }
    const peak = (voice.gain ?? 0.1) * master
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + voice.duration)
    osc.connect(gain).connect(ac.destination)
    osc.start(start)
    osc.stop(start + voice.duration + 0.02)
  }
}

export function useSound(muted: boolean) {
  const mutedRef = useRef(muted)
  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  return useCallback((name: SoundName, volume = 1) => {
    if (mutedRef.current) return
    try {
      emit(name, volume)
    } catch {
      // Audio is decorative; a blocked context must never break gameplay.
    }
  }, [])
}
