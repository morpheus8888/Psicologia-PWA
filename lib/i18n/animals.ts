import { defineMessage } from '@lingui/core'

export const animalMessages = {
  leone: defineMessage({ id: 'leone' }),
  gatto: defineMessage({ id: 'gatto' }),
  cane: defineMessage({ id: 'cane' }),
  orso: defineMessage({ id: 'orso' }),
  volpe: defineMessage({ id: 'volpe' }),
  lupo: defineMessage({ id: 'lupo' }),
  coniglio: defineMessage({ id: 'coniglio' }),
  panda: defineMessage({ id: 'panda' }),
  tigre: defineMessage({ id: 'tigre' }),
  elefante: defineMessage({ id: 'elefante' }),
  koala: defineMessage({ id: 'koala' }),
  giraffa: defineMessage({ id: 'giraffa' }),
  farfalla: defineMessage({ id: 'farfalla' }),
} as const

type AnimalKey = keyof typeof animalMessages

export const resolveAnimalMessage = (id: AnimalKey) => animalMessages[id]

export type AnimalMessageKey = AnimalKey
