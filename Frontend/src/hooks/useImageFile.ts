import { useCallback, useEffect, useState } from 'react'

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png']

/** Holds a selected image file, its preview URL and any validation error. */
export function useImageFile() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const select = useCallback((next: File | null) => {
    if (!next) {
      setFile(null)
      setError(null)
      return
    }
    if (!ACCEPTED.includes(next.type)) {
      setError('Unsupported file. Please choose a JPG or PNG image.')
      return
    }
    if (next.size > MAX_IMAGE_BYTES) {
      setError('That image is larger than 10 MB. Please choose a smaller one.')
      return
    }
    setError(null)
    setFile(next)
  }, [])

  const clear = useCallback(() => select(null), [select])

  return { file, preview, error, select, clear, setError }
}
