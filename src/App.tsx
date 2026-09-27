import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useParams } from 'react-router-dom'
import { getCollection } from './artworks'
import type { Artwork } from './artworks'
import Collection from './Collection'
import Details from './Details'
import styles from './App.module.css'
import Loading from './Loading'

function DetailRoute({ artworks }: { artworks: Artwork[] }) {
  const { id } = useParams()
  return <Details key={id} artworks={artworks} />
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    getCollection().then(data => { if (!cancelled) setArtworks(data) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [attempt])

  function retry() {
    setLoading(true)
    setError(false)
    setAttempt(attempt + 1)
  }

  let collectionStatus = null
  if (loading) {
    collectionStatus = <Loading message="Loading the collection…" />
  } else if (error) {
    collectionStatus = <div role="alert">
      <p>Could not load the collection. Check your connection and try again.</p>
      <button onClick={retry}>Try again</button>
    </div>
  }

  return <div className={styles.container}>
    <header>
      <h1>Art Explorer</h1>
      <p>A small collection of paintings, sculptures, and more.</p>
      <nav className={styles.nav} aria-label="Main navigation">
        <NavLink to="/" end>List</NavLink>
        <NavLink to="/gallery">Gallery</NavLink>
      </nav>
    </header>
    <main><Routes>
      <Route path="/" element={collectionStatus || <Collection artworks={artworks} />} />
      <Route path="/gallery" element={collectionStatus || <Collection artworks={artworks} gallery />} />
      <Route path="/items/:id" element={<DetailRoute artworks={artworks} />} />
      <Route path="*" element={<><h2>Page not found</h2><Link to="/">Back to list</Link></>} />
    </Routes></main>
    <footer>CS409 · MP2 · Data and images from the <a href="https://www.artic.edu/">Art Institute of Chicago</a>.</footer>
  </div>
}

export default App
