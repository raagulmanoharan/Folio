export type AvailabilityState = "available" | "booked" | "hidden";

export const identity = {
  name: "RAAGUL MANOHARAN",
  role: "LEAD UX DESIGNER, SALESFORCE",
  location: "BENGALURU, IN",
};

export const availability: {
  state: AvailabilityState;
  label: string;
} = {
  state: "hidden",
  label: "",
};

export const hero = {
  line: "I design how people think, create, and interact with intelligent systems.",
  dek: "User Experience Designer in Bengaluru. Eight years across 0→1 launches and enterprise systems. Currently at Salesforce, exploring new modalities for Generative UI.",
};

export const dossier: { key: string; value: string }[] = [
  { key: "ROLE", value: "Lead UX Designer" },
  { key: "ORG", value: "Salesforce" },
  {
    key: "FOCUS",
    value: "Generative UI, AI agent interactions, enterprise 0→1",
  },
  { key: "LOCATION", value: "Bengaluru, India" },
  { key: "EXPERIENCE", value: "8 years — Salesforce, Microsoft, Samsung, Freshworks" },
  { key: "RECOGNITION", value: "Singapore Good Design Award (SG Mark), 2024" },
  { key: "SPEAKING", value: "Friends of Figma Chennai, 2025" },
  { key: "ASIDE", value: "Synth & VST interfaces. A breakfast club." },
];

export const bio =
  "I help teams build products — from 0-to-1 launches to complex enterprise systems. My current focus is on exploring new modalities for Generative UI: designing how people think, create, and interact with intelligent systems. Outside of work, I build interfaces for synthesizers and VSTs, and I run a breakfast club.";
