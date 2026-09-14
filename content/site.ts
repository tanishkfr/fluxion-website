/**
 * Every word on the site lives here.
 *
 * Edit copy in this file and it updates everywhere. Nothing else needs to be
 * touched for a text change. Structural keys (ids, hrefs) are used by the
 * navigation and the scroll engine, so rename those with care.
 *
 * Chapter marks (`01 —` and so on) replace the category labels this page used
 * to carry. "Philosophy", "What we build", "Our process" and "Contact" told a
 * visitor nothing they could not already see, and made the page read as a
 * stack of standard sections rather than one story.
 */

export const site = {
  name: 'Fluxion Studios',
  shortName: 'Fluxion',
  tagline: 'Web design & development studio',
  email: 'fluxion.workspace@gmail.com',
  linkedin: 'https://www.linkedin.com/company/fluxion-studios/posts/?feedView=all',

  seo: {
    title: 'Fluxion Studios — Websites that feel unmistakably yours',
    description:
      'A web design and development studio for businesses with a point of view. Custom frontend, reliable backend systems, and web apps built to fit how you actually work.',
    keywords: [
      'web design studio',
      'web development studio',
      'custom frontend development',
      'backend development',
      'web apps',
      'dashboards',
      'Fluxion Studios',
    ],
  },

  /**
   * The studio's announcement strip, above the masthead. One line, repeated.
   * It is set in the page's micro type and uppercased in the stylesheet, like
   * every other eyebrow and label on the site — so the case here is the one it
   * is read in, not the one it is drawn in.
   */
  ticker: {
    text: 'New work ↗ Taamboolam Homestay — now live at taamboolam.com',
    href: 'https://taamboolam.com',
  },

  hero: {
    eyebrow: 'Fluxion Studios — Web design & development',
    /** Rendered line by line. The final word carries the signal dot. */
    headline: ['Websites that feel', 'unmistakably yours'],
    lede: 'We design and build for businesses with a point of view. The result should sound like you long before it sounds like us.',
    primary: { label: 'Start a project', href: '#contact' },
    secondary: { label: 'See how we work', href: '#process' },
    scrollCue: 'Scroll',
  },

  philosophy: {
    mark: '01',
    marker: 'Translation',
    /** Nav wayfinding. See the note on `nav` at the foot of this file. */
    navLabel: 'How we think',
    /** Revealed word by word as the section passes through the viewport. */
    statement:
      'A website should feel like the business behind it — the way it talks, the way it thinks, the way it treats people.',
    body: [
      'Every business has a way of doing things. A tone. A pace. Opinions about what matters and what really does not. Most of that gets flattened the moment it becomes a website.',
      'Our job is the translation. We take what makes you specific and find its equivalent on a screen — in structure, in type, in timing, in what you say first and what you leave out.',
    ],
  },

  /**
   * One chapter, three depths. This used to be two separate sections — a list
   * of the three things we build, then a second list of interface / data /
   * systems — which told the same three-layer story twice, thousands of pixels
   * apart. They are now the same move: the page travels inward through the
   * layers, and each layer is one of the things we make.
   */
  depth: {
    mark: '02',
    marker: 'Surface & system',
    navLabel: 'What we build',
    lead: 'The interface is only half the story.',
    sub: 'Three layers. We build all of them, so none of them quietly becomes your problem.',
    layers: [
      {
        id: 'frontend',
        depth: 'Interface',
        title: 'Built by hand, not assembled.',
        body: 'What people touch: type, spacing, motion, state. Every layout and transition written for your site specifically. It loads fast, it holds up on an old phone, and it works for someone using a keyboard.',
        detail: ['type scale', 'spacing system', 'focus states', 'motion timing'],
      },
      {
        id: 'backend',
        depth: 'Data',
        title: 'Quiet systems that hold.',
        body: 'What the interface is made of, shaped and validated before it ever reaches a screen. Forms that actually deliver. Content you can change without calling us. Data that ends up where it should.',
        detail: ['routes', 'validation', 'delivery', 'rate limits'],
      },
      {
        id: 'apps',
        depth: 'Systems',
        title: 'When a site has to do more than speak.',
        body: 'What keeps it upright. Bookings, accounts, internal tools, an admin view that makes sense to the person using it, and connections to the software you already run on.',
        detail: ['auth', 'dashboards', 'admin views', 'integrations'],
      },
    ],
    /**
     * Real values from this page's own stylesheet. The other two fragments show
     * the real schema and the real route; this one used to be abstract grey
     * bars, which made it the only panel of the three claiming nothing.
     */
    specimen: {
      rows: [
        { face: 'display', font: 'Nohemi 900', use: 'Headlines' },
        { face: 'label', font: 'Nohemi 500', use: 'Labels' },
        { face: 'body', font: 'Inter 400', use: 'Body copy' },
      ],
      notes: [
        { label: 'focus', value: '2px / offset 3px' },
        { label: 'motion', value: '160ms crisp · 900ms slow' },
      ],
    },
    /**
     * The fragments rendered alongside these layers describe this site's own
     * contact endpoint, so nothing here is invented. Keep them true if the
     * endpoint changes.
     */
    note: 'Those three panels are this page. That schema is the form at the bottom of it.',
  },

  /**
   * The mid-page CTA.
   *
   * Chapter 02 is where a visitor learns what we can actually build; the form
   * is six screens further down, and until now the only way to act between the
   * two was the button in the masthead. This is one line and one link, on the
   * seam the page already draws between 02 and 03 — not a section, and not a
   * pitch.
   */
  midCta: {
    line: 'Already know what you need building?',
    label: 'Start a project',
    href: '#contact',
    aside: 'Reply in 24–36 hours',
  },

  process: {
    mark: '03',
    marker: 'Four moves',
    navLabel: 'How we work',
    lead: 'Good work starts before the first pixel.',
    stages: [
      {
        name: 'Understand',
        body: 'We start with questions. What you actually do, who you do it for, and the thing you are tired of explaining.',
      },
      {
        name: 'Shape',
        body: 'Structure before surface. What the page says, in what order, and how it should feel to move through it.',
      },
      {
        name: 'Build',
        body: 'Written properly. Semantic markup, real accessibility, and a codebase the next person can read.',
      },
      {
        name: 'Refine',
        body: 'The last ten percent is the part people feel. Weight, timing, contrast — the small decisions that make it yours.',
      },
    ],
  },

  about: {
    mark: '04',
    marker: 'The two of us',
    navLabel: 'Who we are',
    title: 'Two people who kept coming back to this.',
    /**
      * Order matters here. This used to open on the attempts that did not work
      * and arrive at the competence second — on a page with no client work,
      * that made the first credibility signal a list of things that failed.
      * Same facts, same voice, nothing removed: the thing they are good at
      * leads, and the history follows it as context rather than as the pitch.
      */
    story: [
      'Tanishk and Shreyas are interface designers. It is the part of the work they were both good at and neither of them got bored of — the reason they stopped treating it as a side interest and started a studio around it.',
      'They have been friends for about six years and wanted to build something together for most of them. There were other attempts, a fashion label among them, that never quite found their footing. This one is the one that stuck, and it stuck because they were already doing it.',
    ],
    /**
      * `portrait` is the insertion point for founder photographs. It is
      * deliberately empty rather than a placeholder: the card renders complete
      * without it today, and drops a square portrait above the name the moment
      * a real path is put here. Put a square image in /public/brand/ and set
      * the path — no other change is needed, and nothing has to be redesigned.
      *
      * Do not point this at stock photography.
      */
    people: [
      {
        name: 'Tanishk',
        role: 'Co-Founder',
        study: 'Studies Human-Centred Design at Srishti.',
        portrait: '',
        linkedin: 'https://www.linkedin.com/in/tanishksalagame/',
      },
      {
        name: 'Shreyas',
        role: 'Co-Founder',
        study: 'Studies Interaction & UI/UX Design at PES.',
        portrait: '',
        linkedin: 'https://www.linkedin.com/in/shreyas-srinivasan-b44175353/',
      },
    ],
  },

  contact: {
    mark: '05',
    marker: 'Start here',
    title: ['Let’s make something', 'unmistakably yours'],
    body: 'Tell us what you are building and what is in the way. We will come back with honest thoughts on scope, timing, and whether we are the right studio for it.',
    form: {
      submit: 'Start a project',
      submitting: 'Sending…',
      fields: {
        name: { label: 'Your name', placeholder: 'Your full name' },
        email: { label: 'Email', placeholder: 'you@company.com' },
        company: {
          label: 'Business or company',
          optional: 'optional',
          placeholder: 'What it is called',
        },
        need: {
          label: 'What you need',
          placeholder: 'Pick the closest one',
          options: [
            'A new website',
            'A redesign of an existing site',
            'A web app or dashboard',
            'Backend work or integrations',
            'Something else, or not sure yet',
          ],
        },
        budget: {
          label: 'Budget',
          optional: 'optional',
          placeholder: 'A rough range is fine',
        },
        timeline: {
          label: 'Timeline',
          optional: 'optional',
          placeholder: 'No rush either way',
          options: [
            'As soon as possible',
            'In the next month or two',
            'Sometime this quarter',
            'Just planning ahead',
          ],
        },
        message: {
          label: 'Message',
          placeholder:
            'What the business does, what you want the site to do, and anything that is bugging you about the current one.',
        },
      },
      /**
       * Stated beside the form, not only in the success state. "Will they even
       * reply, and how long is this going to take" is the hesitation that stops
       * a small business sending anything at all — answering it after they have
       * already taken the risk is answering it too late.
       */
      /**
       * Four facts, all of them supplied and all of them true. They answer the
       * questions a visitor is actually holding when they reach the form —
       * when will I hear back, how long will this take, are they free, where
       * are they — before they decide whether to fill it in.
       *
       * Pricing is deliberately not a number here. See `pricing` below.
       */
      expect: [
        { label: 'Taking work', value: 'Right now' },
        { label: 'We reply in', value: '24–36 hours' },
        { label: 'Projects run', value: '3–6 weeks, depending on scope' },
        { label: 'Based in', value: 'Bengaluru, working worldwide' },
      ],
      /**
       * Kept as a phrase rather than a figure, on purpose.
       *
       * A public starting price does two things to a studio selling custom
       * work: it becomes the number every later quote is measured against, and
       * it invites comparison on cost with people who are not doing the same
       * job. The rest of this block already gives a visitor the concrete
       * footing they need — availability, reply time, timeline, location — so
       * the price is the one thing worth a conversation. The form's own budget
       * field is where the number gets discussed.
       */
      pricing: { label: 'Pricing', value: 'On enquiry' },
      success: {
        title: 'Got it.',
        body: 'Your message is with us. You will hear back within 24–36 hours — if it is urgent, email us directly.',
        again: 'Send another message',
      },
      errorFallback: 'Something went wrong on our end. You can email us directly instead:',
    },
  },

  footer: {
    note: 'Built in-house. Of course.',
    links: [
      { label: 'Email', href: 'mailto:fluxion.workspace@gmail.com' },
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/fluxion-studios/posts/?feedView=all',
      },
    ],
  },
} as const

/**
 * The nav is built from the chapter marks rather than kept as its own list.
 * They used to be maintained separately and had drifted: "What we build" led to
 * a chapter headed "02 — Surface & system", and three of the four links named
 * their destination something other than what it called itself. Derived, they
 * cannot disagree again.
 */
/**
 * The navigation.
 *
 * These used to read the chapter `marker` directly, so the link and the chapter
 * it pointed at could never disagree. That solved a real problem — they had
 * drifted once — but it solved it by making the nav say "Translation",
 * "Surface & system" and "Four moves". Those are good chapter titles and poor
 * signposts: a first-time visitor cannot tell which one holds the answer to
 * "what do they actually build".
 *
 * So each chapter now owns both strings, side by side in one object, and the
 * nav reads `navLabel`. The page keeps its title — with a full-size lead
 * directly beneath it doing the explaining — and the masthead says where each
 * link goes. Rename a chapter and both are in front of you.
 */
export const nav = [
  { href: '#philosophy', mark: site.philosophy.mark, label: site.philosophy.navLabel },
  { href: '#depth', mark: site.depth.mark, label: site.depth.navLabel },
  { href: '#process', mark: site.process.mark, label: site.process.navLabel },
  { href: '#about', mark: site.about.mark, label: site.about.navLabel },
] as const

export type Site = typeof site
