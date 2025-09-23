import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export const locales = {
  it: { label: 'IT', loader: () => import('@/locales/it/messages') },
  en: { label: 'EN', loader: () => import('@/locales/en/messages') },
}

const defaultLocale = 'it'

type CatalogMessages = Record<string, string>

const toCompiledCatalog = (locale: string, messages: CatalogMessages) => ({
  messages,
  locale,
  languageData: {},
  _compiled: true,
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
        const messages: CatalogMessages = (localeModule as any).default ?? (localeModule as any).messages ?? {}

        i18n.load(targetLocale, toCompiledCatalog(targetLocale, messages))
        i18n.activate(targetLocale)
        setReady(true)
      } catch (error) {
        console.error('Error loading locale:', error)
        // Fallback to default locale
        try {
          const defaultModule = await locales[defaultLocale].loader()
          const messages: CatalogMessages = (defaultModule as any).default ?? (defaultModule as any).messages ?? {}
          i18n.load(defaultLocale, toCompiledCatalog(defaultLocale, messages))
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
