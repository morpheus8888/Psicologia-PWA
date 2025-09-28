import { t } from '@lingui/macro'

export const animalMessages = {
  leone: t`leone`,
  gatto: t`gatto`,
  cane: t`cane`,
  orso: t`orso`,
  volpe: t`volpe`,
  lupo: t`lupo`,
  coniglio: t`coniglio`,
  panda: t`panda`,
  tigre: t`tigre`,
  elefante: t`elefante`,
  koala: t`koala`,
  giraffa: t`giraffa`,
  farfalla: t`farfalla`,
} as const

type AnimalKey = keyof typeof animalMessages

export const resolveAnimalMessage = (id: AnimalKey) => animalMessages[id]

export type AnimalMessageKey = AnimalKey
