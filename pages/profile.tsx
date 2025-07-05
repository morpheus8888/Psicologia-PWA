import { useEffect, useState } from 'react'
import Page from '@/components/page'
import Avatar, { AvatarType } from '@/components/avatar'

interface ProfileData {
  email: string
  name: string | null
  description: string | null
  avatar: AvatarType
  color: string
}

export default function Profile() {
  const [data, setData] = useState<ProfileData | null>(null)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/user/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setData)
  }, [])

  if (!data) return <Page title='Profile'></Page>

  return (
    <Page title='Profile'>
      <div className='p-4 flex flex-col items-center space-y-4'>
        <div className='h-24 w-24 rounded-full flex items-center justify-center' style={{ backgroundColor: data.color }}>
          <Avatar type={data.avatar} />
        </div>
        <div className='text-center'>
          <h2 className='text-xl font-semibold'>{data.name || ''}</h2>
          <p className='text-sm text-zinc-600'>{data.email}</p>
          <p className='mt-2'>{data.description}</p>
        </div>
      </div>
    </Page>
  )
}
