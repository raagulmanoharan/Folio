export type WritingRow = {
  date: string;
  title: string;
  topic: string;
  length: string;
  url: string;
  draft?: boolean;
};

export const writing: WritingRow[] = [
  {
    date: "2025-12",
    title: "The Living Article: a document that fights back",
    topic: "AI / interaction",
    length: "9 min",
    url: "https://raagulmanoharan.com/ramblings/living-article",
  },
  {
    date: "2025-12",
    title: "The transparency trap",
    topic: "AI / trust",
    length: "7 min",
    url: "https://raagulmanoharan.com/ramblings/the-transparency-trap-why-we-trust-engines-we-don%E2%80%99t-understand-and-ai-we-can%E2%80%99t-explain",
  },
];
