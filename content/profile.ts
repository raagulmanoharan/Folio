export type AvailabilityState = "available" | "booked" | "hidden";

export const identity = {
  name: "RAAGUL.R",
  role: "LEAD DESIGNER, SALESFORCE",
  location: "BLR → HYD",
};

export const availability: {
  state: AvailabilityState;
  label: string;
} = {
  state: "available",
  label: "AVAILABLE: Q3 2026",
};

export const hero = {
  line: "I design the behavioral primitives behind AI agents at Salesforce.",
  dek: "Nine years in. Currently: interaction grammar for agents that act on behalf of people. Before: design systems, tooling, B2B surfaces.",
};

export const dossier: { key: string; value: string }[] = [
  { key: "ROLE", value: "Lead Designer" },
  { key: "ORG", value: "Salesforce — Experience Org" },
  {
    key: "FOCUS",
    value: "AI agent interactions, behavioral primitives, design systems",
  },
  { key: "EDUCATION", value: "IDC, IIT Bombay — Interaction Design, 2018" },
  { key: "LOCATION", value: "Bangalore → Hyderabad (2026)" },
  { key: "PRIOR", value: "Salesforce (2020 — present), earlier IC roles" },
  { key: "WRITING", value: "See 04" },
  { key: "SOUND", value: "Tomo — ambient electronic" },
  { key: "CONTACT", value: "See 05" },
];

export const bio =
  "I work on the defaults, recovery paths, and interruption patterns for Salesforce's agent surfaces. Before that: design systems, developer tooling, and a few years on consumer surfaces that no longer exist. Outside of work I build small things — a budgeting bot, a studio canvas, a book — and release ambient music as Tomo.";
