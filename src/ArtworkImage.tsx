import { useState } from 'react'
import type { Artwork } from './artworks'
import styles from './App.module.css'

export default function ArtworkImage({ art, large = false }: { art: Artwork; large?: boolean }) {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  if (!art.image_id || failedImage === art.image_id) {
    return <div className={styles.noImage}>Image unavailable</div>
  }
  return <img
    src={`https://www.artic.edu/iiif/2/${art.image_id}/full/${large ? 843 : 400},/0/default.jpg`}
    referrerPolicy="no-referrer"
    alt={art.title}
    loading={large ? 'eager' : 'lazy'}
    onError={() => setFailedImage(art.image_id)}
  />
}
