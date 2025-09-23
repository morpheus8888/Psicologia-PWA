import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import compileMessage from '@lingui/message-utils/compileMessage'

import itMessages from '@/locales/it/messages'
import enMessages from '@/locales/en/messages'
import { resolvePhrase, PhraseKey } from '@/lib/i18n-phrases'

export const locales = {
  it: { label: 'IT', loader: () => import('@/locales/it/messages') },
  en: { label: 'EN', loader: () => import('@/locales/en/messages') },
}

const defaultLocale = 'it'

const createPluralRule = (locale: string) => {
  const cardinal = new Intl.PluralRules(locale)
  const ordinal = new Intl.PluralRules(locale, { type: 'ordinal' })
  return (value: number, ord?: boolean) => (ord ? ordinal : cardinal).select(value)
}

const pluralRules = {
  en: createPluralRule('en'),
  it: createPluralRule('it'),
}

i18n.loadLocaleData({
  en: { plurals: pluralRules.en },
  it: { plurals: pluralRules.it },
})
i18n.setMessagesCompiler(compileMessage)

const buildCatalog = (locale: keyof typeof pluralRules, messages: Record<string, string>) => ({
  messages,
  locale,
  languageData: { plurals: pluralRules[locale] },
  _compiled: true,
})

i18n.load('it', buildCatalog('it', itMessages))
i18n.load('en', buildCatalog('en', enMessages))
i18n.activate(defaultLocale)

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useRouter()
  const [ready, setReady] = useState(false)
  const activeLocale = useMemo<'en' | 'it'>(() => {
    if (!locale) return defaultLocale as 'en' | 'it'
    return (locale in locales ? locale : defaultLocale) as 'en' | 'it'
  }, [locale])

  useEffect(() => {
    const load = async () => {
      try {
        const current = (locale || defaultLocale) as keyof typeof locales
        const targetLocale = locales[current] ? current : defaultLocale
        if (!locales[current]) {
          console.warn(`Locale ${current} not found, using default ${defaultLocale}`)
        }

        const localeModule = await locales[targetLocale].loader()
        const messages: Record<string, string> = (localeModule as any).default ?? (localeModule as any).messages ?? {}

        const catalog = buildCatalog(targetLocale, messages)

        i18n.load(targetLocale, catalog)
        i18n.activate(targetLocale)
        setReady(true)
      } catch (error) {
        console.error('Error loading locale:', error)
        // Fallback to default locale
        try {
          const defaultModule = await locales[defaultLocale].loader()
          const messages: Record<string, string> =
            (defaultModule as any).default ?? (defaultModule as any).messages ?? {}
          const catalog = buildCatalog(defaultLocale, messages)

          i18n.load(defaultLocale, catalog)
          i18n.activate(defaultLocale)
          setReady(true)
        } catch (fallbackError) {
          console.error('Error loading default locale:', fallbackError)
        }
      }
    }
    load()
  }, [locale])

  if (!ready) return null
  return (
    <I18nProvider
      i18n={i18n}
      defaultComponent={({ id }) => <>{resolvePhrase(activeLocale, id as PhraseKey)}</>}
    >
      {children}
    </I18nProvider>
  )
}
