import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// A spinning chrome sphere on a transparent canvas (merges with the page).
// Reflects a studio environment by default; if the visitor grants camera
// access on load, the live feed becomes the environment so their reflection
// appears on the sphere.
export function initMotif(canvas) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0) // transparent — the page ground shows through
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0, 6.5)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.045,
    envMapIntensity: 1.2,
  })
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.5, 128, 128), chrome)
  scene.add(sphere)

  // Rim lights give sweeping speculars (animated for life on a plain ball).
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8)
  keyLight.position.set(3, 4, 5)
  scene.add(keyLight)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6)
  fillLight.position.set(-4, -2, 2)
  scene.add(fillLight)

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

      // Large screen in front of the sphere shows the mirrored feed; only the
      // CubeCamera sees it, so the sphere mirrors the visitor's face.
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(26, 15),
        new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false }),
      )
      screen.position.set(0, 0, 9)
      screen.rotation.y = Math.PI
      screen.layers.set(CAM_LAYER)
      scene.add(screen)

      const cubeRT = new THREE.WebGLCubeRenderTarget(512, { type: THREE.HalfFloatType })
      cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT)
      cubeCamera.layers.set(CAM_LAYER)

      chrome.envMap = cubeRT.texture
      chrome.envMapIntensity = 1.7
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
    sphere.rotation.y = t * 0.25
    sphere.position.y = Math.sin(t * 0.6) * 0.12
    keyLight.position.x = Math.cos(t * 0.4) * 5
    keyLight.position.z = Math.sin(t * 0.4) * 5
    renderFrame()
  }
  tick()
}
