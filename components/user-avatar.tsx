interface UserAvatarProps {
  animal: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function UserAvatar({ animal, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  return (
    <div className={`user-avatar ${sizeClasses[size]} ${className}`}>
      <img 
        src={`/images/animals/${animal}.svg`}
        alt={`Avatar ${animal}`}
        className="w-full h-full object-contain rounded-full border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1"
      />
    </div>
  )
}