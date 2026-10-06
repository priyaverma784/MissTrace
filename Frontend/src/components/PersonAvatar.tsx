import { useState } from 'react'
import { initials } from '../utils/format'

interface PersonAvatarProps {
  name: string
  src: string | null
  className?: string
  rounded?: 'full' | 'lg'
}

/** Photo with a graceful initials fallback if it is missing or fails to load. */
export function PersonAvatar({ name, src, className = 'h-10 w-10', rounded = 'full' }: PersonAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = src && failedSrc !== src
  const shape = rounded === 'full' ? 'rounded-full' : 'rounded-lg'

  if (showImage) {
    return (
      <img
        src={src}
        alt={name ? `Photo of ${name}` : 'Missing person photo'}
        loading="lazy"
        onError={() => setFailedSrc(src)}
        className={`${className} ${shape} object-cover bg-slate-100`}
      />
    )
  }
  return (
    <div
      className={`${className} ${shape} flex items-center justify-center bg-navy-100 text-sm font-semibold text-navy-700`}
      aria-label={name ? `No photo for ${name}` : 'No photo'}
    >
      {initials(name)}
    </div>
  )
}
