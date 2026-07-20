import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
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
  camera.position.set(0, 0, 9.0)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.06,
    envMapIntensity: 0.75,
  })

  // The carved pip cavities are brushed gold — a warm metallic gold with a
  // rough, textured finish so they read as matte gold dots, not mirrors.
  const pipRough = new THREE.MeshStandardMaterial({
    color: 0xf2b84b,
    metalness: 1.0,
    roughness: 0.55,
    envMapIntensity: 0.9,
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
  // useGroups keeps the carved cavity faces on their own material index, so the
  // pips can take the rougher finish while the body stays a mirror.
  const evaluator = new Evaluator()
  evaluator.useGroups = true
  let dieBrush = new Brush(new RoundedBoxGeometry(DIE, DIE, DIE, 6, 0.18))
  dieBrush.material = chrome
  dieBrush.updateMatrixWorld()
  const holeGeo = new THREE.SphereGeometry(0.16, 24, 24)
  for (const [axis, sign, count] of FACES) {
    for (const [u, v] of LAYOUTS[count]) {
      const hole = new Brush(holeGeo, pipRough)
      if (axis === 'z') hole.position.set(u, v, sign * H)
      else if (axis === 'x') hole.position.set(sign * H, u, v)
      else hole.position.set(u, sign * H, v)
      hole.updateMatrixWorld()
      dieBrush = evaluator.evaluate(dieBrush, hole, SUBTRACTION)
    }
  }
  dieBrush.material = [chrome, pipRough]
  dieBrush.geometry.computeVertexNormals()
  const die = new THREE.Group()
  die.add(dieBrush)
  scene.add(die)

  // ---- Ring: a single chrome ring around the die, tumbling in all directions ----
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.08, 24, 220), chrome)
  scene.add(ring)

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
          vec4 glow = texture2D(bloomTexture, vUv);
          // UnrealBloomPass writes alpha 1 everywhere, so drive the halo alpha
          // from the glow's brightness instead — transparent where there's no
          // glow, so the page shows through and the halo spills onto it.
          float halo = clamp(dot(glow.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
          vec4 color = vec4(base.rgb + glow.rgb, clamp(base.a + halo, 0.0, 1.0));
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

      const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType })
      cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT)
      cubeCamera.layers.set(CAM_LAYER)

      for (const m of [chrome, pipRough]) {
        m.envMap = cubeRT.texture
        m.envMapIntensity = 1.05
        m.needsUpdate = true
      }
    } catch {
      // denied or unavailable — studio reflections remain
    }
  }
  tryWebcam()

  function renderFrame() {
    if (cubeCamera) cubeCamera.update(renderer, scene)
    bloomComposer.render()
    finalComposer.render()
  }

  if (reduced) {
    die.rotation.set(0.5, 0.7, 0.1)
    ring.rotation.set(0.6, 0.3, 0.2)
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
    // die tumbles freely on all three axes
    die.rotation.x = t * 0.7
    die.rotation.y = t * 0.9
    die.rotation.z = t * 0.35
    // The ring tumbles in all directions — a steady spin on every axis
    // (opposite the die) plus a wobble at incommensurate frequencies so the
    // motion drifts unpredictably instead of looping.
    ring.rotation.x = t * -0.5 + Math.sin(t * 0.83) * 0.4
    ring.rotation.y = t * -0.4 + Math.sin(t * 0.67) * 0.4
    ring.rotation.z = t * -0.6 + Math.sin(t * 1.09) * 0.3
    renderFrame()
  }
  tick()
}
