"use client";

import { useEffect, useRef } from "react";

export type BlobPreset = "flare" | "arc" | "halo" | "sweep" | "crescent" | "twin";

type Stop = [number, "bg" | "glow" | "core" | "deep"];
type Blob = { cx: number; cy: number; r: number; stops: Stop[] };

export interface GradientBlobProps {
  preset?: BlobPreset;
  seed?: number;
  palette?: { bg: string; deep: string; glow: string; core: string };
  grain?: number;
  grainScale?: number;
  className?: string;
  style?: React.CSSProperties;
  aspect?: number;
  ariaLabel?: string;
}

const DEFAULT_PALETTE = {
  bg: "#0b0a09",
  deep: "#1a0f0a",
  glow: "#ff5a1f",
  core: "#ffd2a3",
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBlobs(preset: BlobPreset, rand: () => number): Blob[] {
  const j = (n: number) => (rand() - 0.5) * n;
  switch (preset) {
    case "flare":
      return [
        { cx: 0.18 + j(0.04), cy: 0.22 + j(0.04), r: 0.95, stops: [[0, "core"], [0.08, "glow"], [0.45, "deep"], [0.85, "bg"]] },
        { cx: 0.38 + j(0.06), cy: 0.62 + j(0.06), r: 0.55, stops: [[0, "glow"], [0.35, "deep"], [0.7, "bg"]] },
        { cx: 0.7, cy: 0.1, r: 0.4, stops: [[0, "glow"], [0.45, "bg"]] },
      ];
    case "arc":
      return [
        { cx: 1.02, cy: 0.32 + j(0.05), r: 0.9, stops: [[0, "core"], [0.15, "glow"], [0.45, "deep"], [0.8, "bg"]] },
        { cx: 1.15, cy: 0.45, r: 0.55, stops: [[0, "glow"], [0.4, "bg"]] },
      ];
    case "halo":
      return [
        { cx: 0.5, cy: 0.55, r: 0.18, stops: [[0, "core"], [0.4, "glow"], [0.9, "deep"]] },
        { cx: 0.5, cy: 0.55, r: 0.65, stops: [[0.35, "bg"], [0.5, "glow"], [0.62, "deep"], [0.8, "bg"]] },
      ];
    case "sweep":
      return [
        { cx: 1.12, cy: 0.18, r: 0.75, stops: [[0, "glow"], [0.35, "deep"], [0.7, "bg"]] },
        { cx: -0.12, cy: 0.78, r: 0.75, stops: [[0, "glow"], [0.35, "deep"], [0.7, "bg"]] },
        { cx: 0.5, cy: 0.5, r: 0.22, stops: [[0, "core"], [0.55, "bg"]] },
      ];
    case "crescent":
      return [
        { cx: 0.5, cy: 0.95, r: 1.2, stops: [[0.55, "bg"], [0.62, "glow"], [0.68, "core"], [0.74, "glow"], [0.82, "bg"]] },
        { cx: 0.5, cy: 0.2, r: 0.5, stops: [[0, "bg"], [1, "bg"]] },
      ];
    case "twin":
      return [
        { cx: 0.28, cy: 0.38 + j(0.05), r: 0.45, stops: [[0, "core"], [0.2, "glow"], [0.55, "bg"]] },
        { cx: 0.74, cy: 0.64 + j(0.05), r: 0.5, stops: [[0, "glow"], [0.45, "bg"]] },
      ];
  }
}

function paint(
  canvas: HTMLCanvasElement,
  preset: BlobPreset,
  seed: number,
  palette: typeof DEFAULT_PALETTE,
  grain: number,
  grainScale: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, w, h);

  const rand = mulberry32(seed);
  const blobs = buildBlobs(preset, rand);
  const diag = Math.hypot(w, h);

  ctx.globalCompositeOperation = "lighter";
  for (const b of blobs) {
    const cx = b.cx * w;
    const cy = b.cy * h;
    const r = b.r * diag * 0.6;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    for (const [offset, key] of b.stops) {
      grad.addColorStop(Math.max(0, Math.min(1, offset)), palette[key]);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = "source-over";

  if (grain > 0) {
    const nw = Math.max(2, Math.floor(w / grainScale));
    const nh = Math.max(2, Math.floor(h / grainScale));
    const noise = document.createElement("canvas");
    noise.width = nw;
    noise.height = nh;
    const nctx = noise.getContext("2d")!;
    const img = nctx.createImageData(nw, nh);
    const grand = mulberry32(seed ^ 0x9e3779b9);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(grand() * 256);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    nctx.putImageData(img, 0, 0);

    ctx.globalAlpha = grain;
    ctx.globalCompositeOperation = "overlay";
    (ctx as CanvasRenderingContext2D & { imageSmoothingEnabled: boolean }).imageSmoothingEnabled = false;
    ctx.drawImage(noise, 0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}

export function GradientBlob({
  preset = "flare",
  seed = 1,
  palette = DEFAULT_PALETTE,
  grain = 0.14,
  grainScale = 1.5,
  className,
  style,
  aspect = 3 / 4,
  ariaLabel,
}: GradientBlobProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    const render = () => paint(canvas, preset, seed, palette, grain, grainScale);
    render();
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    });
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [preset, seed, palette, grain, grainScale]);

  return (
    <canvas
      ref={ref}
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
      className={className}
      style={{
        display: "block",
        width: "100%",
        aspectRatio: aspect,
        ...style,
      }}
    />
  );
}
