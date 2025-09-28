import type { ComponentProps } from 'react'
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
import { setupI18n, type I18n } from '@lingui/core'
import {
  I18nProvider as LinguiProvider,
  Trans as LinguiTrans,
  useLingui as useLinguiBase,
} from '@lingui/react'
import { messages as enCatalog, type MessageKey } from '@/locales/en/messages'
import { messages as itCatalog } from '@/locales/it/messages'

const localeDescriptors = {
  it: { label: 'IT', name: 'Italiano' },
  en: { label: 'EN', name: 'English' },
} as const

export type Locale = keyof typeof localeDescriptors
export const locales = localeDescriptors

const defaultLocale: Locale = 'it'

type Catalog = Record<MessageKey, string>

const catalogs: Record<Locale, Catalog> = {
  en: enCatalog,
  it: itCatalog,
}

const createI18n = () => {
  const instance = setupI18n({ locale: defaultLocale })
  ;(Object.entries(catalogs) as Array<[Locale, Catalog]>).forEach(([locale, catalog]) => {
    instance.load(locale, catalog)
  })
  instance.activate(defaultLocale)
  return instance
}

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => Promise<void>
  loading: boolean
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

const normalizeLocale = (candidate: string | string[] | undefined, fallback: Locale): Locale => {
  const value = Array.isArray(candidate) ? candidate[0] : candidate
  return (value && value in localeDescriptors ? value : fallback) as Locale
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const i18nInstance = useMemo(() => createI18n(), [])

  const activeLocale = useMemo(
    () => normalizeLocale(router.locale, normalizeLocale(router.defaultLocale, defaultLocale)),
    [router.locale, router.defaultLocale]
  )

  useEffect(() => {
    if (i18nInstance.locale !== activeLocale) {
      i18nInstance.activate(activeLocale)
    }
  }, [activeLocale, i18nInstance])

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
      <LinguiProvider i18n={i18nInstance}>{children}</LinguiProvider>
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

export { useLinguiBase as useLingui }

export type MessageDescriptor<Id extends MessageKey = MessageKey> = {
  id: Id
  defaultMessage?: string
  comment?: string
}

export const defineMessage = <Id extends MessageKey>(
  input: MessageDescriptor<Id> | Id
): MessageDescriptor<Id> => (typeof input === 'string' ? { id: input } : input)

export type MessageInput<Id extends MessageKey = MessageKey> = Id | MessageDescriptor<Id>

type TranslationValues = Record<string, unknown>

export const formatMessage = <Id extends MessageKey>(
  i18nInstance: I18n,
  input: MessageInput<Id>,
  values?: TranslationValues
) => {
  const id = typeof input === 'string' ? input : input.id
  return i18nInstance._(id, values)
}

export const useTranslations = () => {
  const { i18n } = useLinguiBase()
  const translate = useCallback(
    <Id extends MessageKey>(input: MessageInput<Id>, values?: TranslationValues) =>
      formatMessage(i18n, input, values),
    [i18n]
  )

  return { i18n, t: translate }
}

type LinguiTransProps = ComponentProps<typeof LinguiTrans>
type TransProps<Id extends MessageKey> = Omit<LinguiTransProps, 'id'> & { id: Id }

export const Trans = <Id extends MessageKey>(props: TransProps<Id>) => (
  <LinguiTrans {...(props as LinguiTransProps)} />
)
