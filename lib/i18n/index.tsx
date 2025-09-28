import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/router'
import { i18n, MessageDescriptor } from '@lingui/core'
import { I18nProvider as LinguiProvider } from '@lingui/react'
import { messages as enCatalog } from '@/locales/en/messages'
import { messages as itCatalog } from '@/locales/it/messages'

type Catalog = Record<string, unknown>

const localeDescriptors = {
  it: { label: 'IT', name: 'Italiano' },
  en: { label: 'EN', name: 'English' },
} as const

export type Locale = keyof typeof localeDescriptors
export const locales = localeDescriptors

const defaultLocale: Locale = 'it'

const enPlural = (value: number, ordinal?: boolean) => {
  if (ordinal) {
    const mod10 = value % 10
    const mod100 = value % 100
    if (mod10 === 1 && mod100 !== 11) return 'one'
    if (mod10 === 2 && mod100 !== 12) return 'two'
    if (mod10 === 3 && mod100 !== 13) return 'few'
    return 'other'
  }
  return value === 1 ? 'one' : 'other'
}

const itPlural = (value: number, ordinal?: boolean) => {
  if (ordinal) {
    return 'other'
  }
  return value === 1 ? 'one' : 'other'
}

i18n.loadLocaleData({
  en: { plurals: enPlural },
  it: { plurals: itPlural },
})

const catalogs: Record<Locale, Catalog> = {
  en: enCatalog,
  it: itCatalog,
}

Object.entries(catalogs).forEach(([locale, messages]) => {
  i18n.load(locale as Locale, messages)
})

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => Promise<void>
  loading: boolean
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

function normalizeLocale(candidate: string | string[] | undefined, fallback: Locale): Locale {
  const value = Array.isArray(candidate) ? candidate[0] : candidate
  return (value && value in localeDescriptors ? value : fallback) as Locale
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const activeLocale = useMemo(
    () => normalizeLocale(router.locale, normalizeLocale(router.defaultLocale, defaultLocale)),
    [router.locale, router.defaultLocale]
  )

  if (i18n.locale !== activeLocale) {
    i18n.activate(activeLocale)
  }

  useEffect(() => {
    if (!router.events) return
    const handleFinished = () => setLoading(false)
    router.events.on('routeChangeComplete', handleFinished)
    router.events.on('routeChangeError', handleFinished)
    return () => {
      router.events.off('routeChangeComplete', handleFinished)
      router.events.off('routeChangeError', handleFinished)
    }
  }, [router.events])

  const setLocale = useCallback(
    async (next: Locale) => {
      const target = normalizeLocale(next, defaultLocale)
      if (target === activeLocale) return

      if (typeof document !== 'undefined') {
        document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000`
      }

      const catalog = catalogs[target]
      i18n.load(target, catalog)

      i18n.activate(target)
      setLoading(true)
      await router.push(router.pathname, router.asPath, { locale: target, scroll: false })
    },
    [activeLocale, router]
  )

  const contextValue = useMemo<LocaleContextValue>(
    () => ({
      locale: activeLocale,
      setLocale,
      loading,
    }),
    [activeLocale, loading, setLocale]
  )

  return (
    <LocaleContext.Provider value={contextValue}>
      <LinguiProvider i18n={i18n}>{children}</LinguiProvider>
    </LocaleContext.Provider>
  )
}

export const useLocale = () => {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used inside an I18nProvider')
  }
  return ctx
}

type TranslateValues = Parameters<typeof i18n._>[1]

export const translate = (message: MessageDescriptor | string, values?: TranslateValues) =>
  typeof message === 'string' ? i18n._(message, values) : i18n._(message, values)

export { Trans, useLingui } from '@lingui/react'

export const createMessage = (
  id: string,
  descriptor: Omit<MessageDescriptor, 'id'> = {}
): MessageDescriptor => ({ id, ...descriptor })
