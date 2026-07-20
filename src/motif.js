import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

// A chrome die tumbling inside a spinning hoop, with a Y2K bloom glow.
// Reflects a studio environment by default; if the visitor grants camera
// access on load, the live feed becomes the environment instead.
export function initMotif(canvas) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  } catch {
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x161616, 1) // matches the page ground
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x161616) // keep the ground dark under bloom
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0, 8.5)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.06,
    envMapIntensity: 1.15,
  })
  const pipMat = new THREE.MeshStandardMaterial({
    color: 0x0b0b0b,
    metalness: 0.3,
    roughness: 0.5,
  })

  // ---- Die ----
  const die = new THREE.Group()
  die.add(new THREE.Mesh(new RoundedBoxGeometry(1.2, 1.2, 1.2, 6, 0.18), chrome))

  const o = 0.26 // pip offset from face centre
  const H = 0.61 // distance to face surface
  const pipGeo = new THREE.SphereGeometry(0.072, 24, 24)
  const LAYOUTS = {
    1: [[0, 0]],
    2: [[-o, o], [o, -o]],
    3: [[-o, o], [0, 0], [o, -o]],
    4: [[-o, o], [o, o], [-o, -o], [o, -o]],
    5: [[-o, o], [o, o], [0, 0], [-o, -o], [o, -o]],
    6: [[-o, o], [-o, 0], [-o, -o], [o, o], [o, 0], [o, -o]],
  }
  // axis, sign, pip count — opposite faces sum to 7
  const FACES = [
    ['z', 1, 1], ['z', -1, 6],
    ['x', 1, 2], ['x', -1, 5],
    ['y', 1, 3], ['y', -1, 4],
  ]
  for (const [axis, sign, count] of FACES) {
    for (const [u, v] of LAYOUTS[count]) {
      const pip = new THREE.Mesh(pipGeo, pipMat)
      if (axis === 'z') pip.position.set(u, v, sign * H)
      else if (axis === 'x') pip.position.set(sign * H, u, v)
      else pip.position.set(u, sign * H, v)
      die.add(pip)
    }
  }
  scene.add(die)

  // ---- Hoop ----
  const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.1, 32, 180), chrome)
  scene.add(hoop)

  // Rim lights keep the chrome's speculars sharp (and feed the bloom).
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1)
  keyLight.position.set(3, 4, 5)
  scene.add(keyLight)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
  fillLight.position.set(-4, -2, 2)
  scene.add(fillLight)

  // ---- Bloom composer (the Y2K glow) ----
  const sizeV = renderer.getDrawingBufferSize(new THREE.Vector2())
  const rt = new THREE.WebGLRenderTarget(sizeV.x, sizeV.y, {
    type: THREE.HalfFloatType,
    samples: 4,
  })
  const composer = new EffectComposer(renderer, rt)
  composer.addPass(new RenderPass(scene, camera))
  // Subtle Y2K glow: only the hottest highlights (>1) bloom.
  const bloom = new UnrealBloomPass(sizeV.clone(), 0.45, 0.35, 1.0)
  composer.addPass(bloom)
  composer.addPass(new OutputPass()) // applies tone mapping + sRGB correctly

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    const db = renderer.getDrawingBufferSize(new THREE.Vector2())
    composer.setSize(db.x, db.y)
    bloom.setSize(db.x, db.y)
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

      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(20, 48, 48),
        new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.BackSide }),
      )
      dome.layers.set(CAM_LAYER)
      scene.add(dome)

      const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType })
      cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT)
      cubeCamera.layers.set(CAM_LAYER)

      chrome.envMap = cubeRT.texture
      chrome.envMapIntensity = 1.4
      chrome.needsUpdate = true
    } catch {
      // denied or unavailable — studio reflections remain
    }
  }
  tryWebcam()

  function renderFrame() {
    if (cubeCamera) cubeCamera.update(renderer, scene)
    composer.render()
  }

  if (reduced) {
    die.rotation.set(0.5, 0.7, 0.1)
    hoop.rotation.set(0.3, 0, 0)
    ;(function loop() {
      requestAnimationFrame(loop)
      renderFrame()
    })()
    return
  }

  let visible = true
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas)

  const clock = new THREE.Clock()
  function tick() {
    requestAnimationFrame(tick)
    if (!visible) return
    const t = clock.getElapsedTime()
    die.rotation.x = t * 0.7
    die.rotation.y = t * 0.9
    hoop.rotation.y = t * 0.5
    hoop.rotation.z = Math.sin(t * 0.4) * 0.3
    renderFrame()
  }
  tick()
}
