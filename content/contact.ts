export type ContactRow = {
  key: string;
  value: string;
  href?: string;
  external?: boolean;
};

export const contact: ContactRow[] = [
  {
    key: "EMAIL",
    value: "raagul@raagul.in",
    href: "mailto:raagul@raagul.in",
  },
  {
    key: "LINKEDIN",
    value: "/in/raagul-r",
    href: "https://www.linkedin.com/in/raagul-r",
    external: true,
  },
  {
    key: "ARE.NA",
    value: "/raagul",
    href: "https://www.are.na/raagul",
    external: true,
  },
  {
    key: "SOUND",
    value: "Tomo — ambient electronic",
    href: "https://tomo.bandcamp.com",
    external: true,
  },
];
