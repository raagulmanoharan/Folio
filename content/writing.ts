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
    date: "2026",
    title: "Behavioral primitives for agents",
    topic: "Design / AI",
    length: "12 min",
    url: "#",
    draft: true,
  },
  {
    date: "2026",
    title: "The default question is the design",
    topic: "Design / AI",
    length: "6 min",
    url: "#",
    draft: true,
  },
  {
    date: "2025",
    title: "What design systems borrow from linguistics",
    topic: "Systems",
    length: "9 min",
    url: "#",
    draft: true,
  },
  {
    date: "2025",
    title: "Against speculative design as ornament",
    topic: "Critique",
    length: "7 min",
    url: "#",
    draft: true,
  },
  {
    date: "2024",
    title: "Notes from editing a book on process",
    topic: "Process",
    length: "5 min",
    url: "#",
    draft: true,
  },
];
