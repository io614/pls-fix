import { useEffect, useState } from 'react'
import { CAST } from '../content/messages'

interface Props {
  onFinish: () => void
  reducedMotion: boolean
}

const RATINGS: [string, string][] = [
  ['Execution', 'Meets Expectations'],
  ['Stakeholder Management', 'Meets Expectations'],
  ['Alignment', 'Meets Expectations'],
  ['Leadership', 'Developing'],
]

type Phase = 'review' | 'ended' | 'assigned'

export default function PerformanceReview({ onFinish, reducedMotion }: Props) {
  const [phase, setPhase] = useState<Phase>('review')

  useEffect(() => {
    if (phase !== 'ended') return
    const delay = reducedMotion ? 900 : 2200
    const t = setTimeout(() => setPhase('assigned'), delay)
    return () => clearTimeout(t)
  }, [phase, reducedMotion])

  if (phase === 'review') {
    return (
      <div className="review-screen">
        <div className="review-sheet">
          <header className="review-head">
            <p className="review-kicker">Confidential · People &amp; Culture</p>
            <h1 className="review-title">FY26 Performance Review</h1>
            <dl className="review-meta">
              <div>
                <dt>Employee</dt>
                <dd>A. Person</dd>
              </div>
              <div>
                <dt>Function</dt>
                <dd>Alignment</dd>
              </div>
              <div>
                <dt>Reviewer</dt>
                <dd>
                  {CAST.marcus.name} · {CAST.marcus.role}
                </dd>
              </div>
            </dl>
          </header>

          <section className="review-ratings">
            {RATINGS.map(([label, value]) => (
              <div className="review-rating" key={label}>
                <span className="review-rating-label">{label}</span>
                <span className="review-rating-rule" aria-hidden="true" />
                <span className="review-rating-value">{value}</span>
              </div>
            ))}
          </section>

          <section className="review-feedback">
            <h2>Manager feedback</h2>
            <p>Consistently delivered against alignment objectives.</p>
            <p>Demonstrated strong attention to positioning and formatting.</p>
            <p>
              Going forward, we would like to see greater strategic ownership of shape
              alignment and cross-functional spacing.
            </p>
          </section>

          <section className="review-award">
            <p className="review-award-title">Employee of the Month</p>
            <p className="review-award-body">Exceptional commitment to alignment.</p>
          </section>

          <button type="button" className="cta cta--wide" onClick={() => setPhase('ended')}>
            Acknowledge
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'ended') {
    return (
      <div className="review-screen review-screen--plain">
        <p className="review-terminal">Your session has ended.</p>
      </div>
    )
  }

  return (
    <div className="review-screen review-screen--plain">
      <div className="review-newtask">
        <p className="review-terminal">New task assigned.</p>
        <article className="message message--incoming review-message">
          <header className="message-head">
            <span className="avatar" aria-hidden="true">
              MA
            </span>
            <span className="message-who">
              <span className="message-name">{CAST.marcus.name}</span>
              <span className="message-role">{CAST.marcus.role}</span>
            </span>
            <time className="message-time">08:12</time>
          </header>
          <div className="message-body">
            <p>pls fix</p>
          </div>
        </article>
        <button type="button" className="cta cta--wide" onClick={onFinish}>
          Open task
        </button>
      </div>
    </div>
  )
}
