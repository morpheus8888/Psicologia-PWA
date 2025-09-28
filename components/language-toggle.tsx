import React from 'react'

import { locales, useLocale, Locale } from '@/lib/i18n'

interface Props {
  onChange?: () => void
}

const LanguageToggle = ({ onChange }: Props) => {
  const { locale, setLocale, loading } = useLocale()
  const localeKeys = Object.keys(locales) as Locale[]
  if (localeKeys.length < 2) return null

  const changeLocale = (loc: Locale) => {
    if (loading || loc === locale) return
    void setLocale(loc).then(() => {
      onChange?.()
    })
  }

  if (localeKeys.length === 2) {
    const [locA, locB] = localeKeys
    const isChecked = locale === locB
    return (
      <div className='flex justify-center'>
        <div className='switch switch-lg'>
          <input
            id='language-toggle'
            type='checkbox'
            className='check-toggle check-toggle-round-flat'
            checked={isChecked}
            disabled={loading}
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
          disabled={loading}
        >
          {locales[loc].label}
        </button>
      ))}
    </div>
  )
}

export default LanguageToggle
