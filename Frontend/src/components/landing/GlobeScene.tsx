import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Deterministic pseudo random so the scene looks the same on every render. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    points.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius))
  }
  return points
}

function Globe({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null)

  const { dots, markers, arcs, particles } = useMemo(() => {
    const radius = 1.6
    const dotPositions = fibonacciSphere(900, radius)
    const dotArray = new Float32Array(dotPositions.length * 3)
    dotPositions.forEach((p, i) => p.toArray(dotArray, i * 3))

    const markerPoints = fibonacciSphere(14, radius).filter((_, i) => i % 1 === 0)
    const rand = seeded(42)

    const arcLines = Array.from({ length: 7 }).map(() => {
      const a = markerPoints[Math.floor(rand() * markerPoints.length)]
      const b = markerPoints[Math.floor(rand() * markerPoints.length)]
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.35)
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40))
      return new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.35 }),
      )
    })

    const particleArray = new Float32Array(120 * 3)
    for (let i = 0; i < 120; i++) {
      const v = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5)
        .normalize()
        .multiplyScalar(2.2 + rand() * 1.4)
      v.toArray(particleArray, i * 3)
    }

    return { dots: dotArray, markers: markerPoints, arcs: arcLines, particles: particleArray }
  }, [])

  useFrame((_, delta) => {
    if (group.current && !reduceMotion) group.current.rotation.y += delta * 0.12
  })

  return (
    <>
      <group ref={group} rotation={[0.35, 0, 0.1]}>
        <mesh>
          <sphereGeometry args={[1.58, 48, 48]} />
          <meshBasicMaterial color="#0b1a3d" transparent opacity={0.55} />
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={dots} count={dots.length / 3} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color="#60a5fa" size={0.022} sizeAttenuation transparent opacity={0.85} />
        </points>
        {markers.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.032, 12, 12]} />
            <meshBasicMaterial color="#22d3ee" />
          </mesh>
        ))}
        {arcs.map((line, i) => (
          <primitive key={i} object={line} />
        ))}
      </group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={particles} count={particles.length / 3} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#93c5fd" size={0.02} sizeAttenuation transparent opacity={0.5} />
      </points>
    </>
  )
}

/** Subtle rotating globe with connected location points. Decorative only. */
export default function GlobeScene() {
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      aria-hidden
    >
      <Globe reduceMotion={reduceMotion} />
    </Canvas>
  )
}
