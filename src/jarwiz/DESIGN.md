# Jarwiz interaction studies

## Style prompt

Use the quiet editorial pacing of Daniel Destefanis's Figma Make case study. White page, restrained centered typography, generous breathing room, large neutral rounded stages. Within the stage, derive cards, composer, source chips, comment pins and update receipts from the current Jarwiz source. Compose a close, legible product moment with a clear gesture and consequence. The example is Morrow, a planning app preparing a private beta; it is consistent throughout.

## Colors

- Page: #ffffff; visual stage: #f9f9f9.
- Jarwiz paper: #e8e8e8, used sparingly for canvas texture; card: #fafafa.
- Ink/primary action: #0f0f0f; secondary ink: #5a5a5a.
- Data: source blue #2563eb, objection amber #b88b30, accepted edit green #059669. Color always describes state or data.
- Fine rules: rgba(0,0,0,.10). Source-derived elevation with low-opacity shadows.

## Typography

Outer page uses the existing Neue Montreal family. Product UI follows Jarwiz's current Inter/system-ui stack; preserve one quiet sans voice. UI excerpts are shortened and enlarged for presentation: body20–22px, artifact headings26–32px, key numbers52–72px in a960px stage. Mobile compositions reflow into a640px logical stage, preserving prominent single-card emphasis.

## Motion

One meaningful action per shot. Pause to read the premise; animate a user gesture; follow the relevant relationship with the camera; hold the result. Entrances220–600ms, camera850–1200ms, stagger80–120ms, changed-content highlight1.8s. Use transform/opacity. Small UI responses ease out; camera movement eases in/out. Only the visible composition runs. Explicit replay, pause, direct controls, and reduced-motion final states are required. No live service or random timing.

## What not to do

- No screenshots of demo chrome, license badges, generic timers, or disconnected examples.
- No tiny whole-screen recordings. A caption must not rescue an unintelligible visual.
- No speculative claims about real research or Jarwiz usage metrics.
- No decorative agent cursors pretending to perform work; an ordinary user pointer may demonstrate an actual UI action.
- No new color palette per scene, excessive bounce, ambient camera drift, or many focal actions at once.

## Source and adaptation

Source: raagulmanoharan/Jarwiz-V3 at45267457adaa78bc62ec60c9db7a5bc3ac57e099. Presentation components adapt the product's real markup and semantics without backend/demo state. The owner clarified that adaptations must preserve Jarwiz’s recognizable UI and behavior. Only sample content, camera framing, motion, and small fit-and-finish adjustments are allowed; no new product workflows or redesigned controls. Source mappings are documented with the component module and storyboard.
