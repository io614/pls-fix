import type { Kpi } from '../game/scoring'

interface Props {
  kpis: Kpi[]
  rating?: string
}

export default function KPIWidget({ kpis, rating }: Props) {
  return (
    <section className="kpi-widget" aria-label="Performance indicators">
      <h2 className="panel-heading">
        Indicators
        <span className="panel-count">live</span>
      </h2>
      <ul className="kpi-list">
        {kpis.map((k) => (
          <li key={k.label} className="kpi-row">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-track" aria-hidden="true">
              <span
                className={`kpi-fill kpi-fill--${k.tone ?? 'neutral'}`}
                style={{ width: `${Math.min(100, Math.max(0, k.value))}%` }}
              />
            </span>
            <span className="kpi-value">
              {k.value}
              {k.unit}
            </span>
          </li>
        ))}
      </ul>
      {rating ? (
        <div className="kpi-rating">
          <span className="kpi-rating-label">Performance</span>
          <span className="kpi-rating-value">{rating}</span>
        </div>
      ) : null}
    </section>
  )
}
