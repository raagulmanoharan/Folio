import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// A spinning chrome object. By default it reflects a studio environment.
// If the visitor grants camera access, the live webcam feed becomes the
// object's surrounding environment (rendered to a live cubemap), so the
// chrome reflects it like a real reflective probe.
export function initMotif(canvas, cameraButton) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    return // no WebGL — leave the canvas blank
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0, 8.5)

  // Studio IBL — the default reflections and the fallback if no webcam.
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.08,
    envMapIntensity: 1.1,
  })

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.82, 0.26, 260, 40, 2, 3),
    chrome,
  )
  scene.add(knot) // stays on layer 0

  // Rim lights keep sharp speculars on the chrome regardless of environment.
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
  keyLight.position.set(3, 4, 5)
  scene.add(keyLight)
  const fillLight = new THREE.DirectionalLight(0xffffff, 1.2)
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

  // ---- Live webcam environment (opt-in) ----
  // The video is drawn on an inward-facing dome placed on layer 1, which the
  // main camera never renders. A CubeCamera (also layer 1) captures that dome
  // into a live cubemap each frame; the chrome uses it as its environment.
  const CAM_LAYER = 1
  let cubeCamera = null
  const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

  if (cameraButton && hasCamera) {
    cameraButton.addEventListener('click', async () => {
      cameraButton.disabled = true
      cameraButton.textContent = 'Requesting camera…'
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

        // Inward dome showing the live feed — visible only to the CubeCamera.
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
        chrome.envMapIntensity = 1.35
        chrome.needsUpdate = true

        cameraButton.textContent = 'Reflection: live'
        cameraButton.classList.add('is-live')
      } catch {
        cameraButton.disabled = false
        cameraButton.textContent = 'Camera unavailable'
      }
    })
  } else if (cameraButton) {
    cameraButton.hidden = true
  }

  function renderFrame() {
    if (cubeCamera) cubeCamera.update(renderer, scene)
    renderer.render(scene, camera)
  }

  if (reduced) {
    knot.rotation.set(0.4, 0.6, 0)
    // Still refresh so a live reflection updates, but no spin.
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
    knot.rotation.y = t * 0.45
    knot.rotation.x = Math.sin(t * 0.3) * 0.2
    renderFrame()
  }
  tick()
}
