import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { getArtwork, selectArtworks } from './artworks'
import type { Artwork } from './artworks'
import ArtworkImage from './ArtworkImage'
import styles from './App.module.css'
import Loading from './Loading'

export default function Details({ artworks }: { artworks: Artwork[] }) {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const [loaded, setLoaded] = useState<Artwork | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const known = artworks.find(art => String(art.id) === id)
  const art = known || loaded
  const validId = /^\d+$/.test(id)

  useEffect(() => {
    let cancelled = false
    if (!known && validId) {
      getArtwork(id).then(result => { if (!cancelled) setLoaded(result) })
        .catch(reason => {
          if (!cancelled) setError(axios.isAxiosError(reason) && reason.response?.status === 404
            ? 'Artwork not found.' : 'Could not load this artwork. Please try again.')
        })
    }
    return () => { cancelled = true }
  }, [id, known, validId, attempt])

  const backParams = new URLSearchParams(params)
  backParams.delete('view')
  const view = params.get('view') === 'gallery' ? 'gallery' : 'list'
  const back = <Link to={`${view === 'gallery' ? '/gallery' : '/'}?${backParams}`}>← Back to {view}</Link>
  const filtered = selectArtworks(artworks, params)
  const cycle = filtered.some(item => String(item.id) === id) ? filtered : selectArtworks(artworks, new URLSearchParams())
  const index = cycle.findIndex(item => String(item.id) === id)
  const previous = index < 0 ? cycle[cycle.length - 1] : cycle[(index - 1 + cycle.length) % cycle.length]
  const next = cycle[(index + 1) % cycle.length]

  function retry() {
    setError('')
    setAttempt(attempt + 1)
  }

  if (!validId) return <>{back}<h2>Artwork not found</h2></>
  if (error && !art) return <>
    {back}
    <div role="alert">
      <p>{error}</p>
      <button onClick={retry}>Try again</button>
    </div>
  </>
  if (!art) return <>{back}<Loading message="Loading artwork…" /></>

  return <>
    {back}
    <h2>{art.title}</h2>
    <div className={styles.details}>
      <ArtworkImage art={art} large />
      <dl>
        <dt>Artist</dt><dd>{art.artist_title || 'Unknown artist'}</dd>
        <dt>Date</dt><dd>{art.date_display || 'Unknown'}</dd>
        <dt>Type</dt><dd>{art.artwork_type_title || 'Unknown'}</dd>
        <dt>Medium</dt><dd>{art.medium_display || 'Not listed'}</dd>
        <dt>Dimensions</dt><dd>{art.dimensions || 'Not listed'}</dd>
        <dt>Origin</dt><dd>{art.place_of_origin || 'Not listed'}</dd>
        <dt>Museum ID</dt><dd>{art.id}</dd>
      </dl>
    </div>
    {cycle.length > 0 && <nav className={styles.pager} aria-label="Artwork navigation">
      <Link to={`/items/${previous.id}?${params}`}>← Previous</Link>
      <span>{index >= 0 ? `${index + 1} of ${cycle.length}` : 'Browse collection'}</span>
      <Link to={`/items/${next.id}?${params}`}>Next →</Link>
    </nav>}
  </>
}
