export function SectionHeader({
  number,
  slug,
  title,
}: {
  number: string;
  slug: string;
  title: string;
}) {
  return (
    <header className="pt-[var(--pad-section-y)] pb-6 border-t border-[var(--rule)]">
      <div
        className="text-[var(--muted)] uppercase"
        style={{ fontSize: "var(--t-meta)" }}
      >
        // {number} — {slug}
      </div>
      <h2
        className="mt-4"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-h)",
          lineHeight: "var(--lh-display)",
          letterSpacing: "var(--track-tight)",
          fontWeight: 500,
        }}
      >
        {title}
      </h2>
    </header>
  );
}
