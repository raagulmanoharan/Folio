"use client";

import { useEffect, useRef } from "react";

export interface HalftoneGradientProps {
  seed?: number;
  speed?: number;
  grid?: number;
  scale?: number;
  warp?: number;
  grain?: number;
  palette?: {
    c1: string;
    c2: string;
    c3: string;
    c4: string;
    c5: string;
  };
  aspect?: number;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const DEFAULT_PALETTE = {
  c1: "#f5a34a",
  c2: "#e85a2a",
  c3: "#6c3ad1",
  c4: "#0f0f2a",
  c5: "#f4e4c8",
};

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uSeed;
uniform float uGrid;
uniform float uScale;
uniform float uWarp;
uniform float uGrain;
uniform vec2 uRes;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uC4;
uniform vec3 uC5;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

float field(vec2 p) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + uTime * 0.06),
    fbm(p + vec2(3.1, 7.4) + uTime * 0.05)
  );
  return fbm(p + uWarp * q);
}

vec3 palette(float t) {
  t = clamp(t, 0.0, 1.0);
  if (t < 0.22) return uC1;
  if (t < 0.40) return mix(uC1, uC2, smoothstep(0.22, 0.40, t));
  if (t < 0.55) return mix(uC2, uC3, smoothstep(0.40, 0.55, t));
  if (t < 0.72) return uC3;
  if (t < 0.88) return mix(uC3, uC4, smoothstep(0.72, 0.88, t));
  return mix(uC4, uC5, smoothstep(0.88, 1.0, t));
}

void main() {
  vec2 asp = vec2(uRes.x / max(uRes.y, 1.0), 1.0);
  vec2 uv = vUv;

  vec2 cellsXY = vec2(uGrid * asp.x, uGrid);
  vec2 cell = floor(uv * cellsXY);
  vec2 cellUv = (cell + 0.5) / cellsXY;
  vec2 inCell = fract(uv * cellsXY) - 0.5;

  vec2 p = (cellUv - 0.5) * asp * uScale + vec2(uSeed * 2.3, uSeed * 1.1);
  float v = field(p);

  vec3 fg = palette(v);
  vec3 bg = palette(clamp(v - 0.18, 0.0, 1.0));

  float sz = mix(0.12, 0.48, v);
  float d = max(abs(inCell.x), abs(inCell.y));
  float edge = fwidth(d);
  float mask = 1.0 - smoothstep(sz - edge, sz + edge, d);

  vec3 col = mix(bg, fg, mask);

  float g1 = hash(gl_FragCoord.xy + uSeed * 11.0) - 0.5;
  float g2 = hash(gl_FragCoord.xy * 0.5 + uSeed * 29.0) - 0.5;
  col += (g1 * 0.7 + g2 * 0.3) * uGrain;

  gl_FragColor = vec4(col, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, src: string, type: number) {
  const s = gl.createShader(type);
  if (!s) throw new Error("createShader failed");
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(log || "shader compile failed");
  }
  return s;
}

export function HalftoneGradient({
  seed = 1,
  speed = 0,
  grid = 34,
  scale = 2.0,
  warp = 3.5,
  grain = 0.16,
  palette = DEFAULT_PALETTE,
  aspect = 3 / 4,
  className,
  style,
  ariaLabel,
}: HalftoneGradientProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;
    gl.getExtension("OES_standard_derivatives");

    let prog: WebGLProgram | null = null;
    try {
      prog = gl.createProgram();
      if (!prog) return;
      const vs = compile(gl, VERT, gl.VERTEX_SHADER);
      const fs = compile(
        gl,
        "#extension GL_OES_standard_derivatives : enable\n" + FRAG,
        gl.FRAGMENT_SHADER,
      );
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
        return;
      }
    } catch (e) {
      console.error(e);
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      time: gl.getUniformLocation(prog, "uTime"),
      seed: gl.getUniformLocation(prog, "uSeed"),
      grid: gl.getUniformLocation(prog, "uGrid"),
      scale: gl.getUniformLocation(prog, "uScale"),
      warp: gl.getUniformLocation(prog, "uWarp"),
      grain: gl.getUniformLocation(prog, "uGrain"),
      res: gl.getUniformLocation(prog, "uRes"),
      c1: gl.getUniformLocation(prog, "uC1"),
      c2: gl.getUniformLocation(prog, "uC2"),
      c3: gl.getUniformLocation(prog, "uC3"),
      c4: gl.getUniformLocation(prog, "uC4"),
      c5: gl.getUniformLocation(prog, "uC5"),
    };

    gl.uniform1f(u.seed, seed);
    gl.uniform1f(u.grid, grid);
    gl.uniform1f(u.scale, scale);
    gl.uniform1f(u.warp, warp);
    gl.uniform1f(u.grain, grain);
    gl.uniform3fv(u.c1, hexToRgb(palette.c1));
    gl.uniform3fv(u.c2, hexToRgb(palette.c2));
    gl.uniform3fv(u.c3, hexToRgb(palette.c3));
    gl.uniform3fv(u.c4, hexToRgb(palette.c4));
    gl.uniform3fv(u.c5, hexToRgb(palette.c5));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(u.res, w, h);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (speed === 0) {
        gl.uniform1f(u.time, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    });
    ro.observe(canvas);
    resize();

    let raf = 0;
    const start = performance.now();
    const render = () => {
      const t = speed > 0 ? ((performance.now() - start) / 1000) * speed : 0;
      gl.uniform1f(u.time, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (speed > 0) raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      gl.deleteBuffer(buf);
      if (prog) gl.deleteProgram(prog);
    };
  }, [
    seed,
    speed,
    grid,
    scale,
    warp,
    grain,
    palette.c1,
    palette.c2,
    palette.c3,
    palette.c4,
    palette.c5,
  ]);

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
