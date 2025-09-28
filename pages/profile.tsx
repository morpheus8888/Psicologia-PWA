import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { Trans, useTranslations } from '@/lib/i18n'

import Page from '@/components/page'
import Section from '@/components/section'
import UserAvatar from '@/components/user-avatar'
import NicknameSelector from '@/components/nickname-selector'
import { useAuth, DiaryVisibility } from '@/lib/auth-context'

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
] as const

const DiaryVisibilityOptions: Array<{ value: DiaryVisibility; label: string; description: string }> = [
  { value: 'PRIVATE', label: 'Only me', description: 'Diary entries stay encrypted and are accessible only to you.' },
  { value: 'PUBLIC', label: 'Everyone', description: 'Entries marked public can be viewed by administrators and appear in compliance reporting.' },
  { value: 'PROFESSIONALS', label: 'Professionals only', description: 'Licensed professionals attached to your account can review your diary.' },
]

const Profile = () => {
  const { user, token, isLoggedIn, updateUser } = useAuth()
  const router = useRouter()
  const { t } = useTranslations()

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('profile')

  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState('leone')
  const [savingAvatar, setSavingAvatar] = useState(false)

  const [editingPhone, setEditingPhone] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)

  const [phoneValue, setPhoneValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [diaryVisibility, setDiaryVisibility] = useState<DiaryVisibility>('PRIVATE')
  const [updatingVisibility, setUpdatingVisibility] = useState(false)

  const [currentDiaryPassword, setCurrentDiaryPassword] = useState('')
  const [newDiaryPassword, setNewDiaryPassword] = useState('')
  const [confirmDiaryPassword, setConfirmDiaryPassword] = useState('')
  const [updatingDiaryPassword, setUpdatingDiaryPassword] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    if (user) {
      setSelectedAnimal(user.avatar)
      setPhoneValue(user.phone || '')
      setEmailValue(user.email)
      setDiaryVisibility(user.diaryVisibility)
    }
  }, [isLoggedIn, user, router])

  useEffect(() => {
    if (!router.isReady) return
    const tab = router.query.tab
    if (typeof tab === 'string') {
      const found = tabs.find((item) => item.id === tab)
      if (found) {
        setActiveTab(found.id)
      }
    }
  }, [router.isReady, router.query.tab])

  const handleTabChange = useCallback(
    (tabId: (typeof tabs)[number]['id']) => {
      setActiveTab(tabId)
      const nextQuery = { ...router.query }
      if (tabId === 'profile') {
        delete nextQuery.tab
      } else {
        nextQuery.tab = tabId
      }
      void router.replace(
        { pathname: router.pathname, query: nextQuery },
        undefined,
        { shallow: true, scroll: false }
      )
    },
    [router]
  )

  const handleSaveAvatar = async () => {
    if (!token) return
    setSavingAvatar(true)
    try {
      const res = await fetch('/api/user/update-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: selectedAnimal }),
      })

      const data = await res.json()
      if (res.ok) {
        updateUser(data.user)
        setIsEditingAvatar(false)
        alert(t('Avatar updated successfully!'))
      } else {
        alert(data.error || 'Errore durante l\'aggiornamento')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
    setSavingAvatar(false)
  }

  const handleSavePhone = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/user/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: phoneValue }),
      })
      const data = await res.json()
      if (res.ok) {
        updateUser(data.user)
        setEditingPhone(false)
        alert(t('Phone updated successfully'))
      } else {
        alert(data.error || 'Errore durante l\'aggiornamento del telefono')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
  }

  const handleSaveEmail = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/user/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: emailValue }),
      })
      const data = await res.json()
      if (res.ok) {
        updateUser(data.user)
        setEditingEmail(false)
        alert(t('Email updated successfully'))
      } else {
        alert(data.error || 'Errore durante l\'aggiornamento dell\'email')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
  }

  const handleSavePassword = async () => {
    if (!token) return
    if (newPassword !== confirmPassword) {
      alert(t('Passwords do not match'))
      return
    }
    if (newPassword.length < 6) {
      alert(t('Password must be at least 6 characters'))
      return
    }

    try {
      const res = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setEditingPassword(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        alert(t('Password updated successfully'))
      } else {
        alert(data.error || 'Errore durante l\'aggiornamento della password')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
  }

  const handleUpdateVisibility = async (visibility: DiaryVisibility) => {
    if (!token) return
    setUpdatingVisibility(true)
    setDiaryVisibility(visibility)
    try {
      const res = await fetch('/api/user/update-visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ visibility }),
      })
      const data = await res.json()
      if (res.ok) {
        updateUser(data.user)
      } else {
        alert(data.error || 'Errore durante l\'aggiornamento della visibilità')
        setDiaryVisibility(user?.diaryVisibility ?? 'PRIVATE')
      }
    } catch (error) {
      alert('Errore di connessione')
      setDiaryVisibility(user?.diaryVisibility ?? 'PRIVATE')
    }
    setUpdatingVisibility(false)
  }

  const handleUpdateDiaryPassword = async () => {
    if (!token) return
    if (newDiaryPassword !== confirmDiaryPassword) {
      alert(t('Passwords do not match'))
      return
    }
    if (newDiaryPassword.length < 8) {
      alert(t('Diary password must be at least 8 characters'))
      return
    }
    setUpdatingDiaryPassword(true)
    try {
      const res = await fetch('/api/user/update-diary-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: currentDiaryPassword, newPassword: newDiaryPassword, confirmPassword: confirmDiaryPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        updateUser(data.user)
        setCurrentDiaryPassword('')
        setNewDiaryPassword('')
        setConfirmDiaryPassword('')
        alert(t('Diary password updated successfully'))
      } else {
        alert(data.error || 'Errore durante l\'aggiornamento della password del diario')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
    setUpdatingDiaryPassword(false)
  }

  if (!isLoggedIn || !user) {
    return (
      <Page title='Profile'>
        <Section>
          <div className='text-center'>
            <p className='text-zinc-600 dark:text-zinc-400'>Caricamento...</p>
          </div>
        </Section>
      </Page>
    )
  }

  return (
    <Page title='Profile'>
      <Section>
        <div className='flex justify-between items-center border-b border-zinc-200 pb-4 dark:border-zinc-700'>
          <h1 className='text-2xl font-semibold text-zinc-800 dark:text-zinc-100'>
            <Trans id='My profile' />
          </h1>
          <div className='flex gap-2 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow dark:bg-zinc-700 dark:text-indigo-300'
                    : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                <Trans id={tab.label} />
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'profile' && (
          <div className='mt-6 space-y-6'>
            <div className='flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800'>
              <UserAvatar animal={user.avatar} size='lg' />
              <div className='flex-1'>
                <p className='text-lg font-medium text-zinc-900 dark:text-zinc-100'>{user.email}</p>
                <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                  <Trans id='Avatar' />: <Trans id={user.avatar} />
                </p>
              </div>
              <button
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                className='rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
              >
                {isEditingAvatar ? <Trans id='Cancel' /> : <Trans id='Edit Avatar' />}
              </button>
            </div>

            {isEditingAvatar && (
              <div className='rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800'>
                <NicknameSelector selectedAnimal={selectedAnimal} onAnimalSelect={setSelectedAnimal} className='mb-4' />
                <div className='flex justify-end gap-2'>
                  <button
                    onClick={() => {
                      setIsEditingAvatar(false)
                      setSelectedAnimal(user.avatar)
                    }}
                    className='rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-300'
                  >
                    <Trans id='Cancel' />
                  </button>
                  <button
                    onClick={handleSaveAvatar}
                    disabled={savingAvatar}
                    className='rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:opacity-50'
                  >
                    {savingAvatar ? <Trans id='Saving...' /> : <Trans id='Save Avatar' />}
                  </button>
                </div>
              </div>
            )}

            <div className='grid gap-6 md:grid-cols-2'>
              <div className='rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
                      <Trans id='Phone' />
                    </h3>
                    <p className='text-sm text-zinc-500 dark:text-zinc-400'>{user.phone || t('Not set')}</p>
                  </div>
                  <button
                    onClick={() => setEditingPhone(!editingPhone)}
                    className='rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600'
                  >
                    {editingPhone ? <Trans id='Cancel' /> : <Trans id='Edit Phone' />}
                  </button>
                </div>
                {editingPhone && (
                  <div className='mt-4 space-y-3'>
                    <input
                      type='tel'
                      value={phoneValue}
                      onChange={(event) => setPhoneValue(event.target.value)}
                      className='w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100'
                      placeholder='+39 123 456 7890'
                    />
                    <div className='flex justify-end gap-2'>
                      <button
                        onClick={() => {
                          setEditingPhone(false)
                          setPhoneValue(user.phone || '')
                        }}
                        className='rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-300'
                      >
                        <Trans id='Cancel' />
                      </button>
                      <button
                        onClick={handleSavePhone}
                        className='rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600'
                      >
                        <Trans id='Save Phone' />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className='rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
                      <Trans id='Email' />
                    </h3>
                    <p className='text-sm text-zinc-500 dark:text-zinc-400'>{user.email}</p>
                  </div>
                  <button
                    onClick={() => setEditingEmail(!editingEmail)}
                    className='rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600'
                  >
                    {editingEmail ? <Trans id='Cancel' /> : <Trans id='Edit Email' />}
                  </button>
                </div>
                {editingEmail && (
                  <div className='mt-4 space-y-3'>
                    <input
                      type='email'
                      value={emailValue}
                      onChange={(event) => setEmailValue(event.target.value)}
                      className='w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100'
                    />
                    <div className='flex justify-end gap-2'>
                      <button
                        onClick={() => {
                          setEditingEmail(false)
                          setEmailValue(user.email)
                        }}
                        className='rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-300'
                      >
                        <Trans id='Cancel' />
                      </button>
                      <button
                        onClick={handleSaveEmail}
                        className='rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600'
                      >
                        <Trans id='Save Email' />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
                    <Trans id='Password' />
                  </h3>
                  <p className='text-sm text-zinc-500 dark:text-zinc-400'>••••••••</p>
                </div>
                <button
                  onClick={() => setEditingPassword(!editingPassword)}
                  className='rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600'
                >
                  {editingPassword ? <Trans id='Cancel' /> : <Trans id='Edit Password' />}
                </button>
              </div>
              {editingPassword && (
                <div className='mt-4 space-y-3'>
                  <input
                    type='password'
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder={t('Current Password')}
                    className='w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100'
                  />
                  <input
                    type='password'
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder={t('New Password')}
                    className='w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100'
                  />
                  <input
                    type='password'
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder={t('Confirm Password')}
                    className='w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100'
                  />
                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={() => {
                        setEditingPassword(false)
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                      className='rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-300'
                    >
                      <Trans id='Cancel' />
                    </button>
                    <button
                      onClick={handleSavePassword}
                      className='rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600'
                    >
                      <Trans id='Save Password' />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className='mt-6 space-y-6'>
            <div className='rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800'>
              <h2 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
                <Trans id='Who can read my diary?' />
              </h2>
              <p className='mt-2 text-sm text-zinc-500 dark:text-zinc-400'>
                <Trans id='Choose who can access your journal entries.' />
              </p>

              <div className='mt-4 space-y-3'>
                {DiaryVisibilityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                      diaryVisibility === option.value
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                        : 'border-zinc-300 dark:border-zinc-600'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <input
                        type='radio'
                        name='diary-visibility'
                        value={option.value}
                        checked={diaryVisibility === option.value}
                        disabled={updatingVisibility}
                        onChange={() => handleUpdateVisibility(option.value)}
                        className='h-4 w-4 text-blue-500 focus:ring-blue-500'
                      />
                      <div>
                        <p className='font-medium text-zinc-700 dark:text-zinc-200'>
                          <Trans id={option.label} />
                        </p>
                        <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                          <Trans id={option.description} />
                        </p>
                      </div>
                    </div>
                    {updatingVisibility && diaryVisibility === option.value && (
                      <span className='text-xs text-blue-500'>
                        <Trans id='Saving preference...' />
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className='rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
                    <Trans id='Diary access password' />
                  </h2>
                  <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                    {user.hasDiaryPassword ? (
                      <Trans id='Your diary is protected. Update the password below if needed.' />
                    ) : (
                      <Trans id='Set a password to unlock, read and write your diary entries.' />
                    )}
                  </p>
                </div>
              </div>

              <div className='mt-4 grid gap-3 md:grid-cols-2'>
                {user.hasDiaryPassword && (
                  <input
                    type='password'
                    value={currentDiaryPassword}
                    onChange={(event) => setCurrentDiaryPassword(event.target.value)}
                    placeholder={t('Current diary password')}
                    className='w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100'
                  />
                )}
                <input
                  type='password'
                  value={newDiaryPassword}
                  onChange={(event) => setNewDiaryPassword(event.target.value)}
                  placeholder={t('New diary password (min 8 characters)')}
                  className='w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100'
                />
                <input
                  type='password'
                  value={confirmDiaryPassword}
                  onChange={(event) => setConfirmDiaryPassword(event.target.value)}
                  placeholder={t('Confirm diary password')}
                  className='w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100'
                />
              </div>
              <div className='mt-4 flex justify-end gap-2'>
                <button
                  onClick={() => {
                    setCurrentDiaryPassword('')
                    setNewDiaryPassword('')
                    setConfirmDiaryPassword('')
                  }}
                  disabled={updatingDiaryPassword}
                  className='rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-300'
                >
                  <Trans id='Cancel' />
                </button>
                <button
                  onClick={handleUpdateDiaryPassword}
                  disabled={updatingDiaryPassword}
                  className='rounded bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-600 disabled:opacity-50'
                >
                  {updatingDiaryPassword ? <Trans id='Saving...' /> : user.hasDiaryPassword ? <Trans id='Update' /> : <Trans id='Set password' />}
                </button>
              </div>
              <p className='mt-3 text-xs text-zinc-500 dark:text-zinc-400'>
                <Trans id='Diary entries are encrypted per account. Keep this password safe: without it you cannot recover past notes.' />
              </p>
            </div>
          </div>
        )}
      </Section>
    </Page>
  )
}

export default Profile
