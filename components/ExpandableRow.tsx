import Image from "next/image";
import type { WorkRow } from "@/content/work";

const gridClass =
  "grid gap-x-6 px-0 py-[var(--pad-row-y)] items-baseline";

const gridStyle = {
  gridTemplateColumns:
    "5rem minmax(0, 1.2fr) minmax(0, 1.4fr) minmax(0, 1fr)",
};

export function ExpandableRow({ row }: { row: WorkRow }) {
  const cs = row.caseStudy;
  const hasCase = cs !== null;

  const summary = (
    <div className={gridClass} style={gridStyle}>
      <span>{row.date}</span>
      <span>{row.project}</span>
      <span className="text-[var(--muted)]">{row.context}</span>
      <span>{row.role}</span>
    </div>
  );

  if (!hasCase) {
    return (
      <div className="border-b border-[var(--rule)]" role="row">
        {summary}
      </div>
    );
  }

  return (
    <details
      id={`work-${row.slug}`}
      className="border-b border-[var(--rule)] group"
    >
      <summary
        className="cursor-pointer list-none hover:text-[var(--accent)]"
        aria-label={`Expand ${row.project}`}
      >
        {summary}
      </summary>
      <div className="pb-8 pt-2 pl-0 sm:pl-[5rem] max-w-[68ch]">
        <dl className="space-y-4" style={{ fontSize: "var(--t-body)" }}>
          <div>
            <dt
              className="text-[var(--muted)] uppercase"
              style={{ fontSize: "var(--t-meta)" }}
            >
              PROBLEM
            </dt>
            <dd className="mt-1">{cs.problem}</dd>
          </div>
          <div>
            <dt
              className="text-[var(--muted)] uppercase"
              style={{ fontSize: "var(--t-meta)" }}
            >
              APPROACH
            </dt>
            <dd className="mt-1">{cs.approach}</dd>
          </div>
          <div>
            <dt
              className="text-[var(--muted)] uppercase"
              style={{ fontSize: "var(--t-meta)" }}
            >
              OUTCOME
            </dt>
            <dd className="mt-1">{cs.outcome}</dd>
          </div>
        </dl>
        {cs.figures.filter((f) => !f.src.includes("placeholder")).length > 0 && (
          <div className="mt-6 space-y-6">
            {cs.figures
              .filter((f) => !f.src.includes("placeholder"))
              .map((fig) => (
                <figure key={fig.src}>
                  <div className="border border-[var(--rule)]">
                    <Image
                      src={fig.src}
                      alt={fig.alt}
                      width={fig.width}
                      height={fig.height}
                      sizes="(max-width: 720px) 100vw, 720px"
                      className="block w-full h-auto"
                    />
                  </div>
                  <figcaption
                    className="mt-2 text-[var(--muted)] uppercase"
                    style={{ fontSize: "var(--t-meta)" }}
                  >
                    {fig.caption}
                  </figcaption>
                </figure>
              ))}
          </div>
        )}
        {row.link && (
          <p className="mt-6">
            <a
              href={row.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] underline underline-offset-[3px]"
            >
              Visit {row.project} →
            </a>
          </p>
        )}
      </div>
    </details>
  );
}
