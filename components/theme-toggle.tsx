import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Trans } from '@lingui/react'

interface Props {
  onChange?: () => void
}

const ThemeToggle = ({ onChange }: Props) => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  const isDark = resolvedTheme === 'dark'

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark')
    onChange?.()
  }

  return (
    <div className='flex justify-center'>
      <div className='switch'>
        <input
          id='theme-toggle'
          type='checkbox'
          className='check-toggle check-toggle-round-flat'
          checked={isDark}
          onChange={toggle}
        />
        <label htmlFor='theme-toggle'></label>
        <span className='on flex items-center justify-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='h-4 w-4'
          >
            <path
              d='M12 18a6 6 0 100-12 6 6 0 000 12z'
              stroke='currentColor'
              strokeWidth='2'
            />
            <path
              d='M12 2v2m0 16v2m10-10h-2M4 12H2m15.536-6.536l-1.414 1.414M6.464 17.536l-1.414 1.414m0-13.95l1.414 1.414m11.122 11.122l1.414 1.414'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
          <span className='sr-only'>
            <Trans id='Light mode' />
          </span>
        </span>
        <span className='off flex items-center justify-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='h-4 w-4'
          >
            <path
              d='M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <span className='sr-only'>
            <Trans id='Dark mode' />
          </span>
        </span>
      </div>
    </div>
  )
}

export default ThemeToggle
