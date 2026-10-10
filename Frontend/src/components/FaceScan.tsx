import faceScanImage from '../assets/images/face-scan.png'
import faceMesh from '../assets/images/face-mesh.svg'

export default function FaceScan() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-2xl border border-cyan-300/70 bg-navy-900/60 shadow-[0_0_30px_rgba(34,211,238,0.22)]">

      {/* Face image */}
      <img
        src={faceScanImage}
        alt="AI facial recognition scan"
        className="h-full w-full object-cover object-center opacity-65 mix-blend-screen"
      />

      {/* Face mesh overlay */}
      <img
        src={faceMesh}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[16%] h-[71%] w-[90%] -translate-x-1/2 object-contain"
      />

      {/* Thin animated scanning line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-scan-line bg-cyan-300 shadow-[0_0_6px_2px_rgba(34,211,238,0.65)] motion-reduce:hidden" />

      {/* Subtle scanning glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 animate-scan-line bg-gradient-to-b from-cyan-300/15 to-transparent motion-reduce:hidden" />

      {/* Bright corner frame */}
      <span
        className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-cyan-300"
        aria-hidden="true"
      />
      <span
        className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-cyan-300"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-cyan-300"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-cyan-300"
        aria-hidden="true"
      />
    </div>
  )
}
