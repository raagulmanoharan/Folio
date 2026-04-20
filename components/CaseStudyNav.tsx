import Link from "next/link";
import type { WorkRow } from "@/content/work";

export function CaseStudyNav({
  prev,
  next,
}: {
  prev: WorkRow | null;
  next: WorkRow | null;
}) {
  return (
    <nav
      className="mt-16 grid gap-x-6 border-t border-[var(--rule)] pt-6"
      style={{ gridTemplateColumns: "1fr 1fr", fontSize: "var(--t-body)" }}
      aria-label="Case study navigation"
    >
      <div>
        {prev && (
          <Link href={`/work/${prev.slug}`} className="block">
            <span
              className="block text-[var(--muted)] uppercase"
              style={{ fontSize: "var(--t-meta)" }}
            >
              ← PREVIOUS
            </span>
            <span className="mt-1 block">{prev.project}</span>
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link href={`/work/${next.slug}`} className="block">
            <span
              className="block text-[var(--muted)] uppercase"
              style={{ fontSize: "var(--t-meta)" }}
            >
              NEXT →
            </span>
            <span className="mt-1 block">{next.project}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
