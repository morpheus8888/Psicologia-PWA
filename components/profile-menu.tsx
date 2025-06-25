import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { locales } from '@/lib/i18n'
import { useLingui, Trans } from '@lingui/react'
import { useTheme } from 'next-themes'

const iconClass = 'mr-2 h-4 w-4 opacity-70 group-hover:opacity-100'

const ProfileMenu = () => {
  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const { i18n } = useLingui()

  const toggle = () => setOpen((o) => !o)
  const login = () => {
    setLoggedIn(true)
    setOpen(false)
  }
  const logout = () => {
    setLoggedIn(false)
    setOpen(false)
  }

  const changeLocale = (loc: string) => {
    router.push(router.pathname, router.asPath, { locale: loc })
    setOpen(false)
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className='relative'>
      <button
        onClick={toggle}
        className={`relative h-10 w-10 overflow-hidden rounded-full border border-zinc-300 dark:border-zinc-700 ${
          loggedIn ? '' : 'bg-zinc-400'
        }`}
        aria-label={i18n._('My profile')}
      >
        {loggedIn && (
          <img
            src='https://images.unsplash.com/photo-1612480797665-c96d261eae09?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
            alt=''
            className='h-full w-full object-cover'
          />
        )}
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-48 rounded-lg bg-white p-2 shadow-lg dark:bg-zinc-800'>
          <ul className='text-sm text-zinc-600 dark:text-zinc-300'>
            {loggedIn ? (
              <>
                <li>
                  <Link href='/profile' className='group flex items-center rounded px-2 py-1 hover:text-indigo-500'>
                    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                      <path d='M5 20a7 7 0 1114 0H5z' stroke='currentColor' />
                      <circle cx='12' cy='7' r='3' stroke='currentColor' />
                    </svg>
                    <Trans id='My profile' />
                  </Link>
                </li>
                <li>
                  <Link href='/profile/edit' className='group flex items-center rounded px-2 py-1 hover:text-indigo-500'>
                    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                      <path d='M5 20h14M4 16l10-10a2 2 0 112 2L6 18H4v-2z' stroke='currentColor' />
                    </svg>
                    <Trans id='Edit profile' />
                  </Link>
                </li>
                <li>
                  <Link href='/inbox' className='group flex items-center rounded px-2 py-1 hover:text-indigo-500'>
                    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                      <path d='M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' stroke='currentColor' />
                    </svg>
                    <Trans id='Inbox' />
                  </Link>
                </li>
                <li>
                  <Link href='/settings' className='group flex items-center rounded px-2 py-1 hover:text-indigo-500'>
                    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                      <path d='M12 15a3 3 0 100-6 3 3 0 000 6z' stroke='currentColor' />
                      <path d='M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 005 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 005 9.6a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 5a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09A1.65 1.65 0 0015 5a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019 9c0 .7.4 1.3 1 1.51H21a2 2 0 010 4h-.09A1.65 1.65 0 0019 15.4z' stroke='currentColor' />
                    </svg>
                    <Trans id='Settings' />
                  </Link>
                </li>
                <li>
                  <Link href='/help' className='group flex items-center rounded px-2 py-1 hover:text-indigo-500'>
                    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                      <path d='M12 18h.01' stroke='currentColor' />
                      <path d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' stroke='currentColor' />
                      <path d='M9.09 9a3 3 0 115.83 1c-.75 1-1.5 1.5-1.5 2.5v.5' stroke='currentColor' />
                    </svg>
                    <Trans id='Help' />
                  </Link>
                </li>
                <li>
                  <button onClick={logout} className='group flex w-full items-center rounded px-2 py-1 hover:text-indigo-500'>
                    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                      <path d='M16 17l5-5m0 0l-5-5m5 5H9' stroke='currentColor' />
                      <path d='M13 22H5a2 2 0 01-2-2V4a2 2 0 012-2h8' stroke='currentColor' />
                    </svg>
                    <Trans id='Logout' />
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button onClick={login} className='group flex w-full items-center rounded px-2 py-1 hover:text-indigo-500'>
                  <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                    <path d='M8 7l-5 5m0 0l5 5m-5-5h12' stroke='currentColor' />
                    <path d='M16 4h2a2 2 0 012 2v12a2 2 0 01-2 2h-2' stroke='currentColor' />
                  </svg>
                  <Trans id='Login' />
                </button>
              </li>
            )}
            <li className='border-t border-zinc-200 pt-2 dark:border-zinc-700'>
              <span className='mb-1 block px-2 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400'>
                <Trans id='Language' />
              </span>
              {Object.entries(locales).map(([loc, { label }]) => (
                <button
                  key={loc}
                  onClick={() => changeLocale(loc)}
                  className='flex w-full items-center rounded px-2 py-1 text-left hover:text-indigo-500'
                >
                  {label}
                </button>
              ))}
            </li>
            <li className='mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-700'>
              <button onClick={toggleTheme} className='group flex w-full items-center rounded px-2 py-1 hover:text-indigo-500'>
                <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                  <path d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z' stroke='currentColor' />
                </svg>
                {resolvedTheme === 'dark' ? <Trans id='Light mode' /> : <Trans id='Dark mode' />}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu
