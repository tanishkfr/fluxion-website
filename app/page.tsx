import Image from 'next/image'
import type { CSSProperties, ReactNode } from 'react'

import ContactForm from '@/components/ContactForm'
import Track from '@/components/Track'
import { site } from '@/content/site'

/** Inline custom properties, which React's CSSProperties does not model. */
function vars(values: Record<string, string | number>): CSSProperties {
  return values as CSSProperties
}

/**
 * The chapter mark. This replaces the category eyebrow ("Philosophy", "What we
 * build", "Contact") the page used to carry: it still tells you where you are,
 * without labelling the chapter as a standard website section.
 */
function Mark({ n, label }: { n: string; label: string }) {
  return (
    <p className="mark">
      <span className="mark__n">{n}</span>
      <span className="mark__rule" aria-hidden="true" />
      <span className="mark__label">{label}</span>
    </p>
  )
}

/**
 * Renders a headline line, binding the signal dot to the final word so the two
 * can never be split across a break.
 *
 * A word joiner between them was not enough: against an `inline-block` the
 * break opportunity survives it, and on a 390px screen the dot ended up alone
 * on its own line at the left margin, 53px under the word it belongs to.
 * Holding the last word and the dot in one `nowrap` span moves them together
 * instead — the line wraps a word earlier, which is what it should have done.
 */
function Line({ text, dot }: { text: string; dot?: boolean }) {
  if (!dot) return <>{text}</>
  const words = text.split(' ')
  const last = words.pop() ?? ''
  const head = words.join(' ')
  return (
    <>
      {head}
      {head && ' '}
      <span className="keep">
        {last}
        <i className="dot" aria-hidden="true" />
      </span>
    </>
  )
}

/** Splits a sentence so each word can be lit as the scroll passes through it. */
function Sweep({ text, id }: { text: string; id?: string }) {
  const words = text.split(' ')
  return (
    <h2 className="sweep" id={id} style={vars({ '--n': words.length })}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="sweep__w" style={vars({ '--i': i })}>
            {word}
          </span>{' '}
        </span>
      ))}
    </h2>
  )
}

function Brandmark({ className = '' }: { className?: string }) {
  return (
    <span className={`brandmark ${className}`.trim()}>
      <Image
        className="brandmark__img brandmark__img--dark"
        src="/brand/wordmark-dark.png"
        alt=""
        width={669}
        height={42}
      />
      <Image
        className="brandmark__img brandmark__img--light"
        src="/brand/wordmark-light.png"
        alt=""
        width={669}
        height={42}
      />
    </span>
  )
}

/**
 * The three fragments, one per depth. They describe this page's own contact
 * endpoint rather than an imagined product: an interface, the shape of the
 * data behind it, and the route that carries it.
 */
const FRAGMENTS: ReactNode[] = [
  /*
    A specimen of this page's own type, set in the faces it is describing, with
    the real focus and motion values underneath. It used to be abstract grey
    bars — the only one of the three panels claiming nothing, sitting next to
    two that show the real schema and the real route.
  */
  <div className="frag frag--type" key="ui" aria-hidden="true">
    <div className="frag__bar">
      <span className="frag__dot" />
      <span className="frag__barlabel">interface</span>
    </div>
    <dl className="specimen">
      {site.depth.specimen.rows.map((row) => (
        <div className="specimen__row" key={row.face}>
          <dt className={`specimen__aa specimen__aa--${row.face}`}>Aa</dt>
          <dd className="specimen__meta">
            <span className="specimen__font">{row.font}</span>
            <span className="specimen__use">{row.use}</span>
          </dd>
        </div>
      ))}
    </dl>
    <ul className="specimen__notes">
      {site.depth.specimen.notes.map((note) => (
        <li key={note.label}>
          <span>{note.label}</span>
          <span>{note.value}</span>
        </li>
      ))}
    </ul>
  </div>,
  <pre className="frag frag--code" key="data" aria-hidden="true">{`enquiry {
  name       string   required
  email      email    required
  company    string   required
  need       enum     required
  budget     string   optional
  timeline   enum     optional
  message    string   10–4000
}`}</pre>,
  <pre className="frag frag--code" key="sys" aria-hidden="true">{`POST /api/contact
  honeypot     clear
  rate limit   5 / 10 min
  validate     7 fields
  deliver      reply-to sender
  ─────────────────────────
  200 ok`}</pre>,
]

export default function Home() {
  const layers = site.depth.layers
  const stages = site.process.stages
  const year = new Date().getFullYear()

  return (
    <>
      <main id="main">
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <Track as="section" id="top" className="hero" scene="hero" tone="dark" kind="pin">
          <div className="hero__stage">
            <div className="hero__inner">
              <p className="eyebrow hero__eyebrow">{site.hero.eyebrow}</p>
              <h1 className="hero__title">
                {site.hero.headline.map((line, i) => (
                  <span className="hero__line" key={line} style={vars({ '--d': `${0.1 + i * 0.08}s` })}>
                    <span className="hero__line-in">
                      <Line text={line} dot={i === site.hero.headline.length - 1} />
                      {/* Keeps the lines from running together in the accessible name. */}
                      {i < site.hero.headline.length - 1 && ' '}
                    </span>
                  </span>
                ))}
              </h1>
              <p className="hero__lede">{site.hero.lede}</p>
              <div className="hero__actions">
                <a className="btn btn--solid" href={site.hero.primary.href}>
                  {site.hero.primary.label}
                </a>
                <a className="btn btn--ghost" href={site.hero.secondary.href}>
                  {site.hero.secondary.label}
                </a>
              </div>
            </div>
            <p className="hero__cue" aria-hidden="true">
              <span>{site.hero.scrollCue}</span>
            </p>
          </div>
        </Track>

        {/* ── 01 Translation ─────────────────────────────────────────────── */}
        <Track
          as="section"
          id="philosophy"
          className="philosophy"
          scene="philosophy"
          tone="light"
          kind="through"
          labelledBy="philosophy-h"
        >
          <Track as="div" className="philosophy__lead" kind="sweep">
            <Mark n={site.philosophy.mark} label={site.philosophy.marker} />
            <Sweep text={site.philosophy.statement} id="philosophy-h" />
          </Track>
          <div className="philosophy__body">
            {site.philosophy.body.map((paragraph, i) => (
              <p key={i} data-reveal style={vars({ '--d': `${i * 0.1}s` })}>
                {paragraph}
              </p>
            ))}
          </div>
        </Track>

        {/* ── 02 Surface & system ────────────────────────────────────────── */}
        <Track
          as="section"
          id="depth"
          className="depth"
          scene="depth"
          tone="dark"
          kind="pin"
          labelledBy="depth-h"
        >
          <div className="depth__stage">
            <header className="depth__head">
              <Mark n={site.depth.mark} label={site.depth.marker} />
              <h2 id="depth-h" className="depth__lead">
                {site.depth.lead}
              </h2>
              <p className="depth__sub">{site.depth.sub}</p>
            </header>

            {/*
              One composition travelling inward. Each plane holds one depth;
              the plane you are leaving scales up and dissolves as you pass
              through it, and the next arrives from behind at a smaller scale.
              Everything is transform and opacity, so it stays on the
              compositor.
            */}
            <div className="depth__field">
              <ol className="planes">
                {layers.map((layer, i) => (
                  <li className="plane" key={layer.id} style={vars({ '--i': i })}>
                    <div className="plane__meta">
                      <p className="plane__depth">
                        <span className="plane__depth-n">{`0${i + 1}`}</span>
                        {layer.depth}
                      </p>
                      <h3 className="plane__title">{layer.title}</h3>
                      <p className="plane__body">{layer.body}</p>
                      <ul className="plane__detail">
                        {layer.detail.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="plane__frag">{FRAGMENTS[i]}</div>
                  </li>
                ))}
              </ol>
            </div>

            <ol className="depth__meter" aria-hidden="true">
              {layers.map((layer, i) => (
                <li key={layer.id} style={vars({ '--i': i })}>
                  <span className="depth__seg">
                    <span className="depth__fill" />
                  </span>
                  <span className="depth__label">{layer.depth}</span>
                </li>
              ))}
            </ol>

            <p className="depth__note">{site.depth.note}</p>
          </div>
        </Track>

        {/*
          Four of the five chapter boundaries announce themselves by flipping
          the ground between black and cornsilk. This one is dark to dark, so it
          had no signal at all. A red hairline draws itself across the full width
          as the boundary crosses the screen — the same language as the readouts.

          It carries its own progress rather than the chapter's: inside the pin,
          `--p` reaches 1 at the exact scroll position where this element first
          enters the viewport, so the rule would already be fully drawn before
          anyone could see it happen.
        */}
        <Track as="div" className="seam" kind="sweep">
          <span className="seam__rule" aria-hidden="true" />
        </Track>

        {/* ── 03 Four moves ──────────────────────────────────────────────── */}
        <Track
          as="section"
          id="process"
          className="process"
          scene="process"
          tone="dark"
          kind="pin"
          labelledBy="process-h"
        >
          <div className="process__stage">
            <header className="process__head">
              <Mark n={site.process.mark} label={site.process.marker} />
              <h2 id="process-h" className="process__lead">
                {site.process.lead}
              </h2>
            </header>
            <ol className="process__stages">
              {stages.map((stage, i) => (
                <li
                  className={i === stages.length - 1 ? 'stage stage--last' : 'stage'}
                  key={stage.name}
                  style={vars({ '--i': i })}
                >
                  <h3 className="stage__name">{stage.name}</h3>
                  <p className="stage__body">{stage.body}</p>
                </li>
              ))}
            </ol>
            <ol className="process__meter" aria-hidden="true">
              {stages.map((stage, i) => (
                <li key={stage.name} style={vars({ '--i': i })}>
                  <span className="process__seg">
                    <span className="process__fill" />
                  </span>
                  <span className="process__label">{stage.name}</span>
                </li>
              ))}
            </ol>
          </div>
        </Track>

        {/* ── 04 The two of us ───────────────────────────────────────────── */}
        <Track
          as="section"
          id="about"
          className="about"
          scene="about"
          tone="light"
          kind="through"
          labelledBy="about-h"
        >
          <div className="about__head">
            <Mark n={site.about.mark} label={site.about.marker} />
            <h2 id="about-h" className="about__title" data-reveal>
              {site.about.title}
            </h2>
          </div>
          <div className="about__story">
            {site.about.story.map((paragraph, i) => (
              <p key={i} data-reveal style={vars({ '--d': `${i * 0.1}s` })}>
                {paragraph}
              </p>
            ))}
          </div>
          <ul className="people">
            {site.about.people.map((person, i) => (
              <li className="person" key={person.name} data-reveal style={vars({ '--d': `${i * 0.1}s` })}>
                <h3 className="person__name">{person.name}</h3>
                <p className="person__role">{person.role}</p>
                <p className="person__study">{person.study}</p>
                <a className="link" href={person.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                  <span className="sr-only"> — {person.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </Track>

        {/* ── 05 Start here ──────────────────────────────────────────────── */}
        <Track
          as="section"
          id="contact"
          className="contact"
          scene="contact"
          tone="dark"
          kind="through"
          labelledBy="contact-h"
        >
          <div className="contact__intro">
            <Mark n={site.contact.mark} label={site.contact.marker} />
            <h2 id="contact-h" className="contact__title" data-reveal>
              {site.contact.title.map((line, i) => (
                <span className="contact__line" key={line}>
                  <Line text={line} dot={i === site.contact.title.length - 1} />
                  {i < site.contact.title.length - 1 && ' '}
                </span>
              ))}
            </h2>
            <p className="contact__body" data-reveal style={vars({ '--d': '0.1s' })}>
              {site.contact.body}
            </p>
            {/* Answered before the form, not in the success state after it. */}
            <dl className="expect" data-reveal style={vars({ '--d': '0.18s' })}>
              {site.contact.form.expect.map((item) => (
                <div className="expect__row" key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="contact__form">
            <ContactForm />
          </div>
        </Track>
      </main>

      <footer className="footer">
        <a className="footer__brand" href="#top">
          <Brandmark />
          <span className="sr-only">{site.name} — back to top</span>
        </a>
        <p className="footer__note">{site.footer.note}</p>
        <ul className="footer__links">
          {site.footer.links.map((link) => (
            <li key={link.href}>
              <a
                className="link"
                href={link.href}
                {...(link.href.startsWith('http')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="footer__legal">
          © {year} {site.name}
        </p>
      </footer>
    </>
  )
}
