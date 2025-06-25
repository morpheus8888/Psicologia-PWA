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
        <span className='on'>
          <Trans id='Light mode' />
        </span>
        <span className='off'>
          <Trans id='Dark mode' />
        </span>
      </div>
    </div>
  )
}

export default ThemeToggle
