import { createMessage } from '@/lib/i18n'

export const animalMessages = {
  leone: createMessage('leone'),
  gatto: createMessage('gatto'),
  cane: createMessage('cane'),
  orso: createMessage('orso'),
  volpe: createMessage('volpe'),
  lupo: createMessage('lupo'),
  coniglio: createMessage('coniglio'),
  panda: createMessage('panda'),
  tigre: createMessage('tigre'),
  elefante: createMessage('elefante'),
  koala: createMessage('koala'),
  giraffa: createMessage('giraffa'),
  farfalla: createMessage('farfalla'),
} as const

type AnimalKey = keyof typeof animalMessages

export const resolveAnimalMessage = (id: AnimalKey) => animalMessages[id]

export type AnimalMessageKey = AnimalKey
