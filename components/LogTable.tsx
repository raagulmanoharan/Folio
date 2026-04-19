import type { ReactNode } from "react";

export type LogColumn = {
  key: string;
  label: string;
  className?: string;
};

export type LogRowCells = Record<string, ReactNode>;

export function LogTable({
  columns,
  rows,
  caption,
}: {
  columns: LogColumn[];
  rows: LogRowCells[];
  caption?: string;
}) {
  return (
    <table
      className="w-full text-left"
      style={{ fontSize: "var(--t-body)", tableLayout: "auto" }}
    >
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr className="border-b border-[var(--rule)]">
          {columns.map((col) => (
            <th
              key={col.key}
              scope="col"
              className={`text-left font-normal text-[var(--muted)] uppercase py-[var(--pad-row-y)] pr-4 align-baseline ${
                col.className ?? ""
              }`}
              style={{ fontSize: "var(--t-meta)" }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            className="border-b border-[var(--rule)] last:border-b-0"
          >
            {columns.map((col) => (
              <td
                key={col.key}
                className={`py-[var(--pad-row-y)] pr-4 align-baseline ${
                  col.className ?? ""
                }`}
              >
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
