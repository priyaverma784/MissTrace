/**
 * Decorative "face analysis" visual: an abstract face mesh with corner
 * brackets and a slow scanning line. It is an illustration, not a real photo.
 */
export function FaceScan() {
  const nodes: Array<[number, number]> = [
    [100, 40], [70, 55], [130, 55], [50, 85], [150, 85], [45, 120], [155, 120],
    [60, 160], [140, 160], [80, 190], [120, 190], [100, 205], [75, 95], [125, 95],
    [100, 110], [100, 150], [82, 165], [118, 165],
  ]
  const edges: Array<[number, number]> = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8], [7, 9], [8, 10], [9, 11], [10, 11],
    [1, 12], [2, 13], [12, 14], [13, 14], [14, 15], [15, 16], [15, 17], [12, 3], [13, 4], [16, 9], [17, 10],
    [12, 13], [3, 4],
  ]
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-2xl border border-cyan-300/20 bg-navy-900/60">
      <svg viewBox="0 0 200 240" className="h-full w-full" role="img" aria-label="Illustration of AI face analysis">
        <defs>
          <radialGradient id="faceGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0c1733" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="240" fill="url(#faceGlow)" />
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a][0]}
            y1={nodes[a][1] + 5}
            x2={nodes[b][0]}
            y2={nodes[b][1] + 5}
            stroke="#38bdf8"
            strokeOpacity="0.5"
            strokeWidth="0.8"
          />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y + 5} r="2" fill="#7dd3fc" />
        ))}
      </svg>
      <div className="absolute inset-x-0 h-14 animate-scan bg-gradient-to-b from-transparent via-cyan-300/25 to-transparent motion-reduce:hidden" />
      {/* corner brackets */}
      {['left-3 top-3 border-l-2 border-t-2', 'right-3 top-3 border-r-2 border-t-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'].map(
        (c) => (
          <span key={c} className={`absolute h-6 w-6 border-cyan-300/80 ${c}`} aria-hidden />
        ),
      )}
    </div>
  )
}
