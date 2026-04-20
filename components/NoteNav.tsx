import Link from "next/link";
import type { WritingRow } from "@/content/writing";

export function NoteNav({
  prev,
  next,
}: {
  prev: WritingRow | null;
  next: WritingRow | null;
}) {
  const href = (row: WritingRow) =>
    row.slug && row.note ? `/writing/${row.slug}` : row.externalUrl ?? "#";
  const external = (row: WritingRow) => !row.slug || !row.note;

  return (
    <nav
      className="mt-16 grid gap-x-6 border-t border-[var(--rule)] pt-6"
      style={{ gridTemplateColumns: "1fr 1fr", fontSize: "var(--t-body)" }}
      aria-label="Writing navigation"
    >
      <div>
        {prev && (
          <Link
            href={href(prev)}
            {...(external(prev)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="block"
          >
            <span
              className="block text-[var(--muted)] uppercase"
              style={{ fontSize: "var(--t-meta)" }}
            >
              ← PREVIOUS
            </span>
            <span className="mt-1 block">{prev.title}</span>
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link
            href={href(next)}
            {...(external(next)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="block"
          >
            <span
              className="block text-[var(--muted)] uppercase"
              style={{ fontSize: "var(--t-meta)" }}
            >
              NEXT →
            </span>
            <span className="mt-1 block">{next.title}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
