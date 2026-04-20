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
    slug: "salesforce",
    date: "2022 —",
    project: "Salesforce",
    context: "Referral, Loyalty, Business Rules Engine",
    role: "Lead UX Designer",
    caseStudy: {
      problem:
        "Salesforce's industry solutions for Referral Marketing, Loyalty Management, and the Business Rules Engine each carry enterprise complexity — long configuration paths, branching logic, multi-role workflows. The common problem: turning that complexity into interfaces an operator can actually hold in their head.",
      approach:
        "I work across these product lines on scalable systems and usability in deep workflows, and on 0→1 experiences for new enterprise surfaces. Current focus: interaction grammar for Generative UI — how users think, create, and co-work with intelligent systems.",
      outcome:
        "Shipping across multiple industry clouds. Recognition includes the Singapore Good Design Award (SG Mark) 2024 for UX work in enterprise systems.",
      figures: [
        {
          src: "/img/work/placeholder.svg",
          width: 1600,
          height: 800,
          caption: "FIG. 02.1 — Salesforce industry solutions, 2024",
          alt: "Placeholder for Salesforce project imagery.",
        },
      ],
    },
  },
  {
    slug: "microsoft",
    date: "2020 — 2022",
    project: "Microsoft",
    context: "SharePoint, Viva Connections",
    role: "Designer",
    link: "https://techcommunity.microsoft.com/t5/intrazone-podcast/bg-p/IntrazonePodcast",
    caseStudy: {
      problem:
        "SharePoint on mobile served millions of enterprise users, but content discovery and collaboration lagged the desktop surface. In parallel, Microsoft Viva Connections was being built to unify the employee digital workplace — a new product inside a deeply established ecosystem.",
      approach:
        "Owned the SharePoint mobile experience and played a key design role on Viva Connections through General Availability. Focus areas: feed experience, content discoverability, and the patterns that let a new product sit cleanly alongside existing Microsoft 365 surfaces.",
      outcome:
        "Viva Connections shipped to GA. Featured guest on The Intrazone, Microsoft's SharePoint podcast, on the episode 'Building the Viva Connections Feed Experience.'",
      figures: [
        {
          src: "/img/work/placeholder.svg",
          width: 1600,
          height: 800,
          caption: "FIG. 02.2 — Viva Connections feed, 2021",
          alt: "Placeholder for Microsoft project imagery.",
        },
      ],
    },
  },
  {
    slug: "samsung",
    date: "2018 — 2020",
    project: "Samsung",
    context: "Galaxy wearables, connected home",
    role: "Senior Designer",
    caseStudy: {
      problem:
        "Samsung's wearable ecosystem needed two things at once: deeper ties into the connected home (via the Tap2Continue framework), and local relevance for the Indian market — where default watch faces weren't culturally resonant.",
      approach:
        "Led design explorations for Galaxy smartwatches on connected-home flows and Tap2Continue. Separately, designed culturally resonant watch faces for India, treating personalization as a first-class part of the product, not a post-launch skin.",
      outcome:
        "Shipped work across Galaxy wearables. The India-specific watch faces landed as a meaningful personalization channel inside the default Samsung wearable experience.",
      figures: [],
    },
  },
  {
    slug: "freshworks",
    date: "2018",
    project: "Freshworks",
    context: "Freshmarketer onboarding",
    role: "Product Designer",
    caseStudy: {
      problem:
        "Freshmarketer needed an onboarding flow that made sense inside the larger Freshworks product ecosystem — a first-time user experience that integrated cleanly with the suite, not a standalone funnel.",
      approach:
        "Designed the onboarding experience for Freshmarketer, focused on seamless integration and first-time user engagement across the Freshworks product family.",
      outcome:
        "A short stint — the onboarding work shipped into the Freshmarketer product.",
      figures: [],
    },
  },
];
