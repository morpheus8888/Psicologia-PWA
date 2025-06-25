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
      const current = (locale || defaultLocale) as keyof typeof locales
      const { default: messages } = await locales[current].loader()
      i18n.load(current, messages)
      i18n.activate(current)
      setReady(true)
    }
    load()
  }, [locale])

  if (!ready) return null
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
