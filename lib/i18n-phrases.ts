export const phrases = {
  en: {
    profile: 'Profile',
    settings: 'Settings',
    profileMenu: 'Profile menu',
    displayName: 'Display name',
    avatar: 'Avatar',
    notSet: 'Not set',
    createdAt: 'Created at',
  },
  it: {
    profile: 'Profilo',
    settings: 'Impostazioni',
    profileMenu: 'Menu profilo',
    displayName: 'Nome visualizzato',
    avatar: 'Avatar',
    notSet: 'Non impostato',
    createdAt: 'Creato il',
  },
}

export type PhraseKey = keyof typeof phrases['en']

export const resolvePhrase = (locale: 'en' | 'it', key: PhraseKey): string => {
  const table = phrases[locale] ?? phrases.en
  return table[key] ?? key
}
