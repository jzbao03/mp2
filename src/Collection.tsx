import { Link, useSearchParams } from 'react-router-dom'
import { selectArtworks } from './artworks'
import type { Artwork } from './artworks'
import ArtworkImage from './ArtworkImage'
import styles from './App.module.css'

export default function Collection({ artworks, gallery = false }: { artworks: Artwork[]; gallery?: boolean }) {
  const [params, setParams] = useSearchParams()
  const results = selectArtworks(artworks, params)
  const selectedTypes = params.getAll('type')
  const types = [...new Set(artworks.map(art => art.artwork_type_title))].sort()

  function update(name: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(name, value)
    else next.delete(name)
    setParams(next, { replace: true })
  }

  function toggleType(type: string) {
    const next = new URLSearchParams(params)
    if (selectedTypes.includes(type)) next.delete('type', type)
    else next.append('type', type)
    setParams(next, { replace: true })
  }

  function detailLink(id: number) {
    const next = new URLSearchParams(params)
    next.set('view', gallery ? 'gallery' : 'list')
    return `/items/${id}?${next}`
  }

  return <>
    <h2>{gallery ? 'Gallery' : 'Artwork list'}</h2>
    <p>Explore {artworks.length} public-domain works from the Art Institute of Chicago.</p>
    {gallery ? <fieldset className={styles.filters}>
      <legend>Filter by artwork type</legend>
      <p>Select one or more types. Nothing selected shows all works.</p>
      <div className={styles.checkboxes}>{types.map(type => <label key={type}>
        <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} />
        {type}
      </label>)}</div>
    </fieldset> : <div className={styles.controls}>
      <label className={styles.search}>Search title or artist
        <input type="search" placeholder="e.g., Monet or garden" value={params.get('q') || ''} onChange={event => update('q', event.target.value)} />
      </label>
      <label>Sort by
        <select value={params.get('sort') || 'title'} onChange={event => update('sort', event.target.value)}>
          <option value="title">Title</option>
          <option value="artist">Artist</option>
          <option value="date">Year</option>
        </select>
      </label>
      <label>Order
        <select value={params.get('order') || 'asc'} onChange={event => update('order', event.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    </div>}
    <div className={styles.resultBar}>
      <p role="status">{results.length} {results.length === 1 ? 'artwork' : 'artworks'}</p>
      <button onClick={() => setParams({}, { replace: true })}>Reset {gallery ? 'filters' : 'search and sort'}</button>
    </div>
    {!results.length && <p>No artworks match. Try a different search or reset the filters.</p>}
    <ul className={gallery ? styles.gallery : styles.list}>
      {results.map(art => <li key={art.id}>
        <Link to={detailLink(art.id)} className={gallery ? styles.card : styles.row}>
          <ArtworkImage art={art} />
          <div>
            <h3>{art.title}</h3>
            <p>{art.artist_title || 'Unknown artist'}</p>
            <p className={styles.muted}>{art.date_display} · {art.artwork_type_title}</p>
          </div>
        </Link>
      </li>)}
    </ul>
  </>
}
