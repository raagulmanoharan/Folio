import { GradientBlob, type BlobPreset } from "@/components/GradientBlob";

const PRESETS: { preset: BlobPreset; seed: number; label: string; aspect: number }[] = [
  { preset: "flare", seed: 3, label: "flare / 03", aspect: 3 / 4 },
  { preset: "arc", seed: 7, label: "arc / 07", aspect: 3 / 4 },
  { preset: "halo", seed: 11, label: "halo / 11", aspect: 3 / 4 },
  { preset: "sweep", seed: 17, label: "sweep / 17", aspect: 3 / 4 },
  { preset: "crescent", seed: 23, label: "crescent / 23", aspect: 3 / 4 },
  { preset: "twin", seed: 29, label: "twin / 29", aspect: 3 / 4 },
  { preset: "flare", seed: 101, label: "flare / 101", aspect: 3 / 4 },
  { preset: "arc", seed: 202, label: "arc / 202", aspect: 3 / 4 },
];

export default function BlobsPage() {
  return (
    <main
      className="mx-auto px-[var(--gutter)] pt-12 pb-24"
      style={{ maxWidth: "var(--max-w)" }}
    >
      <div
        className="text-[var(--muted)] uppercase mb-2"
        style={{ fontSize: "var(--t-meta)" }}
      >
        // LAB — GRADIENT BLOBS
      </div>
      <h1
        className="mb-10"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-h)",
          lineHeight: "var(--lh-display)",
          letterSpacing: "var(--track-tight)",
          fontWeight: 500,
        }}
      >
        Procedural gradient studies
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {PRESETS.map((p) => (
          <figure key={`${p.preset}-${p.seed}`} className="space-y-2">
            <GradientBlob
              preset={p.preset}
              seed={p.seed}
              aspect={p.aspect}
              ariaLabel={`${p.preset} gradient, seed ${p.seed}`}
            />
            <figcaption
              className="text-[var(--muted)] uppercase"
              style={{ fontSize: "var(--t-meta)" }}
            >
              {p.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
