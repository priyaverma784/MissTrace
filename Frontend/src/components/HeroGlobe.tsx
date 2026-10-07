import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Small random generator with a fixed seed, so the globe looks the same every time.
function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

// Spreads `count` points evenly over a sphere.
function spherePoints(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const ring = Math.sqrt(1 - y * y)
    const angle = golden * i
    points.push(new THREE.Vector3(Math.cos(angle) * ring * radius, y * radius, Math.sin(angle) * ring * radius))
  }
  return points
}

// Slowly rotating 3D globe for the landing-page hero. Decoration only.
export default function HeroGlobe() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // If the browser has no WebGL, skip the globe instead of breaking the page.
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.domElement.style.display = 'block'
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 5)

    const radius = 1.6
    const random = seededRandom(42)
    const globe = new THREE.Group()
    globe.rotation.set(0.35, 0, 0.1)
    scene.add(globe)

    // Dark core of the globe
    globe.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1.58, 48, 48),
        new THREE.MeshBasicMaterial({ color: 0x0b1a3d, transparent: true, opacity: 0.55 }),
      ),
    )

    // Dots over the surface
    const dotsGeometry = new THREE.BufferGeometry().setFromPoints(spherePoints(900, radius))
    globe.add(
      new THREE.Points(
        dotsGeometry,
        new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.022, transparent: true, opacity: 0.85 }),
      ),
    )

    // Glowing location markers
    const markers = spherePoints(14, radius)
    const markerGeometry = new THREE.SphereGeometry(0.032, 12, 12)
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    markers.forEach((point) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      marker.position.copy(point)
      globe.add(marker)
    })

    // Curved lines connecting some of the markers
    const arcMaterial = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })
    for (let i = 0; i < 7; i++) {
      const from = markers[Math.floor(random() * markers.length)]
      const to = markers[Math.floor(random() * markers.length)]
      const middle = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.35)
      const curve = new THREE.QuadraticBezierCurve3(from, middle, to)
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)), arcMaterial))
    }

    // Small floating particles around the globe
    const particles: THREE.Vector3[] = []
    for (let i = 0; i < 120; i++) {
      particles.push(
        new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5)
          .normalize()
          .multiplyScalar(2.2 + random() * 1.4),
      )
    }
    scene.add(
      new THREE.Points(
        new THREE.BufferGeometry().setFromPoints(particles),
        new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.02, transparent: true, opacity: 0.5 }),
      ),
    )

    const render = () => renderer.render(scene, camera)

    const resize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      render()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    // People who prefer less motion get a still picture.
    let frame = 0
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let last = performance.now()
      const loop = (time: number) => {
        globe.rotation.y += ((time - last) / 1000) * 0.12
        last = time
        render()
        frame = requestAnimationFrame(loop)
      }
      frame = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      scene.traverse((item) => {
        if (item instanceof THREE.Mesh || item instanceof THREE.Points || item instanceof THREE.Line) {
          item.geometry.dispose()
          const materials = Array.isArray(item.material) ? item.material : [item.material]
          materials.forEach((material: THREE.Material) => material.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className="h-full w-full" aria-hidden />
}
