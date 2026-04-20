import type { NoteSection } from "@/content/writing";

export function NoteBody({ sections }: { sections: NoteSection[] }) {
  return (
    <div
      className="mt-10 max-w-[68ch] space-y-10"
      style={{ fontSize: "var(--t-body)", lineHeight: 1.6 }}
    >
      {sections.map((section, i) => (
        <section key={section.heading ?? i}>
          {section.heading && (
            <h3
              className="text-[var(--muted)] uppercase mb-3"
              style={{ fontSize: "var(--t-meta)" }}
            >
              {section.heading}
            </h3>
          )}
          <div className="space-y-4">
            {section.body.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
