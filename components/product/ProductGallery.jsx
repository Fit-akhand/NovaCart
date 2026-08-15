import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-size="20">No image</text></svg>'

const ProductGallery = ({ images = [], title = 'Product' }) => {
  const [tab, setTab] = useState(0)
  const safeImages = Array.isArray(images) ? images.filter((img) => img?.url) : []
  const current = safeImages[tab]?.url || FALLBACK_IMAGE

  const nextImage = () => {
    if (safeImages.length <= 1) return
    setTab((prev) => (prev >= safeImages.length - 1 ? 0 : prev + 1))
  }

  const previousImage = () => {
    if (safeImages.length <= 1) return
    setTab((prev) => (prev <= 0 ? safeImages.length - 1 : prev - 1))
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">
        <div className="aspect-square w-full sm:aspect-[4/3]">
          <img
            src={current}
            alt={title}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE
            }}
            className="h-full w-full object-contain p-6 sm:p-10"
          />
        </div>

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousImage}
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--nova-border)] bg-[var(--nova-surface)]"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--nova-border)] bg-[var(--nova-surface)]"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {safeImages.map((img, index) => (
            <button
              key={`${img.url}-${index}`}
              type="button"
              onClick={() => setTab(index)}
              aria-label={`View image ${index + 1}`}
              className={`aspect-square overflow-hidden rounded-lg border-2 bg-[var(--nova-surface)] ${
                tab === index ? 'border-[var(--nova-blue)]' : 'border-[var(--nova-border)]'
              }`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery
