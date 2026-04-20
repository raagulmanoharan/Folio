export type CaseStudySection = {
  heading: string;
  body: string[];
};

export type CaseStudyFigure = {
  src: string;
  width: number;
  height: number;
  caption: string;
  alt: string;
  placement: "after-section" | "inline";
  afterHeading?: string;
};

export type CaseStudy = {
  summary: string;
  atmosphere: "index" | "profile" | "currently" | "work" | "writing" | "contact";
  sections: CaseStudySection[];
  figures: CaseStudyFigure[];
  externalLink?: {
    label: string;
    href: string;
  };
};

export type WorkRow = {
  slug: string;
  date: string;
  project: string;
  context: string;
  role: string;
  caseStudy: CaseStudy | null;
};

export const work: WorkRow[] = [
  {
    slug: "salesforce",
    date: "2022 —",
    project: "Salesforce",
    context: "Referral, Loyalty, Business Rules Engine",
    role: "Lead UX Designer",
    caseStudy: {
      summary:
        "Enterprise workflows for Salesforce industry clouds — loyalty, referral, and the Business Rules Engine.",
      atmosphere: "work",
      sections: [
        {
          heading: "Context",
          body: [
            "Salesforce's industry solutions for Referral Marketing, Loyalty Management, and the Business Rules Engine each carry enterprise complexity — long configuration paths, branching logic, multi-role workflows. The common problem: turning that complexity into interfaces an operator can actually hold in their head.",
          ],
        },
        {
          heading: "Approach",
          body: [
            "I work across these product lines on scalable systems and usability in deep workflows, and on 0→1 experiences for new enterprise surfaces. Current focus: interaction grammar for Generative UI — how users think, create, and co-work with intelligent systems.",
          ],
        },
        {
          heading: "Outcome",
          body: [
            "Shipping across multiple industry clouds. Recognition includes the Singapore Good Design Award (SG Mark) 2024 for UX work in enterprise systems.",
          ],
        },
      ],
      figures: [],
    },
  },
  {
    slug: "microsoft",
    date: "2020 — 2022",
    project: "Microsoft",
    context: "SharePoint, Viva Connections",
    role: "Designer",
    caseStudy: {
      summary:
        "SharePoint on mobile and Viva Connections — unifying the Microsoft 365 employee workplace.",
      atmosphere: "work",
      sections: [
        {
          heading: "Context",
          body: [
            "SharePoint on mobile served millions of enterprise users, but content discovery and collaboration lagged the desktop surface. In parallel, Microsoft Viva Connections was being built to unify the employee digital workplace — a new product inside a deeply established ecosystem.",
          ],
        },
        {
          heading: "Approach",
          body: [
            "Owned the SharePoint mobile experience and played a key design role on Viva Connections through General Availability. Focus areas: feed experience, content discoverability, and the patterns that let a new product sit cleanly alongside existing Microsoft 365 surfaces.",
          ],
        },
        {
          heading: "Outcome",
          body: [
            "Viva Connections shipped to GA. Featured guest on The Intrazone, Microsoft's SharePoint podcast, on the episode \"Building the Viva Connections Feed Experience.\"",
          ],
        },
      ],
      figures: [],
      externalLink: {
        label: "The Intrazone Podcast",
        href: "https://techcommunity.microsoft.com/t5/intrazone-podcast/bg-p/IntrazonePodcast",
      },
    },
  },
  {
    slug: "samsung",
    date: "2018 — 2020",
    project: "Samsung",
    context: "Galaxy wearables, connected home",
    role: "Senior Designer",
    caseStudy: {
      summary:
        "Galaxy wearables — connected home flows and culturally resonant watch faces for India.",
      atmosphere: "work",
      sections: [
        {
          heading: "Context",
          body: [
            "Samsung's wearable ecosystem needed two things at once: deeper ties into the connected home (via the Tap2Continue framework), and local relevance for the Indian market — where default watch faces weren't culturally resonant.",
          ],
        },
        {
          heading: "Approach",
          body: [
            "Led design explorations for Galaxy smartwatches on connected-home flows and Tap2Continue. Separately, designed culturally resonant watch faces for India, treating personalization as a first-class part of the product, not a post-launch skin.",
          ],
        },
        {
          heading: "Outcome",
          body: [
            "Shipped work across Galaxy wearables. The India-specific watch faces landed as a meaningful personalization channel inside the default Samsung wearable experience.",
          ],
        },
      ],
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
      summary:
        "Freshmarketer onboarding — a first-time experience built for the larger Freshworks suite.",
      atmosphere: "work",
      sections: [
        {
          heading: "Context",
          body: [
            "Freshmarketer needed an onboarding flow that made sense inside the larger Freshworks product ecosystem — a first-time user experience that integrated cleanly with the suite, not a standalone funnel.",
          ],
        },
        {
          heading: "Approach",
          body: [
            "Designed the onboarding experience for Freshmarketer, focused on seamless integration and first-time user engagement across the Freshworks product family.",
          ],
        },
        {
          heading: "Outcome",
          body: [
            "A short stint — the onboarding work shipped into the Freshmarketer product.",
          ],
        },
      ],
      figures: [],
    },
  },
];
