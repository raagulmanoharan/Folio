"use client";

import { useEffect, useRef } from "react";

export interface LiquidGradientProps {
  seed?: number;
  speed?: number;
  warp?: number;
  scale?: number;
  grain?: number;
  palette?: { dark: string; cool: string; hot: string; peak: string };
  aspect?: number;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const DEFAULT_PALETTE = {
  dark: "#080a0b",
  cool: "#1c3b46",
  hot: "#e85c2a",
  peak: "#d8341f",
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
uniform float uWarp;
uniform float uScale;
uniform float uGrain;
uniform vec2 uRes;
uniform vec3 uDark;
uniform vec3 uCool;
uniform vec3 uHot;
uniform vec3 uPeak;

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
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

vec3 palette(float t) {
  t = clamp(t, 0.0, 1.0);
  if (t < 0.38) return mix(uDark, uCool, smoothstep(0.0, 0.38, t));
  if (t < 0.55) return mix(uCool, uHot, smoothstep(0.38, 0.55, t));
  if (t < 0.68) return mix(uHot, uPeak, smoothstep(0.55, 0.68, t));
  return mix(uPeak, uDark, smoothstep(0.68, 1.0, t));
}

void main() {
  vec2 asp = vec2(uRes.x / max(uRes.y, 1.0), 1.0);
  vec2 p = (vUv - 0.5) * asp * uScale + vec2(uSeed * 3.1, uSeed * 1.7);

  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + uTime * 0.08),
    fbm(p + vec2(5.2, 1.3) + uTime * 0.06)
  );
  vec2 r = vec2(
    fbm(p + uWarp * q + vec2(1.7, 9.2) + uTime * 0.10),
    fbm(p + uWarp * q + vec2(8.3, 2.8) + uTime * 0.10)
  );
  float v = fbm(p + uWarp * r);

  vec3 col = palette(v);

  float g = hash(gl_FragCoord.xy + uSeed * 13.0) - 0.5;
  col += g * uGrain;

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

export function LiquidGradient({
  seed = 1,
  speed = 0,
  warp = 4,
  scale = 2.5,
  grain = 0.08,
  palette = DEFAULT_PALETTE,
  aspect = 3 / 4,
  className,
  style,
  ariaLabel,
}: LiquidGradientProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    let prog: WebGLProgram | null = null;
    try {
      prog = gl.createProgram();
      if (!prog) return;
      gl.attachShader(prog, compile(gl, VERT, gl.VERTEX_SHADER));
      gl.attachShader(prog, compile(gl, FRAG, gl.FRAGMENT_SHADER));
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
      warp: gl.getUniformLocation(prog, "uWarp"),
      scale: gl.getUniformLocation(prog, "uScale"),
      grain: gl.getUniformLocation(prog, "uGrain"),
      res: gl.getUniformLocation(prog, "uRes"),
      dark: gl.getUniformLocation(prog, "uDark"),
      cool: gl.getUniformLocation(prog, "uCool"),
      hot: gl.getUniformLocation(prog, "uHot"),
      peak: gl.getUniformLocation(prog, "uPeak"),
    };

    gl.uniform1f(u.seed, seed);
    gl.uniform1f(u.warp, warp);
    gl.uniform1f(u.scale, scale);
    gl.uniform1f(u.grain, grain);
    gl.uniform3fv(u.dark, hexToRgb(palette.dark));
    gl.uniform3fv(u.cool, hexToRgb(palette.cool));
    gl.uniform3fv(u.hot, hexToRgb(palette.hot));
    gl.uniform3fv(u.peak, hexToRgb(palette.peak));

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
    warp,
    scale,
    grain,
    palette.dark,
    palette.cool,
    palette.hot,
    palette.peak,
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
