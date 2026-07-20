import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg'

// A chrome die tumbling inside a spinning hoop, on a transparent canvas.
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
  renderer.setClearColor(0x000000, 0) // transparent — page ground shows through
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0, 9.5)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.06,
    envMapIntensity: 1.15,
  })

  // ---- Die (chrome, with pip depressions carved via CSG) ----
  const DIE = 1.5
  const o = 0.32
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
  const evaluator = new Evaluator()
  evaluator.useGroups = false
  let dieBrush = new Brush(new RoundedBoxGeometry(DIE, DIE, DIE, 6, 0.16))
  dieBrush.updateMatrixWorld()
  const holeGeo = new THREE.SphereGeometry(0.14, 24, 24)
  for (const [axis, sign, count] of FACES) {
    for (const [u, v] of LAYOUTS[count]) {
      const hole = new Brush(holeGeo)
      if (axis === 'z') hole.position.set(u, v, sign * H)
      else if (axis === 'x') hole.position.set(sign * H, u, v)
      else hole.position.set(u, sign * H, v)
      hole.updateMatrixWorld()
      dieBrush = evaluator.evaluate(dieBrush, hole, SUBTRACTION)
    }
  }
  dieBrush.material = chrome
  dieBrush.geometry.computeVertexNormals()
  const die = new THREE.Group()
  die.add(dieBrush)
  scene.add(die)

  // ---- Hoop ----
  const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.1, 32, 180), chrome)
  scene.add(hoop)

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
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

      // Bright studio-gradient dome so the die reflects a lit environment
      // (not black) — visible only to the CubeCamera.
      const gc = document.createElement('canvas')
      gc.width = 8
      gc.height = 256
      const gx = gc.getContext('2d')
      const grd = gx.createLinearGradient(0, 0, 0, 256)
      grd.addColorStop(0.0, '#ededed')
      grd.addColorStop(0.5, '#8f8f8f')
      grd.addColorStop(1.0, '#2a2a2a')
      gx.fillStyle = grd
      gx.fillRect(0, 0, 8, 256)
      const gradTex = new THREE.CanvasTexture(gc)
      gradTex.colorSpace = THREE.SRGBColorSpace
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(40, 32, 32),
        new THREE.MeshBasicMaterial({ map: gradTex, side: THREE.BackSide }),
      )
      dome.layers.set(CAM_LAYER)
      scene.add(dome)

      // Screen in front showing the mirrored feed — the visitor's face.
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(26, 15),
        new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false }),
      )
      screen.position.set(0, 0, 12)
      screen.rotation.y = Math.PI
      screen.layers.set(CAM_LAYER)
      scene.add(screen)

      const cubeRT = new THREE.WebGLCubeRenderTarget(512, { type: THREE.HalfFloatType })
      cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT)
      cubeCamera.layers.set(CAM_LAYER)

      chrome.envMap = cubeRT.texture
      chrome.envMapIntensity = 1.35
      chrome.needsUpdate = true
    } catch {
      // denied or unavailable — studio reflections remain
    }
  }
  tryWebcam()

  function renderFrame() {
    if (cubeCamera) cubeCamera.update(renderer, scene)
    renderer.render(scene, camera)
  }

  if (reduced) {
    die.rotation.set(0.5, 0.7, 0.1)
    hoop.rotation.set(0.3, 0, 0)
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
    die.rotation.x = t * 0.7
    die.rotation.y = t * 0.9
    hoop.rotation.y = t * 0.5
    hoop.rotation.z = Math.sin(t * 0.4) * 0.3
    renderFrame()
  }
  tick()
}
