import { defineMessage } from '@/lib/i18n'

export const animalMessages = {
  leone: defineMessage('leone'),
  gatto: defineMessage('gatto'),
  cane: defineMessage('cane'),
  orso: defineMessage('orso'),
  volpe: defineMessage('volpe'),
  lupo: defineMessage('lupo'),
  coniglio: defineMessage('coniglio'),
  panda: defineMessage('panda'),
  tigre: defineMessage('tigre'),
  elefante: defineMessage('elefante'),
  koala: defineMessage('koala'),
  giraffa: defineMessage('giraffa'),
  farfalla: defineMessage('farfalla'),
} as const

type AnimalKey = keyof typeof animalMessages

export const resolveAnimalMessage = (id: AnimalKey) => animalMessages[id]

export type AnimalMessageKey = AnimalKey
