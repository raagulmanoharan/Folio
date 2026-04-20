export function SectionHeader({ title }: { title: string }) {
  return (
    <header className="pt-[var(--pad-section-y)] pb-6 border-t border-[var(--rule)]">
      <h2
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
