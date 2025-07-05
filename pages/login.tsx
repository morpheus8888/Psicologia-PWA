import { useState, useEffect } from 'react'
import { Trans } from '@lingui/react'
import Page from '@/components/page'

export default function Login() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'login' | 'register'>('login')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > window.innerHeight / 3) {
        setOpen(true)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('scroll', onScroll)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('token', data.token)
      setMessage('Logged in')
    } else {
      setMessage(data.error || 'Error')
    }
  }

  const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (res.ok) setMessage('Registered successfully')
    else setMessage(data.error || 'Error')
  }

  return (
    <Page>
      <div className='scroll-down'>SCROLL DOWN
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
          <path d='M16 3C8.832031 3 3 8.832031 3 16s5.832031 13 13 13 13-5.832031 13-13S23.167969 3 16 3zm0 2c6.085938 0 11 4.914063 11 11 0 6.085938-4.914062 11-11 11-6.085937 0-11-4.914062-11-11C5 9.914063 9.914063 5 16 5zm-1 4v10.28125l-4-4-1.40625 1.4375L16 23.125l6.40625-6.40625L21 15.28125l-4 4V9z'/>
        </svg>
      </div>
      <div className='container-login'></div>
      <div className={`modal-login${open ? ' is-open' : ''}`}>
        <div className='modal-login-container'>
          <div className='modal-login-left'>
            <h1 className='modal-login-title'>
              <Trans id={view === 'login' ? 'Welcome Back!' : 'Create Account'} />
            </h1>
            <p className='modal-login-desc'>
              <Trans id={view === 'login' ? 'To keep connected with us please login with your personal info' : 'Enter your personal details and start journey with us'} />
            </p>
            <form onSubmit={view === 'login' ? onLogin : onRegister}>
              <div className='input-block'>
                <label className='input-label' htmlFor='email'>
                  <Trans id='Email' />
                </label>
                <input type='email' id='email' name='email' placeholder='Email' required />
              </div>
              <div className='input-block'>
                <label className='input-label' htmlFor='password'>
                  <Trans id='Password' />
                </label>
                <input type='password' id='password' name='password' placeholder='Password' required />
              </div>
              <div className='modal-login-buttons'>
                {view === 'login' && (
                  <a href='#' onClick={() => setView('register')}>
                    <Trans id='Sign Up' />
                  </a>
                )}
                {view === 'register' && (
                  <a href='#' onClick={() => setView('login')}>
                    <Trans id='Sign in' />
                  </a>
                )}
                <button type='submit' className='input-button'>
                  <Trans id={view === 'login' ? 'Sign In' : 'Sign Up'} />
                </button>
              </div>
            </form>
            {message && <p>{message}</p>}
          </div>
          <div className='modal-login-right'>
            <img src='https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=dfd2ec5a01006fd8c4d7592a381d3776&auto=format&fit=crop&w=1000&q=80' alt='' />
          </div>
          <button className='icon-button close-button' onClick={() => setOpen(false)}>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'>
              <path d='M 25 3 C 12.86158 3 3 12.86158 3 25 C 3 37.13842 12.86158 47 25 47 C 37.13842 47 47 37.13842 47 25 C 47 12.86158 37.13842 3 25 3 z M 25 5 C 36.05754 5 45 13.94246 45 25 C 45 36.05754 36.05754 45 25 45 C 13.94246 45 5 36.05754 5 25 C 5 13.94246 13.94246 5 25 5 z M 16.990234 15.990234 A 1.0001 1.0001 0 0 0 16.292969 17.707031 L 23.585938 25 L 16.292969 32.292969 A 1.0001 1.0001 0 1 0 17.707031 33.707031 L 25 26.414062 L 32.292969 33.707031 A 1.0001 1.0001 0 1 0 33.707031 32.292969 L 26.414062 25 L 33.707031 17.707031 A 1.0001 1.0001 0 0 0 32.980469 15.990234 A 1.0001 1.0001 0 0 0 32.292969 16.292969 L 25 23.585938 L 17.707031 16.292969 A 1.0001 1.0001 0 0 0 16.990234 15.990234 z'></path>
            </svg>
          </button>
        </div>
        <button className='modal-login-button' onClick={() => setOpen(true)}>
          <Trans id='Login' />
        </button>
      </div>
    </Page>
  )
}
