import Link from 'next/link'

// Vector logo: a gradient app-style mark (cart + spark) and a wordmark.
// Crisp at any size, transparent background, follows light/dark theme.
export const LogoMark = ({ className = '', title }) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    role={title ? 'img' : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : true}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="nc-grad" x1="6" y1="0" x2="42" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#a78bfa" />
        <stop offset="0.55" stopColor="#7c3aed" />
        <stop offset="1" stopColor="#5b21b6" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="13" fill="url(#nc-grad)" />
    {/* cart */}
    <path
      d="M9.5 14h4.2l3.4 15.2a2 2 0 0 0 2 1.6h12.2a2 2 0 0 0 1.9-1.4l3.1-10.6H15.6"
      fill="none"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="21" cy="36.5" r="2.4" fill="#fff" />
    <circle cx="32" cy="36.5" r="2.4" fill="#fff" />
    {/* spark */}
    <path
      d="M35.5 4.5l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"
      fill="#fff"
    />
  </svg>
)

const BrandLogo = ({
  compact = false,
  variant = 'auto', // 'auto' follows the theme, 'light' is for dark backgrounds
  tagline = false,
}) => {
  const nova = variant === 'light' ? 'text-white' : 'text-[var(--nova-text)]'
  const cart = variant === 'light' ? 'text-[#c4b5fd]' : 'text-[var(--nova-primary)]'

  return (
    <Link
      href="/"
      aria-label="NovaCart home"
      className="flex min-w-0 shrink-0 items-center gap-2.5"
    >
      <LogoMark className={compact ? 'h-8 w-8' : 'h-9 w-9 sm:h-10 sm:w-10'} />

      <span className="flex flex-col leading-none">
        <span
          className={`font-extrabold tracking-[-0.04em] ${
            compact ? 'text-[19px]' : 'text-[21px] sm:text-[23px]'
          }`}
        >
          <span className={nova}>Nova</span>
          <span className={cart}>Cart</span>
        </span>

        {tagline && (
          <span
            className={`mt-1 text-[10px] font-medium tracking-[0.12em] ${
              variant === 'light'
                ? 'text-white/70'
                : 'text-[var(--nova-muted)]'
            }`}
          >
            SHOP SMART · LIVE BETTER
          </span>
        )}
      </span>
    </Link>
  )
}

export default BrandLogo
