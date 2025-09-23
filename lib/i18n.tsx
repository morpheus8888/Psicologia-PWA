import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { en, it } from 'make-plural/plurals'

export const locales = {
  it: { label: 'IT', loader: () => import('@/locales/it/messages') },
  en: { label: 'EN', loader: () => import('@/locales/en/messages') },
}

const defaultLocale = 'it'

const pluralRules = {
  en,
  it,
}

i18n.loadLocaleData({
  en: { plurals: pluralRules.en },
  it: { plurals: pluralRules.it },
})

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useRouter()
  const [ready, setReady] = useState(false)

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

        const catalog = {
          messages,
          locale: targetLocale,
          languageData: { plurals: pluralRules[targetLocale] ?? pluralRules[defaultLocale] },
          _compiled: true,
        }

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
          const catalog = {
            messages,
            locale: defaultLocale,
            languageData: { plurals: pluralRules[defaultLocale] },
            _compiled: true,
          }

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
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
