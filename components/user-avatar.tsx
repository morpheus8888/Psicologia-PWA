import { getAvatarGradient, isValidAvatar } from '@/lib/avatar-options'

interface UserAvatarProps {
  animal: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses: Record<NonNullable<UserAvatarProps['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

const imageScale: Record<NonNullable<UserAvatarProps['size']>, string> = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export default function UserAvatar({ animal, size = 'md', className = '' }: UserAvatarProps) {
  const avatarId = isValidAvatar(animal) ? animal : 'leone'
  const gradient = getAvatarGradient(avatarId)

  const containerClass = [
    'relative inline-flex items-center justify-center rounded-full shadow-md shadow-zinc-900/10 dark:shadow-black/40 overflow-hidden',
    'bg-gradient-to-br',
    gradient,
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={containerClass}>
      <span className='absolute inset-0 rounded-full bg-white/70 dark:bg-zinc-900/70 mix-blend-overlay' aria-hidden='true' />
      <img
        src={`/images/animals/${avatarId}.svg`}
        alt={`Avatar ${avatarId}`}
        className={`relative z-10 object-contain drop-shadow-lg ${imageScale[size]}`}
        loading='lazy'
      />
    </span>
  )
}
