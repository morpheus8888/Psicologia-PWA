import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react'
import { useRouter } from 'next/router'

import enMessages from '@/locales/en/messages'
import itMessages from '@/locales/it/messages'

export type Locale = 'en' | 'it'

type Messages = Record<string, string>

type Dictionaries = Record<Locale, Messages>

type TranslateOptions = {
  values?: Record<string, unknown>
  components?: ReactNode[]
}

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (id: string, options?: TranslateOptions) => ReactNode
}

const dictionaries: Dictionaries = {
  en: enMessages,
  it: itMessages,
}

export const locales = {
  it: { label: 'IT', name: 'Italiano' },
  en: { label: 'EN', name: 'English' },
} as const

const defaultLocale: Locale = 'it'

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

const pluralRegex = /\{(\w+),\s*plural,\s*([^}]+\})\s*\}/g
const optionRegex = /(zero|one|two|few|many|other)\s*\{([^}]*)\}/g
const placeholderRegex = /\{(\w+)\}/g
const componentTagRegex = /<\/?(\d+)>/g

type ComponentNode = {
  index: number
  children: Array<ComponentNode | string>
}

type ParserNode = {
  children: Array<ComponentNode | string>
}

function applyPlurals(message: string, values?: Record<string, unknown>) {
  return message.replace(pluralRegex, (_, key: string, body: string) => {
    const rawCount = values?.[key]
    const count = typeof rawCount === 'number' ? rawCount : Number(rawCount) || 0
    const options: Record<string, string> = {}
    let match: RegExpExecArray | null
    while ((match = optionRegex.exec(body)) !== null) {
      options[match[1]] = match[2]
    }
    let selected = options.other ?? ''
    if (count === 0 && options.zero) selected = options.zero
    else if (count === 1 && options.one) selected = options.one
    else if (count === 2 && options.two) selected = options.two
    else if (count > 1 && options.many) selected = options.many
    selected = selected.replace(/#/g, String(count))
    return selected
  })
}

function applyPlaceholders(message: string, values?: Record<string, unknown>) {
  if (!values) return message
  return message.replace(placeholderRegex, (_, key: string) => {
    const value = values[key]
    if (value === undefined || value === null) return ''
    return String(value)
  })
}

function parseComponentStructure(input: string, components: ReactNode[]): Array<ComponentNode | string> {
  if (!components.length || !componentTagRegex.test(input)) {
    return [input]
  }

  componentTagRegex.lastIndex = 0
  const root: ParserNode = { children: [] }
  const stack: Array<ParserNode | ComponentNode> = [root]
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = componentTagRegex.exec(input)) !== null) {
    const [tag, idxStr] = match
    const index = Number(idxStr)
    const isClosing = tag.startsWith('</')
    const text = input.slice(lastIndex, match.index)
    if (text) {
      const current = stack[stack.length - 1]
      current.children.push(text)
    }
    if (isClosing) {
      const node = stack.pop()
      if (!node || ('index' in node && node.index !== index)) {
        return [input]
      }
      if (stack.length === 0) {
        return [input]
      }
    } else {
      const newNode: ComponentNode = { index, children: [] }
      const current = stack[stack.length - 1]
      current.children.push(newNode)
      stack.push(newNode)
    }
    lastIndex = componentTagRegex.lastIndex
  }

  if (lastIndex < input.length) {
    const current = stack[stack.length - 1]
    current.children.push(input.slice(lastIndex))
  }

  if (stack.length !== 1) {
    return [input]
  }

  return root.children
}

function renderNode(node: ComponentNode | string, components: ReactNode[], key: number): ReactNode {
  if (typeof node === 'string') {
    return node
  }

  const component = components[node.index]
  const children = node.children.map((child, childIndex) => renderNode(child, components, childIndex))

  if (!component || !React.isValidElement(component)) {
    return <React.Fragment key={key}>{children}</React.Fragment>
  }

  return React.cloneElement(component, { ...component.props, key }, ...children)
}

function renderNodes(nodes: Array<ComponentNode | string>, components: ReactNode[]): ReactNode {
  const rendered = nodes.map((node, index) => renderNode(node, components, index))
  if (rendered.length === 1) {
    return rendered[0]
  }
  return rendered
}

function translate(locale: Locale, id: string, options?: TranslateOptions): ReactNode {
  const dictionary = dictionaries[locale] ?? dictionaries[defaultLocale]
  const raw = dictionary[id] ?? id
  const withPlural = applyPlurals(raw, options?.values)
  const withPlaceholders = applyPlaceholders(withPlural, options?.values)
  if (!options?.components || options.components.length === 0) {
    return withPlaceholders
  }
  const nodes = parseComponentStructure(withPlaceholders, options.components)
  return renderNodes(nodes, options.components)
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(
    (router.locale as Locale) || (router.defaultLocale as Locale) || defaultLocale
  )

  useEffect(() => {
    const nextLocale = (router.locale as Locale) || (router.defaultLocale as Locale) || defaultLocale
    setLocaleState(nextLocale)
  }, [router.locale, router.defaultLocale])

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next)
      if (typeof window !== 'undefined') {
        router.push(router.pathname, router.asPath, { locale: next })
      }
    },
    [router]
  )

  const t = useCallback(
    (id: string, options?: TranslateOptions) => translate(locale, id, options),
    [locale]
  )

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}

export const useLingui = () => {
  const { locale, setLocale, t } = useI18n()
  const i18nApi = useMemo(
    () => ({
      locale,
      _: (id: string, values?: Record<string, unknown>) => t(id, { values }),
    }),
    [locale, t]
  )

  return { i18n: i18nApi, locale, setLocale }
}

type TransProps = {
  id: string
  components?: ReactNode[]
  values?: Record<string, unknown>
}

export const Trans = ({ id, components = [], values }: TransProps) => {
  const { locale } = useI18n()
  const content = translate(locale, id, { components, values })
  return <>{content}</>
}

export default I18nProvider
