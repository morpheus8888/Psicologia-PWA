'use client'

import { useMemo, useState } from 'react'
import { Trans, useLingui } from '@/lib/i18n'

import UserAvatar from '@/components/user-avatar'
import { avatarOptions, avatarIds } from '@/lib/avatar-options'

interface AvatarSelectionProps {
  currentAvatar: string
  onSave: (newAvatar: string) => Promise<void>
  onCancel: () => void
}

export default function AvatarSelection({ currentAvatar, onSave, onCancel }: AvatarSelectionProps) {
  const { i18n } = useLingui()
  const initialAvatar = useMemo(() => (avatarIds.includes(currentAvatar) ? currentAvatar : avatarIds[0]), [currentAvatar])
  const [selectedAnimal, setSelectedAnimal] = useState(initialAvatar)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveClick = async () => {
    if (!selectedAnimal) return
    setIsSaving(true)
    await onSave(selectedAnimal)
    setIsSaving(false)
  }

  return (
    <div className='space-y-6'>
      <header className='space-y-2 text-center'>
        <h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
          <Trans id='Scegli il tuo animale' />
        </h2>
        <p className='text-sm text-zinc-600 dark:text-zinc-400'>
          <Trans id='Animale selezionato:' />{' '}
          <strong>{i18n._(selectedAnimal)}</strong>
        </p>
      </header>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
        {avatarOptions.map(({ id }) => {
          const isActive = selectedAnimal === id
          return (
            <button
              key={id}
              onClick={() => setSelectedAnimal(id)}
              className={`flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? 'border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-400/20 dark:border-emerald-500/70 dark:bg-emerald-500/10'
                  : 'border-transparent bg-white shadow-sm hover:shadow-md dark:bg-zinc-800'
              }`}
              type='button'
            >
              <UserAvatar animal={id} size='md' />
              <span className='text-sm font-medium text-zinc-700 dark:text-zinc-100'>{i18n._(id)}</span>
            </button>
          )
        })}
      </div>

      <div className='flex justify-end gap-2'>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className='rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
          type='button'
        >
          <Trans id='Annulla' />
        </button>
        <button
          onClick={handleSaveClick}
          disabled={isSaving}
          className='rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60'
          type='button'
        >
          {isSaving ? <Trans id='Salvando...' /> : <Trans id='Salva Avatar' />}
        </button>
      </div>
    </div>
  )
}
