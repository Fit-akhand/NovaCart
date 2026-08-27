import Link from 'next/link'

const BrandLogo = ({ compact = false, variant = 'auto' }) => {
  const size = compact
    ? 'h-8 w-[120px]'
    : 'h-9 w-[135px] sm:h-10 sm:w-[150px]'

  return (
    <Link
      href="/"
      aria-label="NovaCart home"
      className="flex min-w-0 shrink-0 items-center"
    >
      {(variant === 'auto' || variant === 'dark') && (
        <img
          src="/logo/novacart-dark.png.png"
          alt="NovaCart"
          className={`
            object-contain
            ${size}
            ${variant === 'auto' ? 'block dark:hidden' : 'block'}
          `}
        />
      )}

      {(variant === 'auto' || variant === 'light') && (
        <img
          src="/logo/novacart-light.png.png"
          alt="NovaCart"
          className={`
            object-contain
            ${size}
            ${variant === 'auto' ? 'hidden dark:block' : 'block'}
          `}
        />
      )}
    </Link>
  )
}

export default BrandLogo