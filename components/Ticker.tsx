import { site } from '@/content/site'

/**
 * The announcement strip above the masthead.
 *
 * The whole strip is the link, not a word inside it. The line is repeated
 * enough times to fill the widest screen twice over and the track slides by
 * exactly half its own width, so the loop restarts on a copy identical to the
 * one it began on — no jump, and no gap, because one half is wider than the
 * viewport it is shown on.
 *
 * There is no JavaScript and no animation dependency here: it is one CSS
 * keyframe on a `max-content` row. The repeated copies are hidden from
 * assistive tech, which takes the strip's meaning from the link's own label.
 */
const REPEATS = 10

export default function Ticker() {
  const { text, href } = site.ticker

  return (
    <a
      className="ticker"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} — opens in a new tab`}
    >
      <span className="ticker__track">
        {Array.from({ length: REPEATS * 2 }, (_, i) => (
          <span className="ticker__item" key={i} aria-hidden="true">
            {text}
          </span>
        ))}
      </span>
    </a>
  )
}
