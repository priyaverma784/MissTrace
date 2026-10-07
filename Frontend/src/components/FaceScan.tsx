import faceMesh from '../assets/images/face-mesh.svg'

// Face-analysis picture for the landing page: a face mesh (from assets/face-mesh.svg)
// with a scanning line and a corner frame. It is an illustration, not a real photo.
export default function FaceScan() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-2xl border border-cyan-300/20 bg-navy-900/60">
      <img src={faceMesh} alt="Illustration of AI face analysis" className="h-full w-full" />

      {/* scanning line moving up and down */}
      <div className="absolute inset-x-0 h-14 animate-scan bg-gradient-to-b from-transparent via-cyan-300/25 to-transparent motion-reduce:hidden" />

      {/* corner frame */}
      <span className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-cyan-300/80" aria-hidden />
      <span className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-cyan-300/80" aria-hidden />
      <span className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-cyan-300/80" aria-hidden />
      <span className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-cyan-300/80" aria-hidden />
    </div>
  )
}
