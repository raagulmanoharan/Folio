import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// A spinning chrome object. By default it reflects a studio environment;
// if the visitor grants camera access it reflects their live webcam feed.
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

  // Studio IBL — the default reflections, and the fallback if no webcam.
  const pmrem = new THREE.PMREMGenerator(renderer)
  const studioEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = studioEnv

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
  scene.add(knot)

  // Two rim lights give the chrome sharp specular highlights independent of
  // the environment — so it never reads as flat/dark, even on a dim webcam.
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
  keyLight.position.set(3, 4, 5)
  scene.add(keyLight)
  const fillLight = new THREE.DirectionalLight(0xffffff, 1.4)
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

  // ---- Live webcam reflection (opt-in) ----
  let videoTexture = null
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

        videoTexture = new THREE.VideoTexture(video)
        videoTexture.colorSpace = THREE.SRGBColorSpace
        videoTexture.mapping = THREE.EquirectangularReflectionMapping
        chrome.envMap = videoTexture
        // Webcam feeds are LDR and dim once tone-mapped, so lift the
        // reflection: stronger env intensity + a brighter exposure.
        chrome.envMapIntensity = 3.2
        chrome.needsUpdate = true
        renderer.toneMappingExposure = 1.5

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

  if (reduced) {
    knot.rotation.set(0.4, 0.6, 0)
    const renderStatic = () => renderer.render(scene, camera)
    renderStatic()
    // keep webcam reflection updating if enabled, but no spin
    if (videoTexture) requestAnimationFrame(function loop() { renderStatic(); requestAnimationFrame(loop) })
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
    renderer.render(scene, camera)
  }
  tick()
}
