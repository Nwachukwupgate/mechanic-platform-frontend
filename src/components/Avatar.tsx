function getInitials(name: string, fallback?: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
  }
  if (parts.length === 1 && parts[0].length > 0) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (fallback || '?').slice(0, 1).toUpperCase()
}

interface AvatarProps {
  src?: string | null
  name?: string
  fallbackLetter?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  ring?: boolean
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

export default function Avatar({
  src,
  name = '',
  fallbackLetter,
  size = 'md',
  className = '',
  ring = false,
}: AvatarProps) {
  const initials = getInitials(name, fallbackLetter)
  const sizeClass = sizeClasses[size]
  const ringClass = ring ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-100' : ''

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`rounded-full object-cover ${sizeClass} ${ringClass} ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold ${sizeClass} ${ringClass} ${className}`}
      aria-hidden
    >
      {initials}
    </div>
  )
}
