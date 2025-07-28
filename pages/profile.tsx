import Page from '@/components/page'
import Section from '@/components/section'
import UserAvatar from '@/components/user-avatar'
import NicknameSelector from '@/components/nickname-selector'
import { Trans } from '@lingui/react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/router'

const Profile = () => {
  const { user, token, isLoggedIn, updateUser } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState('leone')
  const [saving, setSaving] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [phoneValue, setPhoneValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    // Redirect se non loggato
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    if (user) {
      setSelectedAnimal(user.avatar)
      setPhoneValue(user.phone || '')
      setEmailValue(user.email)
    }
  }, [isLoggedIn, user, router])

  const handleSavePhone = async () => {
    setSaving(true)
    
    if (!token) {
      alert('Non sei autenticato')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/user/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone: phoneValue })
      })

      const data = await res.json()
      
      if (res.ok) {
        updateUser(data.user)
        setEditingPhone(false)
        alert('Telefono aggiornato con successo!')
      } else {
        alert(data.error || 'Errore durante l\'aggiornamento')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
    
    setSaving(false)
  }

  const handleSaveEmail = async () => {
    setSaving(true)
    
    if (!token) {
      alert('Non sei autenticato')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/user/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: emailValue })
      })

      const data = await res.json()
      
      if (res.ok) {
        updateUser(data.user)
        setEditingEmail(false)
        alert('Email aggiornata con successo!')
      } else {
        alert(data.error || 'Errore durante l\'aggiornamento')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
    
    setSaving(false)
  }

  const handleSavePassword = async () => {
    setSaving(true)
    
    if (!token) {
      alert('Non sei autenticato')
      setSaving(false)
      return
    }

    if (newPassword !== confirmPassword) {
      alert('Le nuove password non coincidono')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword, 
          confirmPassword 
        })
      })

      const data = await res.json()
      
      if (res.ok) {
        setEditingPassword(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        alert('Password aggiornata con successo!')
      } else {
        alert(data.error || 'Errore durante l\'aggiornamento')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
    
    setSaving(false)
  }

  const handleSaveAvatar = async () => {
    setSaving(true)
    
    if (!token) {
      alert('Non sei autenticato')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/user/update-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar: selectedAnimal })
      })

      const data = await res.json()
      
      if (res.ok) {
        updateUser(data.user)
        setIsEditing(false)
        alert('Avatar aggiornato con successo!')
      } else {
        alert(data.error || 'Errore durante l\'aggiornamento')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
    
    setSaving(false)
  }

  if (!isLoggedIn || !user) {
    return (
      <Page title='Profile'>
        <Section>
          <div className="text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              Caricamento...
            </p>
          </div>
        </Section>
      </Page>
    )
  }

  return (
    <Page title='Profile'>
      <Section>
        <div className="flex items-center gap-4 mb-6">
          <UserAvatar animal={user.avatar} size="lg" />
          <div className="flex-1">
            <h2 className='text-xl font-semibold text-zinc-800 dark:text-zinc-200'>
              <Trans id='My profile' />
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2">
              {user.email}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Avatar: <Trans id={user.avatar} />
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {isEditing ? <Trans id="Annulla" /> : <Trans id="Modifica Avatar" />}
          </button>
        </div>

        {isEditing && (
          <div className="mb-6 border rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800">
            <NicknameSelector 
              selectedAnimal={selectedAnimal}
              onAnimalSelect={setSelectedAnimal}
              className="mb-4"
            />
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleSaveAvatar}
                disabled={saving}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {saving ? <Trans id="Salvando..." /> : <Trans id="Salva Avatar" />}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setSelectedAnimal(user.avatar)
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Trans id="Annulla" />
              </button>
            </div>
          </div>
        )}

        {/* Phone Editor */}
        <div className="mb-6 border rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                <Trans id="Phone" />
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {user.phone || 'Non impostato'}
              </p>
            </div>
            <button
              onClick={() => setEditingPhone(!editingPhone)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {editingPhone ? <Trans id="Annulla" /> : <Trans id="Edit Phone" />}
            </button>
          </div>
          
          {editingPhone && (
            <div className="space-y-4">
              <input
                type="tel"
                value={phoneValue}
                onChange={(e) => setPhoneValue(e.target.value)}
                placeholder="+39 123 456 7890"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSavePhone}
                  disabled={saving}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Trans id="Salvando..." /> : <Trans id="Save Phone" />}
                </button>
                <button
                  onClick={() => {
                    setEditingPhone(false)
                    setPhoneValue(user.phone || '')
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Trans id="Annulla" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Email Editor */}
        <div className="mb-6 border rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                <Trans id="Email" />
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {user.email}
              </p>
            </div>
            <button
              onClick={() => setEditingEmail(!editingEmail)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {editingEmail ? <Trans id="Annulla" /> : <Trans id="Edit Email" />}
            </button>
          </div>
          
          {editingEmail && (
            <div className="space-y-4">
              <input
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSaveEmail}
                  disabled={saving}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Trans id="Salvando..." /> : <Trans id="Save Email" />}
                </button>
                <button
                  onClick={() => {
                    setEditingEmail(false)
                    setEmailValue(user.email)
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Trans id="Annulla" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Password Editor */}
        <div className="mb-6 border rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                <Trans id="Password" />
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                ••••••••
              </p>
            </div>
            <button
              onClick={() => setEditingPassword(!editingPassword)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {editingPassword ? <Trans id="Annulla" /> : <Trans id="Edit Password" />}
            </button>
          </div>
          
          {editingPassword && (
            <div className="space-y-4">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Password attuale"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nuova password"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Conferma nuova password"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSavePassword}
                  disabled={saving}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Trans id="Salvando..." /> : <Trans id="Save Password" />}
                </button>
                <button
                  onClick={() => {
                    setEditingPassword(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Trans id="Annulla" />
                </button>
              </div>
            </div>
          )}
        </div>

      </Section>
    </Page>
  )
}

export default Profile
