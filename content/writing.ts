export type WritingRow = {
  date: string;
  title: string;
  topic: string;
  length: string;
  url: string;
  draft?: boolean;
};

export const writing: WritingRow[] = [];
