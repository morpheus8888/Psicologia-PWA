export const phrases: Record<'en' | 'it', Record<string, string>> = {
  en: {
    Profile: 'Profile',
    Settings: 'Settings',
    'Profile menu': 'Profile menu',
    'Display name': 'Display name',
    Avatar: 'Avatar',
    'Not set': 'Not set',
    'Created at': 'Created at',
    Story: 'Story',
    Recipes: 'Recipes',
    'Latest insights from the community': 'Latest insights from the community',
    'Explore articles curated by the administrative team to support your wellbeing journey.':
      'Explore articles curated by the administrative team to support your wellbeing journey.',
    'No articles have been published yet. Check back soon!': 'No articles have been published yet. Check back soon!',
    Home: 'Home',
    Login: 'Login',
    'Light mode': 'Light mode',
    'Dark mode': 'Dark mode',
  },
  it: {
    Profile: 'Profilo',
    Settings: 'Impostazioni',
    'Profile menu': 'Menu profilo',
    'Display name': 'Nome visualizzato',
    Avatar: 'Avatar',
    'Not set': 'Non impostato',
    'Created at': 'Creato il',
    Story: 'Storia',
    Recipes: 'Ricette',
    'Latest insights from the community': 'Ultimi approfondimenti dalla community',
    'Explore articles curated by the administrative team to support your wellbeing journey.':
      'Esplora gli articoli curati dal team amministrativo per supportare il tuo percorso di benessere.',
    'No articles have been published yet. Check back soon!': 'Non ci sono ancora articoli pubblicati. Torna presto!',
    Home: 'Home',
    Login: 'Accedi',
    'Light mode': 'Modalità chiara',
    'Dark mode': 'Modalità scura',
  },
}

export const resolvePhrase = (locale: 'en' | 'it', key: string): string => {
  const table = phrases[locale] ?? phrases.en
  return table[key] ?? key
}
