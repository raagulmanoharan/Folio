import type { WorkRow } from "@/content/work";

export function CaseStudyMeta({ project }: { project: WorkRow }) {
  const cs = project.caseStudy!;
  const rows: { key: string; value: string; href?: string }[] = [
    { key: "PROJECT", value: project.project },
    { key: "DATE", value: project.date },
    { key: "ROLE", value: project.role },
    { key: "CONTEXT", value: project.context },
  ];
  if (cs.externalLink) {
    rows.push({
      key: "LINK",
      value: cs.externalLink.label,
      href: cs.externalLink.href,
    });
  }

  return (
    <dl className="mt-6" style={{ fontSize: "var(--t-body)" }}>
      {rows.map((r) => (
        <div
          key={r.key}
          className="grid gap-x-6 border-b border-[var(--rule)] py-[var(--pad-row-y)]"
          style={{ gridTemplateColumns: "10rem minmax(0, 1fr)" }}
        >
          <dt className="text-[var(--muted)] uppercase" style={{ fontSize: "var(--t-meta)" }}>
            {r.key}
          </dt>
          <dd>
            {r.href ? (
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-[3px]"
              >
                {r.value} ↗
              </a>
            ) : (
              r.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
