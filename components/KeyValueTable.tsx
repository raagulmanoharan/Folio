import type { ReactNode } from "react";

export type KVRow = {
  key: string;
  value: ReactNode;
  href?: string;
  external?: boolean;
};

export function KeyValueTable({ rows }: { rows: KVRow[] }) {
  return (
    <dl className="w-full" style={{ fontSize: "var(--t-body)" }}>
      {rows.map((row, i) => (
        <div
          key={row.key}
          className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-0 py-[var(--pad-row-y)]"
          style={{
            borderBottom:
              i === rows.length - 1 ? "none" : "1px solid var(--rule)",
          }}
        >
          <dt
            className="text-[var(--muted)] uppercase sm:w-40 sm:shrink-0"
            style={{ fontSize: "var(--t-meta)" }}
          >
            {row.key}
          </dt>
          <dd className="flex-1">
            {row.href ? (
              <a
                href={row.href}
                target={row.external ? "_blank" : undefined}
                rel={row.external ? "noopener noreferrer" : undefined}
              >
                {row.value}
              </a>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
