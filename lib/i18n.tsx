import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export const locales = {
  it: { label: 'IT', loader: () => import('@/locales/it/messages') },
  en: { label: 'EN', loader: () => import('@/locales/en/messages') },
}

const defaultLocale = 'it'

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const current = (locale || defaultLocale) as keyof typeof locales
        if (!locales[current]) {
          console.warn(`Locale ${current} not found, using default ${defaultLocale}`)
          const { default: messages } = await locales[defaultLocale].loader()
          i18n.load(defaultLocale, messages)
          i18n.activate(defaultLocale)
        } else {
          const { default: messages } = await locales[current].loader()
          i18n.load(current, messages)
          i18n.activate(current)
        }
        setReady(true)
      } catch (error) {
        console.error('Error loading locale:', error)
        // Fallback to default locale
        try {
          const { default: messages } = await locales[defaultLocale].loader()
          i18n.load(defaultLocale, messages)
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
