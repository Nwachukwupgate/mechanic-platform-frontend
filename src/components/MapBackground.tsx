/**
 * Full-bleed map background with gradient overlay so content stays readable.
 * Uses a static map-style image and blends it with the primary palette.
 */
const MAP_IMAGE_URL =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1920&q=80'

type MapBackgroundProps = {
  /** 'dark' = strong overlay for light text (hero); 'light' = subtle for dark text (forms) */
  variant?: 'dark' | 'light'
  /** Extra class for the wrapper (e.g. min-h-screen) */
  className?: string
  children: React.ReactNode
}

export function MapBackground({ variant = 'dark', className = '', children }: MapBackgroundProps) {
  const overlay =
    variant === 'dark'
      ? 'bg-gradient-to-b from-primary-900/85 via-primary-800/80 to-primary-900/90'
      : 'bg-gradient-to-b from-white/92 via-slate-50/95 to-white/92'

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${className}`.trim()}>
      {/* Map layer: fixed, scaled, low prominence */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${MAP_IMAGE_URL})`,
          opacity: variant === 'dark' ? 0.4 : 0.25,
        }}
        aria-hidden
      />
      {/* Gradient overlay for blend and readability */}
      <div className={`absolute inset-0 ${overlay}`} aria-hidden />
      {/* Content on top */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
