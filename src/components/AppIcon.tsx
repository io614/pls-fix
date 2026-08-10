import { useId } from 'react'

interface Props {
  className?: string
}

/**
 * The product mark. Built in the visual language of a modern office-suite tile:
 * gradient rounded square, bold white letterform, offset secondary panel.
 *
 * The secondary panel is rotated four degrees. This is deliberate.
 */
export default function AppIcon({ className }: Props) {
  // Gradient ids must be unique — the mark renders in several places at once.
  const gradientId = useId()

  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5aa2ef" />
          <stop offset="1" stopColor="#144f9f" />
        </linearGradient>
      </defs>
      <rect
        x="13"
        y="2.5"
        width="16.5"
        height="16.5"
        rx="3.2"
        fill="#93c6f7"
        transform="rotate(-4 21.25 10.75)"
      />
      <rect x="2.5" y="9" width="21" height="20.5" rx="4" fill={`url(#${gradientId})`} />
      <path d="M8.6 13.9h6.1a3.2 3.2 0 0 1 0 6.4h-3.6v4.2H8.6z" fill="#fff" />
    </svg>
  )
}
