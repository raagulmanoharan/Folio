import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg'

// A chrome die tumbling inside a single chrome ring, with a Y2K bloom glow.
// Reflects a studio environment by default; if the visitor grants camera
// access on load, a bright dome + the live feed become the environment, so
// the die reflects a lit room with the visitor's face in it.
export function initMotif(canvas) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.52
  renderer.outputColorSpace = THREE.SRGBColorSpace

  // Fully transparent canvas: the page ground shows through, and the bloom
  // glow spills softly onto the page instead of being clipped inside a box.
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0, 12.0)

  // Studio environment for the camera-denied fallback: a dark room with a few
  // bright soft light panels, so the chrome reads like a lit chrome object
  // (dark body with bright highlight streaks) rather than a flat bright blob.
  const pmrem = new THREE.PMREMGenerator(renderer)
  function buildStudioEnv() {
    const s = new THREE.Scene()
    s.background = new THREE.Color(0x05050a)
    // dark surrounding shell → chrome's body reflects near-black
    s.add(new THREE.Mesh(
      new THREE.BoxGeometry(40, 40, 40),
      new THREE.MeshBasicMaterial({ color: 0x0b0b12, side: THREE.BackSide }),
    ))
    const panel = (w, h, pos, level) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(level, level, level), // >1 = HDR highlight
          side: THREE.DoubleSide,
        }),
      )
      m.position.set(pos[0], pos[1], pos[2])
      m.lookAt(0, 0, 0)
      s.add(m)
    }
    panel(16, 10, [0, 8, 11], 5.0) // key light, upper front
    panel(7, 15, [-12, 3, 3], 3.2) // rim, left
    panel(7, 15, [12, 1, 4], 2.2) // rim, right
    panel(12, 6, [0, -9, 7], 0.6) // soft low fill
    panel(10, 10, [0, 3, -12], 1.6) // back kicker
    const tex = pmrem.fromScene(s, 0.03).texture
    s.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.() })
    return tex
  }
  scene.environment = buildStudioEnv()

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.06,
    envMapIntensity: 0.75,
  })

  // ---- Die (chrome, with pip depressions carved via CSG) ----
  const DIE = 1.7
  const o = 0.36
  const H = DIE / 2
  const LAYOUTS = {
    1: [[0, 0]],
    2: [[-o, o], [o, -o]],
    3: [[-o, o], [0, 0], [o, -o]],
    4: [[-o, o], [o, o], [-o, -o], [o, -o]],
    5: [[-o, o], [o, o], [0, 0], [-o, -o], [o, -o]],
    6: [[-o, o], [-o, 0], [-o, -o], [o, o], [o, 0], [o, -o]],
  }
  const FACES = [
    ['z', 1, 1], ['z', -1, 6],
    ['x', 1, 2], ['x', -1, 5],
    ['y', 1, 3], ['y', -1, 4],
  ]
  // Pips are the same chrome as the body — just geometry. A cylinder cutter
  // (not a sphere) makes flat-bottomed circular punches, so each pip reads as a
  // clean flat dent rather than a spherical bowl that catches a busy reflection.
  const evaluator = new Evaluator()
  evaluator.useGroups = false
  let dieBrush = new Brush(new RoundedBoxGeometry(DIE, DIE, DIE, 6, 0.18))
  dieBrush.material = chrome
  dieBrush.updateMatrixWorld()
  const PIP_R = 0.12 // dent radius
  const DEP = 0.1 // dent depth (deeper)
  const OVER = 0.12 // cutter overshoot beyond the face for a clean cut
  const HC = DEP + OVER
  const CH = 0.02 // very subtle chamfer on the bottom + rim edges
  // Lathed cutter: flat bottom, a small chamfer at the bottom edge, and a small
  // chamfer where the wall meets the face (the rim). Revolved around local +Y.
  const prof = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(PIP_R - CH, 0),
    new THREE.Vector2(PIP_R, CH),
    new THREE.Vector2(PIP_R, DEP - CH),
    new THREE.Vector2(PIP_R + CH, DEP + CH),
    new THREE.Vector2(PIP_R + CH, HC),
    new THREE.Vector2(0, HC),
  ]
  const holeGeo = new THREE.LatheGeometry(prof, 44)
  const up = new THREE.Vector3(0, 1, 0)
  for (const [axis, sign, count] of FACES) {
    const n = new THREE.Vector3(
      axis === 'x' ? sign : 0,
      axis === 'y' ? sign : 0,
      axis === 'z' ? sign : 0,
    )
    const q = new THREE.Quaternion().setFromUnitVectors(up, n)
    for (const [u, v] of LAYOUTS[count]) {
      const hole = new Brush(holeGeo)
      hole.quaternion.copy(q)
      const p = new THREE.Vector3()
      if (axis === 'z') p.set(u, v, sign * H)
      else if (axis === 'x') p.set(sign * H, u, v)
      else p.set(u, sign * H, v)
      p.addScaledVector(n, -DEP) // cutter bottom sits DEP below the face
      hole.position.copy(p)
      hole.updateMatrixWorld()
      dieBrush = evaluator.evaluate(dieBrush, hole, SUBTRACTION)
    }
  }
  dieBrush.material = chrome
  dieBrush.geometry.computeVertexNormals()
  const die = new THREE.Group()
  die.add(dieBrush)

  // ---- Ring: a single chrome ring around the die, tumbling in all directions ----
  // Bigger than the die so it sweeps up into the hero text as it turns.
  const ringGeo = new THREE.TorusGeometry(2.28, 0.08, 24, 240)

  // A small bundle of identical rings that share the ring's pose. They're
  // pinched at two opposite points on a diameter (the local X axis) and fan
  // open around it — like fanning a deck of cards held at one edge. A gentle
  // pulse opens the fan into a few clearly-separated rings then closes it back
  // to one (a tiny depth offset keeps them from z-fighting when closed, so the
  // front copy reads as a single clean ring). Solid chrome; the die is untouched.
  const RING_COPIES = 8
  const ringSpread = new THREE.Group()
  const ringCopies = []
  for (let i = 0; i < RING_COPIES; i++) {
    ringCopies.push(new THREE.Mesh(ringGeo, chrome))
    ringSpread.add(ringCopies[i])
  }

  // Group all and nudge down: the balanced spot is the middle of the gap
  // between the hero text (top) and the footer (bottom), which sits below the
  // geometric centre — otherwise there's too much empty space at the bottom.
  const motif = new THREE.Group()
  motif.add(die)
  motif.add(ringSpread)
  motif.position.y = -0.45
  scene.add(motif)

  // ---- Click interaction: globe spin → merge → die roll ----
  // Click the die and: (1) the ring snaps its pinch points to top & bottom, fans
  // open and spins one full turn — a globe of longitude rings; (2) the globe
  // merges back to a single ring; (3) the die spins fast and locks a random face
  // square to the camera (no pitch/roll). Click outside → resume the auto swing.
  const WORLD_Y = new THREE.Vector3(0, 1, 0)
  // Globe rest pose: face-on to the camera with the fan pinch axis vertical, so
  // the two pinch points sit at the top and bottom.
  const Q_GLOBE = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)
  // Exact axis-aligned orientations that bring each face square to the camera.
  const FACE_QUAT = {}
  for (const [v, ex, ey, ez] of [
    [1, 0, 0, 0], [6, Math.PI, 0, 0],
    [2, 0, -Math.PI / 2, 0], [5, 0, Math.PI / 2, 0],
    [3, Math.PI / 2, 0, 0], [4, -Math.PI / 2, 0, 0],
  ]) {
    FACE_QUAT[v] = new THREE.Quaternion().setFromEuler(new THREE.Euler(ex, ey, ez))
  }

  const T_FAN = 0.9 // ring fans open + spins one full turn (globe)
  const T_MERGE = 0.5 // globe merges back to a single ring
  const T_DIE = 2.35 // die spins the whole time, halting after the globe merges (longer tail = smoother settle)
  const T_HOLD = 1.1 // hold on the number after it stops
  const T_RESUME = 1.5 // ease back into the auto swing
  const GLOBE_ANGLE = 0.42 // fan spread while it's a globe (8 copies → ~170° of longitudes)
  const DIE_SPINS = 4 // whole turns the die spins before it settles
  // Idle "deck of cards" fan: rarely, the copies spread around the ring's
  // diameter (like gravity briefly pulling them apart) then merge back.
  const IDLE_FAN_ANGLE = 0.27 // per-copy spread when open — wide enough to read as distinct rings
  const IDLE_WINDOW = 6.0 // seconds the ring stays "loose" and fans through each face-on pass
  const idleFan = { start: -100, next: 6 } // first window ~6s in, then irregular gaps

  const seq = {
    mode: 'auto', // 'auto' | 'seq' | 'hold' | 'resume'
    start: 0,
    holdStart: 0,
    resumeStart: 0,
    ringFrom: new THREE.Quaternion(),
    dieFrom: new THREE.Quaternion(),
    dieTarget: new THREE.Quaternion(),
    dieAxis: new THREE.Vector3(),
    ringResume: new THREE.Quaternion(),
    dieResume: new THREE.Quaternion(),
  }
  const _spinQ = new THREE.Quaternion()
  const _globeQ = new THREE.Quaternion()
  const _autoE = new THREE.Euler()
  const _ringNormal = new THREE.Vector3()
  // smootherstep: zero velocity AND acceleration at both ends → no jitter
  const easeIO = (p) => {
    const t = Math.min(1, Math.max(0, p))
    return t * t * t * (t * (t * 6 - 15) + 10)
  }
  const smooth = (a, b, x) => easeIO((x - a) / (b - a))

  function startSequence(now) {
    seq.ringFrom.copy(ringSpread.quaternion)
    seq.dieFrom.copy(die.quaternion) // die starts spinning right away
    const value = 1 + Math.floor(Math.random() * 6)
    seq.dieTarget.copy(FACE_QUAT[value])
    _spinQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.floor(Math.random() * 4) * (Math.PI / 2))
    seq.dieTarget.premultiply(_spinQ)
    seq.dieAxis.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
    seq.start = now
    seq.mode = 'seq'
  }

  function startResume(now) {
    seq.ringResume.copy(ringSpread.quaternion)
    seq.dieResume.copy(die.quaternion)
    seq.resumeStart = now
    seq.mode = 'resume'
  }

  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  if (!reduced) {
    canvas.style.pointerEvents = 'auto'
    canvas.addEventListener('pointerdown', (ev) => {
      const r = canvas.getBoundingClientRect()
      ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1
      ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      if (raycaster.intersectObject(dieBrush, false).length) {
        startSequence(clock.getElapsedTime()) // hit the die → run the sequence
      } else if (seq.mode !== 'auto' && seq.mode !== 'resume') {
        startResume(clock.getElapsedTime()) // clicked outside → ease back to auto
      }
    })
  }

  // ---- Bloom (Y2K glow + flare), kept fully transparent ----
  // Selective-bloom setup: one composer renders the scene and extracts the
  // glow; the final composer adds that glow back onto the base render. The
  // base keeps its alpha, so the page shows through and the halo spills onto
  // the page (additive over the premultiplied canvas) instead of a dark box.
  const renderPass = new RenderPass(scene, camera)
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.28, 0.32, 0.9)

  const bloomComposer = new EffectComposer(renderer)
  bloomComposer.renderToScreen = false
  bloomComposer.addPass(renderPass)
  bloomComposer.addPass(bloom)

  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D baseTexture;
        uniform sampler2D bloomTexture;
        varying vec2 vUv;
        void main() {
          vec4 base = texture2D(baseTexture, vUv);
          // Y2K chromatic split: sample the glow's R/B channels at a slight
          // radial offset so the bloom fringes into red/cyan toward the edges.
          vec2 dir = vUv - 0.5;
          float ca = 0.008;
          vec3 glow = vec3(
            texture2D(bloomTexture, vUv + dir * ca).r,
            texture2D(bloomTexture, vUv).g,
            texture2D(bloomTexture, vUv - dir * ca).b
          );
          // UnrealBloomPass writes alpha 1 everywhere, so drive the halo alpha
          // from the glow's brightness instead — transparent where there's no
          // glow, so the page shows through and the halo spills onto it.
          float halo = clamp(dot(glow, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
          vec4 color = vec4(base.rgb + glow, clamp(base.a + halo, 0.0, 1.0));
          // Fade the whole frame out near the canvas edges so the glow never
          // reveals a hard rectangular container edge (premultiplied: scale
          // rgb + alpha together). Horizontal has room; vertical is tighter.
          float mx = min(vUv.x, 1.0 - vUv.x);
          float my = min(vUv.y, 1.0 - vUv.y);
          float edge = smoothstep(0.0, 0.14, mx) * smoothstep(0.0, 0.06, my);
          gl_FragColor = color * edge;
        }`,
    }),
    'baseTexture',
  )
  mixPass.needsSwap = true

  const finalComposer = new EffectComposer(renderer)
  finalComposer.addPass(renderPass)
  finalComposer.addPass(mixPass)
  finalComposer.addPass(new OutputPass())

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    bloomComposer.setSize(w, h)
    finalComposer.setSize(w, h)
    bloom.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)

  // ---- Live webcam environment (auto-requested on load) ----
  const CAM_LAYER = 1
  let cubeCamera = null
  // Touch devices (phones/tablets) skip the webcam entirely — no camera prompt,
  // no per-frame cube render — and just use the studio-lit chrome fallback.
  const coarse = window.matchMedia('(pointer: coarse)').matches
  // Reflection cube kept modest; smaller on constrained/high-DPR screens so it
  // stays cheap without visibly degrading the reflection.
  const CUBE_SIZE = window.innerWidth < 900 || window.devicePixelRatio > 2 ? 160 : 256
  async function tryWebcam() {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      const video = document.createElement('video')
      video.setAttribute('playsinline', '')
      video.muted = true
      video.srcObject = stream
      await video.play()

      const videoTexture = new THREE.VideoTexture(video)
      videoTexture.colorSpace = THREE.SRGBColorSpace
      // Tile the feed across the dome so the mirror reflects many smaller
      // copies instead of one magnified patch — reflections read as a busy
      // environment rather than a super-zoomed close-up of the face.
      videoTexture.wrapS = videoTexture.wrapT = THREE.RepeatWrapping
      videoTexture.repeat.set(4, 3)

      // The live feed wraps the whole environment (a video dome); only the
      // CubeCamera sees it, so the die reflects it like a chrome object in a
      // video-lit room. (Restored from PR #18 — the reflection that read well.)
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(20, 48, 48),
        new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.BackSide }),
      )
      dome.layers.set(CAM_LAYER)
      scene.add(dome)

      // The live feed is low-dynamic-range (capped at white) and its brightness
      // rides on the visitor's room light, so on its own it either goes dark and
      // flat or, in a bright room, blows out — and the Y2K glow, which needs
      // reflections above the bloom threshold, never lands reliably. Hang the
      // same HDR light panels the studio uses *inside* the webcam environment,
      // on the reflection-only layer, so they never show as rectangles in the
      // hero but the die always catches bright highlight streaks that bloom —
      // independent of the room. The live video still fills the darker body of
      // the reflection, so the visitor's face reads in the chrome.
      const camPanel = (w, h, pos, level) => {
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(level, level, level), // >1 = HDR highlight
            side: THREE.DoubleSide,
          }),
        )
        m.position.set(pos[0], pos[1], pos[2])
        m.lookAt(0, -0.45, 0) // aim at the die (motif is nudged down 0.45)
        m.layers.set(CAM_LAYER) // reflection-only: the main camera never sees it
        scene.add(m)
      }
      camPanel(10, 6, [0, 6, 9], 5.0) // key streak, upper front
      camPanel(5, 11, [-10, 2, 3], 3.0) // rim, left
      camPanel(5, 11, [10, 1, 4], 2.2) // rim, right
      camPanel(8, 8, [0, 2, -11], 1.4) // back kicker

      const cubeRT = new THREE.WebGLCubeRenderTarget(CUBE_SIZE, { type: THREE.HalfFloatType })
      cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT)
      cubeCamera.layers.set(CAM_LAYER)

      chrome.envMap = cubeRT.texture
      chrome.envMapIntensity = 1.0 // video mid-tones read without washing out
      chrome.needsUpdate = true
      // Bloom stays at the studio values (threshold 0.9 / strength 0.28): the HDR
      // panels above drive the glow now, not the room, so it can't blow out or
      // flatten with the visitor's lighting.
    } catch {
      // denied or unavailable — studio reflections remain
    }
  }
  if (!coarse) tryWebcam() // desktop only — phones use the studio fallback

  // ---- Device tilt → reflection reacts (phones) ----
  // Rotate the studio environment with the phone's orientation, so the chrome's
  // reflection shifts as you tilt the device. Cheap: just a shader rotation.
  let tiltX = 0
  let tiltY = 0
  function setupTilt() {
    const DOE = window.DeviceOrientationEvent
    if (!DOE || !scene.environmentRotation) return
    const onTilt = (e) => {
      const g = e.gamma || 0 // left/right tilt, −90..90
      const b = e.beta || 0 // front/back tilt, −180..180
      tiltY = THREE.MathUtils.clamp(g / 90, -1, 1) * 0.7
      tiltX = THREE.MathUtils.clamp((b - 50) / 80, -1, 1) * 0.4 // ~50° neutral hold
    }
    const add = () => window.addEventListener('deviceorientation', onTilt, true)
    if (typeof DOE.requestPermission === 'function') {
      // iOS needs a user gesture to grant orientation access
      const req = () => {
        canvas.removeEventListener('pointerdown', req)
        DOE.requestPermission().then((s) => s === 'granted' && add()).catch(() => {})
      }
      canvas.addEventListener('pointerdown', req)
    } else {
      add()
    }
  }
  if (coarse) setupTilt()

  function renderFrame() {
    if (cubeCamera) cubeCamera.update(renderer, scene)
    bloomComposer.render()
    finalComposer.render()
  }

  // The ring's tumble pose as a function of time.
  function ringPose(tt, e) {
    e.set(
      tt * -0.5 + Math.sin(tt * 0.83) * 0.4,
      tt * -0.4 + Math.sin(tt * 0.67) * 0.4,
      tt * -0.6 + Math.sin(tt * 1.09) * 0.3,
    )
  }

  // Fan the ring copies open by `angle` around the shared diameter (local X),
  // pinched at the two points where the ring crosses that axis. A tiny depth
  // offset keeps them from z-fighting when the fan is closed.
  function layoutRing(angle) {
    const c = (RING_COPIES - 1) / 2
    for (let i = 0; i < RING_COPIES; i++) {
      ringCopies[i].rotation.x = (i - c) * angle
      ringCopies[i].position.z = (i - c) * 0.004
    }
  }

  if (reduced) {
    die.rotation.set(0.5, 0.7, 0.1)
    ringSpread.rotation.set(0.6, 0.3, 0.2)
    layoutRing(0) // closed to one ring when still
    renderFrame()
    if (navigator.mediaDevices) {
      ;(function loop() {
        requestAnimationFrame(loop)
        renderFrame()
      })()
    }
    return
  }

  let visible = true
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas)

  const clock = new THREE.Clock()
  function tick() {
    requestAnimationFrame(tick)
    if (!visible) return
    const t = clock.getElapsedTime()

    if (seq.mode === 'seq') {
      const tau = t - seq.start
      // ---- Ring globe: fan open + spin one full turn, then merge back ----
      if (tau < T_FAN + T_MERGE) {
        // ease-in-out on the spin so it accelerates and decelerates smoothly
        const spinAngle = 2 * Math.PI * easeIO(Math.min(1, tau / T_FAN))
        _globeQ.setFromAxisAngle(WORLD_Y, spinAngle).multiply(Q_GLOBE)
        // ease from the auto pose into the spinning globe over the first slice
        ringSpread.quaternion.copy(seq.ringFrom).slerp(_globeQ, smooth(0, 0.3 * T_FAN, tau))
        const angle = tau < T_FAN
          ? GLOBE_ANGLE * easeIO(tau / T_FAN)
          : GLOBE_ANGLE * (1 - easeIO((tau - T_FAN) / T_MERGE))
        layoutRing(angle)
      } else {
        ringSpread.quaternion.copy(Q_GLOBE) // single face-on ring, held
        layoutRing(0)
      }
      // ---- Die: spins the whole time (the globe drives it), still turning as
      // the ring closes, and comes to a halt on its face shortly after ----
      // Slerp and spin-decay share one eased value so the angular velocity is
      // smooth (ease-in-out) rather than jittery.
      const s = easeIO(Math.min(1, tau / T_DIE))
      die.quaternion.copy(seq.dieFrom).slerp(seq.dieTarget, s)
      _spinQ.setFromAxisAngle(seq.dieAxis, DIE_SPINS * Math.PI * 2 * (1 - s))
      die.quaternion.multiply(_spinQ)
      if (tau >= T_DIE) {
        die.quaternion.copy(seq.dieTarget)
        seq.mode = 'hold'
        seq.holdStart = t
      }
    } else if (seq.mode === 'hold') {
      // hold the number briefly, then start easing back to the auto swing
      ringSpread.quaternion.copy(Q_GLOBE)
      layoutRing(0)
      die.quaternion.copy(seq.dieTarget)
      if (t - seq.holdStart >= T_HOLD) startResume(t)
    } else if (seq.mode === 'resume') {
      // blend from the held pose back into the (moving) auto pose, eased
      const rp = easeIO((t - seq.resumeStart) / T_RESUME)
      _autoE.set(t * 0.7, t * 0.9, t * 0.35)
      die.quaternion.copy(seq.dieResume).slerp(_globeQ.setFromEuler(_autoE), rp)
      ringPose(t, _autoE)
      ringSpread.quaternion.copy(seq.ringResume).slerp(_globeQ.setFromEuler(_autoE), rp)
      layoutRing(0)
      if (rp >= 1) seq.mode = 'auto'
    } else {
      // ---- Auto swing: a single ring tumbling, with a rare eased fan ----
      die.rotation.x = t * 0.7
      die.rotation.y = t * 0.9
      die.rotation.z = t * 0.35
      ringPose(t, ringSpread.rotation)
      // Occasional "deck of cards" fan: for a few seconds the copies spread
      // apart each time the ring swings through face-on ("horizontal"), then
      // merge as it tilts edge-on — like gravity briefly pulling them open.
      let fan = 0
      const since = t - idleFan.start
      if (since < IDLE_WINDOW) {
        // plateau envelope: ramp the effect in/out over ~1.2s, full in between
        const env = smooth(0, 1.2, since) * smooth(0, 1.2, IDLE_WINDOW - since)
        // spread scales with how much of the ring the camera can see: fully
        // open when it faces us or lies flat (deck reads clearly), merged to a
        // single ring only when it's a thin vertical sliver (spread would mush)
        _ringNormal.set(0, 0, 1).applyQuaternion(ringSpread.quaternion)
        const open = smooth(0.35, 0.85, Math.hypot(_ringNormal.y, _ringNormal.z))
        fan = IDLE_FAN_ANGLE * env * open
      } else if (t >= idleFan.next) {
        idleFan.start = t
        // irregular gap (~12–20s) so it feels unpredictable, not metronomic
        idleFan.next = t + IDLE_WINDOW + 12 + (Math.sin(t * 2.3) * 0.5 + 0.5) * 8
      }
      layoutRing(fan)
    }

    // ease the studio environment toward the device tilt so the reflection reacts
    if (scene.environmentRotation) {
      scene.environmentRotation.y += (tiltY - scene.environmentRotation.y) * 0.08
      scene.environmentRotation.x += (tiltX - scene.environmentRotation.x) * 0.08
    }

    renderFrame()
  }
  tick()
}
