export type CurrentlyItem = {
  kind: string;
  title: string;
  note?: string;
  href?: string;
};

export const currently: CurrentlyItem[] = [
  {
    kind: "BUILDING",
    title: "Folio — this site",
    note: "Brutalist-console personal site. Case studies, notes, and a running Currently log.",
  },
];
