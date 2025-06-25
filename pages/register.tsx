import { useState } from 'react'

export default function Register() {
  const [message, setMessage] = useState('')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className='p-4'>
      <h1>Register</h1>
      <form onSubmit={onSubmit} className='flex flex-col gap-2 max-w-sm'>
        <input type='email' name='email' placeholder='Email' required />
        <input type='password' name='password' placeholder='Password' required />
        <button type='submit' className='btn'>Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
