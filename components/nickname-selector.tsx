import { Trans, useLingui } from '@/lib/i18n'

import UserAvatar from '@/components/user-avatar'
import { avatarOptions, avatarIds } from '@/lib/avatar-options'
import { animalMessages, AnimalMessageKey } from '@/lib/i18n/animals'

interface NicknameSelectorProps {
  selectedAnimal: string
  onAnimalSelect: (animal: string) => void
  className?: string
}

export default function NicknameSelector({ selectedAnimal, onAnimalSelect, className = '' }: NicknameSelectorProps) {
  const safeSelected = avatarIds.includes(selectedAnimal) ? selectedAnimal : avatarIds[0]
  const { i18n } = useLingui()

  return (
    <div className={`nickname-selector ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-center text-zinc-800 dark:text-zinc-200">
        <Trans id='Scegli il tuo animale' />
      </h3>
      <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
        {avatarOptions.map(({ id }) => (
          <button
            key={id}
            onClick={() => onAnimalSelect(id)}
            className={`animal-option ${safeSelected === id ? 'selected' : ''}`}
            title={id}
            type='button'
          >
            <UserAvatar animal={id} size='sm' />
          </button>
        ))}
      </div>
      <p className="text-center mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        <Trans id='Animale selezionato:' />{' '}
        <strong>{i18n._(animalMessages[safeSelected as AnimalMessageKey])}</strong>
      </p>
    </div>
  )
}
