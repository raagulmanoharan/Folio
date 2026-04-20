export type LiquidVariant =
  | "index"
  | "profile"
  | "currently"
  | "work"
  | "writing"
  | "contact";

const bases: Record<LiquidVariant, string> = {
  index: "var(--bg)",
  profile: "var(--bg)",
  currently: "var(--bg)",
  work: "var(--bg)",
  writing: "var(--bg)",
  contact: "var(--fg)",
};

const gradients: Record<LiquidVariant, string> = {
  index: `
    radial-gradient(ellipse 80% 160% at 50% 130%, var(--fg) 0%, color-mix(in srgb, var(--fg) 30%, transparent) 40%, transparent 72%),
    radial-gradient(ellipse 50% 80% at 30% 40%, color-mix(in srgb, var(--muted) 22%, transparent) 0%, transparent 80%)
  `,
  profile: `
    radial-gradient(ellipse 70% 140% at 20% 60%, color-mix(in srgb, var(--accent) 50%, transparent) 0%, transparent 70%),
    radial-gradient(ellipse 55% 90% at 82% 45%, color-mix(in srgb, var(--accent) 25%, transparent) 0%, transparent 80%)
  `,
  currently: `
    radial-gradient(ellipse 55% 110% at 75% 35%, color-mix(in srgb, var(--muted) 32%, transparent) 0%, transparent 80%),
    radial-gradient(ellipse 45% 80% at 20% 70%, color-mix(in srgb, var(--fg) 18%, transparent) 0%, transparent 75%)
  `,
  work: `
    linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--accent) 55%, transparent) 42%, color-mix(in srgb, var(--fg) 80%, transparent) 78%, var(--fg) 100%)
  `,
  writing: `
    linear-gradient(90deg, var(--fg) 0%, color-mix(in srgb, var(--fg) 55%, transparent) 10%, transparent 24%),
    radial-gradient(ellipse 60% 90% at 70% 50%, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 80%)
  `,
  contact: `
    radial-gradient(ellipse 55% 130% at 50% 50%, color-mix(in srgb, var(--accent) 60%, transparent) 0%, color-mix(in srgb, var(--accent) 20%, transparent) 35%, transparent 70%)
  `,
};

export function LiquidGradient({ variant }: { variant: LiquidVariant }) {
  return (
    <figure
      className="mt-6 mb-8 border border-[var(--rule)] overflow-hidden relative"
      style={{ aspectRatio: "6 / 1", background: bases[variant] }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-[-15%] liquid-drift"
        style={{ background: gradients[variant] }}
      />
    </figure>
  );
}
