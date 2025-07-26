import { useState } from 'react'
import Link from 'next/link'
import { useLingui, Trans } from '@lingui/react'
import LanguageToggle from '@/components/language-toggle'
import ThemeToggle from '@/components/theme-toggle'
import { useAuth } from '@/lib/auth-context'
import UserAvatar from '@/components/user-avatar'

const iconClass = 'mr-2 h-4 w-4 opacity-70 group-hover:opacity-100'

const ProfileMenu = () => {
  const [open, setOpen] = useState(false)
  const { user, isLoggedIn, logout: authLogout } = useAuth()
  const { i18n } = useLingui()

  const toggle = () => setOpen((o) => !o)
  const handleLogout = () => {
    authLogout()
    setOpen(false)
  }


  return (
    <div className='relative'>
      <button
        onClick={toggle}
        className={`relative h-10 w-10 overflow-hidden rounded-full border border-zinc-300 dark:border-zinc-700 ${
          isLoggedIn ? '' : 'bg-zinc-400'
        }`}
        aria-label={i18n._('My profile')}
      >
        {isLoggedIn && user ? (
          <UserAvatar animal={user.avatar} size="sm" className="w-full h-full border-0 rounded-full" />
        ) : (
          <div className="w-full h-full bg-zinc-400 flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-48 rounded-lg bg-white p-2 shadow-lg dark:bg-zinc-800 z-[250]'>
          <ul className='text-sm text-zinc-600 dark:text-zinc-300'>
            {isLoggedIn ? (
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
                  <Link href='/diary' className='group flex items-center rounded px-2 py-1 hover:text-indigo-500'>
                    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                      <path d='M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' stroke='currentColor' />
                    </svg>
                    <Trans id='Diary' />
                  </Link>
                </li>
                <li>
                  <Link href='/messages' className='group flex items-center rounded px-2 py-1 hover:text-indigo-500'>
                    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                      <path d='M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' stroke='currentColor' />
                    </svg>
                    <Trans id='Messages' />
                  </Link>
                </li>
                {user?.isAdmin && (
                  <li>
                    <Link href='/admin' className='group flex items-center rounded px-2 py-1 hover:text-indigo-500'>
                      <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                        <path d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' stroke='currentColor' />
                      </svg>
                      <Trans id='Admin Panel' />
                    </Link>
                  </li>
                  <li>
                    <Link href='/admin/create-dictionary' className='group flex items-center rounded px-2 py-1 hover:text-indigo-500'>
                      <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={iconClass}>
                        <path d='M12 4v16m8-8H4' stroke='currentColor'/>
                      </svg>
                      <Trans id='Create Dictionary' />
                    </Link>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout} className='group flex w-full items-center rounded px-2 py-1 hover:text-indigo-500'>
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
                <Link
                  href='/login'
                  onClick={() => setOpen(false)}
                  className='group flex items-center rounded px-2 py-1 hover:text-indigo-500'
                >
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className={iconClass}
                  >
                    <path d='M8 7l-5 5m0 0l5 5m-5-5h12' stroke='currentColor' />
                    <path d='M16 4h2a2 2 0 012 2v12a2 2 0 01-2 2h-2' stroke='currentColor' />
                  </svg>
                  <Trans id='Login' />
                </Link>
              </li>
            )}
            <li className='border-t border-zinc-200 pt-2 dark:border-zinc-700'>
              <LanguageToggle onChange={() => setOpen(false)} />
            </li>
            <li className='mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-700'>
              <ThemeToggle onChange={() => setOpen(false)} />
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu
