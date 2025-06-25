import { locales } from '@/lib/i18n'
import { useRouter } from 'next/router'
import React from 'react'

interface Props {
  onChange?: () => void
}

const LanguageToggle = ({ onChange }: Props) => {
  const router = useRouter()
  const localeKeys = Object.keys(locales)
  if (localeKeys.length < 2) return null
  const current = (router.locale || router.defaultLocale || localeKeys[0]) as keyof typeof locales

  const changeLocale = (loc: string) => {
    router.push(router.pathname, router.asPath, { locale: loc })
    onChange?.()
  }

  if (localeKeys.length === 2) {
    const [locA, locB] = localeKeys as [keyof typeof locales, keyof typeof locales]
    const isChecked = current === locB
    return (
      <div className='flex justify-center'>
        <div className='switch switch-lg'>
          <input
            id='language-toggle'
            type='checkbox'
            className='check-toggle check-toggle-round-flat'
            checked={isChecked}
            onChange={() => changeLocale(isChecked ? locA : locB)}
          />
          <label htmlFor='language-toggle'></label>
          <span className='on'>{locales[locA].label}</span>
          <span className='off'>{locales[locB].label}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-1'>
      {localeKeys.map((loc) => (
        <button
          key={loc}
          onClick={() => changeLocale(loc)}
          className='block w-full rounded px-2 py-1 text-left hover:text-indigo-500'
        >
          {locales[loc as keyof typeof locales].label}
        </button>
      ))}
    </div>
  )
}

export default LanguageToggle
