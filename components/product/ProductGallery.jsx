import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-size="20">No image</text></svg>'

const ProductGallery = ({
  images = [],
  title = 'Product',
}) => {
  const [tab, setTab] = useState(0)

  const safeImages = Array.isArray(images)
    ? images.filter((img) => img?.url)
    : []

  const current =
    safeImages[tab]?.url ||
    FALLBACK_IMAGE

  const nextImage = () => {
    if (safeImages.length <= 1) return

    setTab((prev) =>
      prev >= safeImages.length - 1
        ? 0
        : prev + 1
    )
  }

  const previousImage = () => {
    if (safeImages.length <= 1) return

    setTab((prev) =>
      prev <= 0
        ? safeImages.length - 1
        : prev - 1
    )
  }

  return (
    <div className="w-full">

      {/* =================================================
          MAIN IMAGE
      ================================================= */}

      <div
        className="
          group
          relative
          overflow-hidden

          rounded-2xl

          border
          border-[var(--nova-border)]

          bg-[var(--nova-surface)]

          shadow-[var(--shadow-sm)]

          transition-all
          duration-300

          hover:border-[var(--nova-violet-light)]
          hover:shadow-[0_16px_40px_rgba(124,58,237,0.10)]
        "
      >

        {/* Decorative glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            z-0

            h-48
            w-48

            rounded-full

            bg-[rgba(139,92,246,0.08)]

            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            -left-24
            z-0

            h-48
            w-48

            rounded-full

            bg-[rgba(167,139,250,0.06)]

            blur-3xl
          "
        />

        {/* Image container */}

        <div
          className="
            relative
            z-[1]

            aspect-square
            w-full

            sm:aspect-[4/3]
          "
        >
          <img
            src={current}
            alt={title}
            onError={(event) => {
              event.currentTarget.src =
                FALLBACK_IMAGE
            }}
            className="
              h-full
              w-full

              object-contain

              p-5

              transition-transform
              duration-500
              ease-out

              group-hover:scale-[1.02]

              sm:p-10
            "
          />
        </div>

        {/* =================================================
            IMAGE NAVIGATION
        ================================================= */}

        {safeImages.length > 1 && (
          <>
            {/* Previous */}

            <button
              type="button"
              onClick={previousImage}
              className="
                absolute
                left-3
                top-1/2
                z-10

                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center

                rounded-full

                border
                border-[var(--nova-border)]

                bg-[color-mix(in_srgb,var(--nova-surface)_90%,transparent)]

                text-[var(--nova-text)]

                shadow-[0_6px_20px_rgba(0,0,0,0.10)]

                backdrop-blur-md

                transition-all
                duration-200

                hover:border-[var(--nova-violet-light)]
                hover:bg-[var(--nova-lavender-soft)]
                hover:text-[var(--nova-primary)]

                active:scale-95

                sm:left-4
              "
              aria-label="Previous image"
            >
              <ChevronLeft
                size={19}
                strokeWidth={2}
              />
            </button>

            {/* Next */}

            <button
              type="button"
              onClick={nextImage}
              className="
                absolute
                right-3
                top-1/2
                z-10

                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center

                rounded-full

                border
                border-[var(--nova-border)]

                bg-[color-mix(in_srgb,var(--nova-surface)_90%,transparent)]

                text-[var(--nova-text)]

                shadow-[0_6px_20px_rgba(0,0,0,0.10)]

                backdrop-blur-md

                transition-all
                duration-200

                hover:border-[var(--nova-violet-light)]
                hover:bg-[var(--nova-lavender-soft)]
                hover:text-[var(--nova-primary)]

                active:scale-95

                sm:right-4
              "
              aria-label="Next image"
            >
              <ChevronRight
                size={19}
                strokeWidth={2}
              />
            </button>
          </>
        )}

        {/* =================================================
            IMAGE COUNTER
        ================================================= */}

        {safeImages.length > 1 && (
          <div
            className="
              absolute
              bottom-3
              right-3
              z-10

              rounded-full

              border
              border-[var(--nova-border)]

              bg-[color-mix(in_srgb,var(--nova-surface)_90%,transparent)]

              px-2.5
              py-1

              text-[10px]
              font-semibold

              text-[var(--nova-muted)]

              shadow-[0_4px_14px_rgba(0,0,0,0.08)]

              backdrop-blur-md
            "
          >
            {tab + 1} / {safeImages.length}
          </div>
        )}

      </div>

      {/* =================================================
          THUMBNAILS
      ================================================= */}

      {safeImages.length > 1 && (
        <div
          className="
            mt-4

            grid
            grid-cols-5
            gap-2

            sm:gap-3
          "
        >
          {safeImages.map(
            (img, index) => (
              <button
                key={`${img.url}-${index}`}
                type="button"
                onClick={() =>
                  setTab(index)
                }
                aria-label={`View image ${
                  index + 1
                }`}
                aria-current={
                  tab === index
                    ? 'true'
                    : undefined
                }
                className={`
                  group/thumb
                  relative
                  aspect-square
                  overflow-hidden

                  rounded-xl

                  border-2

                  bg-[var(--nova-surface)]

                  transition-all
                  duration-200

                  ${
                    tab === index
                      ? `
                        border-[var(--nova-primary)]
                        shadow-[0_6px_18px_rgba(124,58,237,0.16)]
                      `
                      : `
                        border-[var(--nova-border)]
                        hover:border-[var(--nova-violet-light)]
                      `
                  }
                `}
              >
                <img
                  src={img.url}
                  alt=""
                  className={`
                    h-full
                    w-full
                    object-cover

                    transition-transform
                    duration-300

                    group-hover/thumb:scale-105

                    ${
                      tab === index
                        ? 'scale-[1.02]'
                        : ''
                    }
                  `}
                />

                {/* Active thumbnail overlay */}

                {tab === index && (
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0

                      bg-[rgba(124,58,237,0.08)]

                      ring-1
                      ring-inset
                      ring-[rgba(124,58,237,0.12)]
                    "
                  />
                )}
              </button>
            )
          )}
        </div>
      )}

      {/* =================================================
          MOBILE THUMBNAIL SCROLL SUPPORT
      ================================================= */}

      {safeImages.length > 5 && (
        <p
          className="
            mt-2
            text-center

            text-[10px]
            text-[var(--nova-muted)]

            sm:hidden
          "
        >
          Swipe thumbnails to explore
        </p>
      )}
    </div>
  )
}

export default ProductGallery