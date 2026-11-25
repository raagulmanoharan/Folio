> Superseded by `scripts/jarwiz-v6` after user review. This invented interface is not the approved direction. Preserve Jarwiz’s actual UI and product flow in future demos.

# Jarwiz onboarding film

This is the first vignette only. It uses newly designed HTML/SVG screens, with Jarwiz's onboarding and canvas behavior as the product reference. The existing case study and its other films remain unchanged.

The 22-second story moves through choosing Product thinking, describing an onboarding problem, receiving three visual directions, and preparing a follow-up from the first idea.

## Preview and render

- `npm run dev` starts the HyperFrames Studio preview.
- `npm run check` runs lint, runtime, layout, motion, and contrast checks.
- `npm run snapshot -- --at 2.95,6.5,13.8,19.5` captures keyframes.
- `npm run render` writes the 1920 × 1280, 30 fps film to `../../public/work/jarwiz-review/onboarding.mp4`.

CLI caches and fonts use writable paths in `/tmp`; the wrapper pins HyperFrames 0.9.59 and the system Chromium browser. The review page is `../../public/work/jarwiz-review/index.html`.

## Review evidence

The final composition passes lint, runtime, motion, and all 111 contrast checks. The brief heading overlap during a scene crossfade is intentional. Silent playback, the opening fade, and held results are deliberate choices for an inline product film.

Encoded keyframes and a complete FFmpeg decode pass. Desktop and mobile review-page checks verify chapter seeking, play/pause, replay, overflow, and reduced-motion behavior; desktop fullscreen also passes.

When seeking through Playwright, do not return the GSAP timeline from `evaluate`: use `() => { window.__timelines.onboarding.seek(13.8); }`. GSAP timelines are thenable, so returning a paused timeline causes the call to wait indefinitely.
