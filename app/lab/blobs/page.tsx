import { GradientBlob, type BlobPreset } from "@/components/GradientBlob";
import { LiquidGradient } from "@/components/LiquidGradient";
import { HalftoneGradient } from "@/components/HalftoneGradient";

const COOL_PALETTE = {
  dark: "#05070b",
  cool: "#1a6baa",
  hot: "#e6382e",
  peak: "#c41d1d",
};

const HALFTONE_SUNSET = {
  c1: "#f5a34a",
  c2: "#e85a2a",
  c3: "#6c3ad1",
  c4: "#0f0f2a",
  c5: "#f4e4c8",
};

const HALFTONE_RISO = {
  c1: "#f9c74f",
  c2: "#f3722c",
  c3: "#577590",
  c4: "#1a1a2e",
  c5: "#ffe0b5",
};

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

      <div
        className="text-[var(--muted)] uppercase mt-16 mb-4"
        style={{ fontSize: "var(--t-meta)" }}
      >
        // LIQUID — WEBGL DOMAIN-WARPED FBM
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { seed: 1.4, scale: 2.4, warp: 4.0, label: "liquid / 01" },
          { seed: 2.7, scale: 2.8, warp: 4.5, label: "liquid / 02" },
          { seed: 4.1, scale: 2.0, warp: 5.0, label: "liquid / 03" },
          { seed: 5.9, scale: 3.2, warp: 3.5, label: "liquid / 04" },
          { seed: 7.3, scale: 2.2, warp: 4.2, label: "liquid / 05" },
          { seed: 9.8, scale: 2.6, warp: 4.8, label: "liquid / 06" },
          { seed: 12.5, scale: 3.0, warp: 3.8, label: "liquid / 07" },
          { seed: 14.2, scale: 2.5, warp: 5.2, label: "liquid / 08" },
        ].map((l) => (
          <figure key={l.label} className="space-y-2">
            <LiquidGradient
              seed={l.seed}
              scale={l.scale}
              warp={l.warp}
              aspect={3 / 4}
              ariaLabel={l.label}
            />
            <figcaption
              className="text-[var(--muted)] uppercase"
              style={{ fontSize: "var(--t-meta)" }}
            >
              {l.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <div
        className="text-[var(--muted)] uppercase mt-16 mb-4"
        style={{ fontSize: "var(--t-meta)" }}
      >
        // LIQUID — COOL PALETTE, HEAVY GRAIN
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { seed: 1.1, scale: 2.6, warp: 4.2, label: "cool / 01" },
          { seed: 3.3, scale: 2.2, warp: 5.0, label: "cool / 02" },
          { seed: 6.6, scale: 3.0, warp: 3.8, label: "cool / 03" },
          { seed: 8.8, scale: 2.4, warp: 4.6, label: "cool / 04" },
        ].map((l) => (
          <figure key={l.label} className="space-y-2">
            <LiquidGradient
              seed={l.seed}
              scale={l.scale}
              warp={l.warp}
              grain={0.22}
              palette={COOL_PALETTE}
              aspect={3 / 4}
              ariaLabel={l.label}
            />
            <figcaption
              className="text-[var(--muted)] uppercase"
              style={{ fontSize: "var(--t-meta)" }}
            >
              {l.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <div
        className="text-[var(--muted)] uppercase mt-16 mb-4"
        style={{ fontSize: "var(--t-meta)" }}
      >
        // HALFTONE — RISO PRINT SCREEN
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { seed: 1.2, grid: 32, scale: 1.8, warp: 3.0, palette: HALFTONE_SUNSET, label: "halftone / 01" },
          { seed: 3.4, grid: 40, scale: 2.2, warp: 3.5, palette: HALFTONE_SUNSET, label: "halftone / 02" },
          { seed: 5.6, grid: 28, scale: 1.6, warp: 4.0, palette: HALFTONE_RISO, label: "halftone / 03" },
          { seed: 7.8, grid: 44, scale: 2.4, warp: 3.2, palette: HALFTONE_RISO, label: "halftone / 04" },
          { seed: 10.1, grid: 36, scale: 2.0, warp: 3.8, palette: HALFTONE_SUNSET, label: "halftone / 05" },
          { seed: 12.3, grid: 30, scale: 1.7, warp: 3.3, palette: HALFTONE_RISO, label: "halftone / 06" },
        ].map((h) => (
          <figure key={h.label} className="space-y-2">
            <HalftoneGradient
              seed={h.seed}
              grid={h.grid}
              scale={h.scale}
              warp={h.warp}
              palette={h.palette}
              aspect={3 / 4}
              ariaLabel={h.label}
            />
            <figcaption
              className="text-[var(--muted)] uppercase"
              style={{ fontSize: "var(--t-meta)" }}
            >
              {h.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
