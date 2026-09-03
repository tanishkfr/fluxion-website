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

  /** Kept plain and scannable: the nav is wayfinding, not narrative. */
  nav: [
    { label: 'Our thinking', href: '#philosophy' },
    { label: 'What we build', href: '#depth' },
    { label: 'How we work', href: '#process' },
    { label: 'The two of us', href: '#about' },
  ],

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
     * The fragments rendered alongside these layers describe this site's own
     * contact endpoint, so nothing here is invented. Keep them true if the
     * endpoint changes.
     */
    note: 'Those three panels are this page. That schema is the form at the bottom of it.',
  },

  process: {
    mark: '03',
    marker: 'Four moves',
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
    title: 'Two people who kept coming back to this.',
    story: [
      'Tanishk and Shreyas have been friends for about six years, and have wanted to build something together for most of them. There were other attempts — a fashion label among them — that never quite found their footing.',
      'What kept surfacing was interface design. The part they were both good at, and neither of them got bored of. Fluxion is what happened when they stopped treating it as a side interest.',
    ],
    people: [
      {
        name: 'Tanishk',
        role: 'Co-Founder',
        study: 'Studies Human-Centred Design at Srishti.',
        linkedin: 'https://www.linkedin.com/in/tanishksalagame/',
      },
      {
        name: 'Shreyas',
        role: 'Co-Founder',
        study: 'Studies Interaction & UI/UX Design at PES.',
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
        company: { label: 'Business or company', placeholder: 'What it is called' },
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
      success: {
        title: 'Got it.',
        body: 'Your message is with us. We usually reply within a couple of days — if it is urgent, email us directly.',
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

export type Site = typeof site
