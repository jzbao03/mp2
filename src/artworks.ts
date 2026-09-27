import axios from 'axios'

export interface Artwork {
  id: number
  title: string
  artist_title: string | null
  date_display: string
  date_start: number | null
  artwork_type_title: string
  image_id: string | null
  medium_display: string
  dimensions: string
  place_of_origin: string | null
}

const api = axios.create({ baseURL: 'https://api.artic.edu/api/v1', timeout: 15000 })
const fields = 'id,title,artist_title,date_display,date_start,artwork_type_title,image_id,medium_display,dimensions,place_of_origin'
let collectionRequest: Promise<Artwork[]> | undefined

// Keep the loading animation visible even when the API responds quickly.
async function withLoadingDelay<T>(request: Promise<T>) {
  const [result] = await Promise.all([
    request,
    new Promise(resolve => setTimeout(resolve, 1200)),
  ])
  return result
}

export function getCollection() {
  // Reuse the collection when switching pages.
  if (!collectionRequest) {
    collectionRequest = withLoadingDelay(api.get<{ data: Artwork[] }>('/artworks/search', {
      params: { 'query[term][is_public_domain]': true, limit: 100, fields },
    })).then(response => response.data.data.filter(art => art.image_id))
      .catch(error => {
        collectionRequest = undefined
        throw error
      })
  }
  return collectionRequest
}

export async function getArtwork(id: string) {
  const response = await withLoadingDelay(api.get<{ data: Artwork }>(`/artworks/${id}`, { params: { fields } }))
  return response.data.data
}

export function selectArtworks(artworks: Artwork[], params: URLSearchParams) {
  const query = (params.get('q') || '').trim().toLowerCase()
  const types = params.getAll('type')
  const sort = params.get('sort') || 'title'
  const direction = params.get('order') === 'desc' ? -1 : 1
  const results = artworks.filter(art => {
    const text = `${art.title} ${art.artist_title || ''}`.toLowerCase()
    const matchesType = types.length === 0 || types.includes(art.artwork_type_title)
    return text.includes(query) && matchesType
  })

  return results.sort((a, b) => {
    // Unknown dates stay last, in either direction.
    if (sort === 'date') {
      if (a.date_start === null) return b.date_start === null ? a.id - b.id : 1
      if (b.date_start === null) return -1
      return (a.date_start - b.date_start) * direction || a.id - b.id
    }
    const left = sort === 'artist' ? a.artist_title || 'Unknown artist' : a.title
    const right = sort === 'artist' ? b.artist_title || 'Unknown artist' : b.title
    return left.localeCompare(right) * direction || a.id - b.id
  })
}
