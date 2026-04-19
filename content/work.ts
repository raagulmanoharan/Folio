export type Figure = {
  src: string;
  width: number;
  height: number;
  caption: string;
  alt: string;
};

export type WorkRow = {
  slug: string;
  date: string;
  project: string;
  context: string;
  role: string;
  link?: string;
  caseStudy: {
    problem: string;
    approach: string;
    outcome: string;
    figures: Figure[];
  } | null;
};

export const work: WorkRow[] = [
  {
    slug: "logic-kit",
    date: "2026",
    project: "Logic Kit",
    context: "Salesforce, internal",
    role: "Lead designer",
    caseStudy: {
      problem:
        "Agent surfaces across the org were inventing interaction patterns in isolation. The same primitive — a confirmation, a rollback, a tool-call preview — shipped in five different shapes. Onboarding a new agent team took weeks because there was no shared grammar.",
      approach:
        "Audited twelve surfaces, extracted the recurring primitives, and defined a small kit: defaults, confirmations, interruptions, tool previews, rollback, and attribution. Each primitive has a behavioral spec, not just a visual one — what it does, when, and what it cannot do.",
      outcome:
        "Three agent teams now ship against the kit. Design review time for new agent flows dropped materially. The kit is the interface between design, research, and eng.",
      figures: [
        {
          src: "/img/work/placeholder.svg",
          width: 1600,
          height: 800,
          caption: "FIG. 03.1 — Logic Kit component inventory, 2026",
          alt: "Component inventory diagram showing twelve agent UI primitives in a 1px grid.",
        },
      ],
    },
  },
  {
    slug: "atelier",
    date: "2026",
    project: "Atelier",
    context: "Independent R&D",
    role: "Designer / build",
    caseStudy: {
      problem:
        "Design work lives in too many tools. Canvas, docs, chat, archive — the stitches show. I wanted one surface where a project could be sketched, annotated, and published without context-switching.",
      approach:
        "Built a single-canvas tool with typed notes, inline embeds, and a thin publishing layer. No templates, no sidebars, no onboarding. The constraint was: zero settings.",
      outcome:
        "In daily use for six months. Used to write this site, among other things. Not public yet.",
      figures: [
        {
          src: "/img/work/placeholder.svg",
          width: 1600,
          height: 800,
          caption: "FIG. 03.2 — Atelier canvas detail, 2026",
          alt: "Stylized desktop canvas with floating note cards and a left tool strip.",
        },
      ],
    },
  },
  {
    slug: "budgy",
    date: "2025",
    project: "Budgy",
    context: "Independent",
    role: "Designer / build",
    link: "https://budgy.chat",
    caseStudy: {
      problem:
        "Budgeting apps ask too much. I wanted to track spending without opening an app — just a chat, the way I already talk to friends about money.",
      approach:
        "WhatsApp bot. One line in, one line back. Categories are learned, not configured. Weekly summary on Sundays. No charts, no streaks, no gamification.",
      outcome:
        "Running since early 2025. A few hundred users. Read-only for now.",
      figures: [
        {
          src: "/img/work/placeholder.svg",
          width: 1600,
          height: 800,
          caption: "FIG. 03.3 — Budgy conversation sample, 2025",
          alt: "Stylized WhatsApp conversation showing a spending entry and bot summary.",
        },
      ],
    },
  },
  {
    slug: "design-days-diary",
    date: "2024",
    project: "Design Days Diary",
    context: "Book project",
    role: "Editor / design",
    caseStudy: {
      problem:
        "A group of designers had been writing process notes for years without a home. The writing was good; the publishing bar was in the way.",
      approach:
        "Edited, sequenced, and set a 200-page softcover. Mono body, sans heads, wide outer margin for marginalia. Print-first, web as a secondary.",
      outcome:
        "Printed 300 copies. Sold out the first run. The writing is the product; the book is the frame.",
      figures: [
        {
          src: "/img/work/placeholder.svg",
          width: 1600,
          height: 800,
          caption: "FIG. 03.4 — Design Days Diary spread, 2024",
          alt: "Overhead photograph of an open book showing a dense two-column mono layout.",
        },
      ],
    },
  },
  {
    slug: "prior-1",
    date: "2023",
    project: "[PRIOR PROJECT 1]",
    context: "Salesforce",
    role: "IC → lead",
    caseStudy: null,
  },
  {
    slug: "prior-2",
    date: "2020",
    project: "[PRIOR PROJECT 2]",
    context: "Earlier role",
    role: "IC",
    caseStudy: null,
  },
];
