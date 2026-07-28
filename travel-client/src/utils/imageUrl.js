import { API_BASE_URL } from '../api/client'

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')
const FALLBACK_TOUR_IMAGE = '/images/tours/da-nang-hoi-an.jpg'
const FALLBACK_DESTINATION_IMAGE = '/images/destinations/da-nang.jpg'

export function getImageUrl(imagePath, fallbackPath = FALLBACK_TOUR_IMAGE) {
  const source = imagePath || fallbackPath

  if (/^(https?:)?\/\//i.test(source) || source.startsWith('data:')) {
    return source
  }

  if (source.startsWith('/images/')) {
    return `${API_ORIGIN}${source}`
  }

  return source
}

export { FALLBACK_DESTINATION_IMAGE, FALLBACK_TOUR_IMAGE }
