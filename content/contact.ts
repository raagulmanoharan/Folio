export type ContactRow = {
  key: string;
  value: string;
  href?: string;
  external?: boolean;
};

export const contact: ContactRow[] = [
  {
    key: "EMAIL",
    value: "[RAAGUL: fill in]",
    href: "mailto:[RAAGUL: fill in]",
  },
  {
    key: "LINKEDIN",
    value: "/in/raagulmanoharan",
    href: "https://www.linkedin.com/in/raagulmanoharan",
    external: true,
  },
  {
    key: "PERSONAL",
    value: "raagulmanoharan.com",
    href: "https://raagulmanoharan.com",
    external: true,
  },
  {
    key: "WRITING",
    value: "/ramblings",
    href: "https://raagulmanoharan.com/ramblings",
    external: true,
  },
];
