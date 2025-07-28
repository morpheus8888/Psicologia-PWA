import { useState } from 'react'
import { Trans, useLingui } from '@lingui/react'

const animals = [
  'leone', 'gatto', 'cane', 'orso', 'volpe', 
  'lupo', 'coniglio', 'panda', 'tigre', 'elefante'
]

interface NicknameSelectorProps {
  selectedAnimal: string
  onAnimalSelect: (animal: string) => void
  className?: string
}

export default function NicknameSelector({ selectedAnimal, onAnimalSelect, className = '' }: NicknameSelectorProps) {
  return (
    <div className={`nickname-selector ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-center text-zinc-800 dark:text-zinc-200">
        <Trans id="Scegli il tuo animale" />
      </h3>
      <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
        {animals.map((animal) => (
          <button
            key={animal}
            onClick={() => onAnimalSelect(animal)}
            className={`animal-option ${selectedAnimal === animal ? 'selected' : ''}`}
            title={animal}
          >
            <img 
              src={`/images/animals/${animal}.svg`} 
              alt={animal}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>
      <p className="text-center mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        <Trans id="Animale selezionato:" /> <strong><Trans id={selectedAnimal} /></strong>
      </p>
    </div>
  )
}