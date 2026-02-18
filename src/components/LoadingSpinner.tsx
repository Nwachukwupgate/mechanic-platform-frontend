export default function LoadingSpinner({
  size = 'md',
  variant = 'default',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'logo'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  if (variant === 'logo') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src="/logo.jpeg"
          alt=""
          role="presentation"
          className={`${sizeClasses[size]} animate-spin rounded-xl object-cover`}
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`}
      />
    </div>
  )
}
