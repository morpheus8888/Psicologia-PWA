import Page from '@/components/page'
import Head from 'next/head'
import { Trans } from '@lingui/react'
import { useEffect, useState } from 'react'

const Login = () => {
  const [active, setActive] = useState<'signIn' | 'signUp'>('signIn')

  const register = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const name = (form.elements.namedItem('name') as HTMLInputElement).value
    await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => null)
        if (!r.ok) throw new Error(data?.error || r.statusText)
        setActive('signIn')
      })
      .catch((err) => {
        console.error(err)
        alert(err.message)
      })
  }

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => null)
        if (!r.ok) throw new Error(data?.error || r.statusText)
        alert('Logged in')
      })
      .catch((err) => {
        console.error(err)
        alert(err.message)
      })
  }
  useEffect(() => {
    document.body.classList.add('login-page')
    return () => {
      document.body.classList.remove('login-page')
    }
  }, [])

  return (
    <Page title='Login'>
      <Head>
        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
        />
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css?family=Montserrat:400,800'
        />
      </Head>
      <div className='flex flex-col items-center'>
        <div
          id='container'
          className={`container ${
            active === 'signUp' ? 'right-panel-active mobile-signup' : 'mobile-signin'
          }`}
        >
          <div className='form-container sign-up-container'>
            <form onSubmit={register}>
              <h1>
                <Trans id='Create Account' />
              </h1>
              <div className='social-container'>
                <a href='#' className='social'>
                  <i className='fab fa-facebook-f'></i>
                </a>
                <a href='#' className='social'>
                  <i className='fab fa-google-plus-g'></i>
                </a>
                <a href='#' className='social'>
                  <i className='fab fa-linkedin-in'></i>
                </a>
              </div>
              <span>
                <Trans id='or use your email for registration' />
              </span>
              <input name='name' type='text' placeholder='Name' />
              <input name='email' type='email' placeholder='Email' />
              <input name='password' type='password' placeholder='Password' />
              <button>
                <Trans id='Sign Up' />
              </button>
              <button
                type='button'
                className='ghost mt-4 sm:hidden'
                onClick={() => setActive('signIn')}
              >
                <Trans id='Sign In' />
              </button>
            </form>
          </div>
          <div className='form-container sign-in-container'>
            <form onSubmit={login}>
              <h1>
                <Trans id='Sign in' />
              </h1>
              <div className='social-container'>
                <a href='#' className='social'>
                  <i className='fab fa-facebook-f'></i>
                </a>
                <a href='#' className='social'>
                  <i className='fab fa-google-plus-g'></i>
                </a>
                <a href='#' className='social'>
                  <i className='fab fa-linkedin-in'></i>
                </a>
              </div>
              <span>
                <Trans id='or use your account' />
              </span>
              <input name='email' type='email' placeholder='Email' />
              <input name='password' type='password' placeholder='Password' />
              <a href='#'>
                <Trans id='Forgot your password?' />
              </a>
              <button>
                <Trans id='Sign In' />
              </button>
              <button
                type='button'
                className='ghost mt-4 sm:hidden'
                onClick={() => setActive('signUp')}
              >
                <Trans id='Sign Up' />
              </button>
            </form>
          </div>
          <div className='overlay-container'>
            <div className='overlay'>
              <div className='overlay-panel overlay-left'>
                <h1>
                  <Trans id='Welcome Back!' />
                </h1>
                <p>
                  <Trans id='To keep connected with us please login with your personal info' />
                </p>
                <button className='ghost' id='signIn' onClick={() => setActive('signIn')}>
                  <Trans id='Sign In' />
                </button>
              </div>
              <div className='overlay-panel overlay-right'>
                <h1>
                  <Trans id='Hello, Friend!' />
                </h1>
                <p>
                  <Trans id='Enter your personal details and start journey with us' />
                </p>
                <button className='ghost' id='signUp' onClick={() => setActive('signUp')}>
                  <Trans id='Sign Up' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Login
