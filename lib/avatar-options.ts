export type AvatarOption = {
  id: string
  gradient: string
}

export const avatarOptions: AvatarOption[] = [
  { id: 'leone', gradient: 'from-amber-200 via-amber-300 to-orange-400' },
  { id: 'gatto', gradient: 'from-pink-200 via-rose-200 to-amber-200' },
  { id: 'cane', gradient: 'from-orange-200 via-amber-200 to-emerald-200' },
  { id: 'orso', gradient: 'from-stone-200 via-amber-200 to-stone-300' },
  { id: 'volpe', gradient: 'from-orange-200 via-amber-300 to-fuchsia-200' },
  { id: 'lupo', gradient: 'from-slate-200 via-slate-300 to-blue-200' },
  { id: 'coniglio', gradient: 'from-rose-200 via-pink-200 to-sky-200' },
  { id: 'panda', gradient: 'from-slate-200 via-zinc-200 to-amber-100' },
  { id: 'tigre', gradient: 'from-amber-200 via-orange-300 to-red-300' },
  { id: 'elefante', gradient: 'from-sky-200 via-cyan-200 to-indigo-200' },
  { id: 'koala', gradient: 'from-zinc-200 via-stone-200 to-slate-300' },
  { id: 'giraffa', gradient: 'from-yellow-200 via-amber-200 to-orange-300' },
  { id: 'farfalla', gradient: 'from-violet-200 via-fuchsia-200 to-sky-200' },
]

export const avatarIds = avatarOptions.map((option) => option.id)

export const getAvatarGradient = (id: string) => {
  const found = avatarOptions.find((option) => option.id === id)
  return found?.gradient ?? 'from-zinc-200 via-zinc-300 to-zinc-400'
}

export const isValidAvatar = (id?: string | null): id is string => {
  if (!id) return false
  return avatarIds.includes(id)
}
