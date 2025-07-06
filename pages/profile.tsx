import { useEffect, useState } from 'react'
import Page from '@/components/page'
import Avatar from '@/components/avatar'

interface UserProfile {
  id: string
  email: string
  name?: string
  description?: string
  avatar?: 'cat' | 'dog'
  color: string
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [password, setPassword] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setProfile(u))
      .catch(() => {})
  }, [])

  const saveProfile = async () => {
    if (!profile) return
    const token = localStorage.getItem('token')
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: profile.name, description: profile.description, avatar: profile.avatar }),
    })
  }

  const changePassword = async () => {
    const token = localStorage.getItem('token')
    await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password }),
    })
    setPassword('')
  }

  if (!profile) return <Page title='Profile'></Page>

  return (
    <Page title='Profile'>
      <div className='max-w-md mx-auto space-y-4'>
        <div className='flex items-center justify-center h-24 w-24 mx-auto rounded-full overflow-hidden'>
          {profile.avatar ? <Avatar type={profile.avatar} animate={false} /> : <div className='w-full h-full' style={{ backgroundColor: profile.color }} />}
        </div>
        <div className='space-y-2'>
          <label className='block text-sm'>Name</label>
          <input className='w-full border px-2 py-1' value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </div>
        <div className='space-y-2'>
          <label className='block text-sm'>Email</label>
          <input className='w-full border px-2 py-1 bg-gray-200' value={profile.email} disabled />
        </div>
        <div className='space-y-2'>
          <label className='block text-sm'>Description</label>
          <textarea className='w-full border px-2 py-1' value={profile.description || ''} onChange={(e) => setProfile({ ...profile, description: e.target.value })} />
        </div>
        <div className='space-y-2'>
          <label className='block text-sm'>Avatar</label>
          <div className='flex space-x-4'>
            <button onClick={() => setProfile({ ...profile, avatar: 'cat' })} className={`h-16 w-16 rounded-full overflow-hidden border ${profile.avatar === 'cat' ? 'ring-2 ring-indigo-500' : ''}`}> <Avatar type='cat' /> </button>
            <button onClick={() => setProfile({ ...profile, avatar: 'dog' })} className={`h-16 w-16 rounded-full overflow-hidden border ${profile.avatar === 'dog' ? 'ring-2 ring-indigo-500' : ''}`}> <Avatar type='dog' /> </button>
          </div>
        </div>
        <button className='px-4 py-2 bg-indigo-500 text-white rounded' onClick={saveProfile}>Save</button>
        <div className='space-y-2 pt-4'>
          <label className='block text-sm'>Change password</label>
          <input type='password' className='w-full border px-2 py-1' value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className='px-4 py-2 bg-indigo-500 text-white rounded' onClick={changePassword}>Update Password</button>
        </div>
      </div>
    </Page>
  )
}
