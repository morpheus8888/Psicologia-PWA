import Image from 'next/image'

import { getAvatarGradient, isValidAvatar } from '@/lib/avatar-options'

interface UserAvatarProps {
  animal: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses: Record<NonNullable<UserAvatarProps['size']>, string> = {
  sm: 'h-14 w-14',
  md: 'h-20 w-20',
  lg: 'h-28 w-28',
}

const imageDimensions: Record<NonNullable<UserAvatarProps['size']>, number> = {
  sm: 40,
  md: 56,
  lg: 80,
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
      <Image
        src={`/images/animals/${avatarId}.svg`}
        alt={`Avatar ${avatarId}`}
        width={imageDimensions[size]}
        height={imageDimensions[size]}
        className='relative z-10 object-contain drop-shadow-lg'
      />
    </span>
  )
}
