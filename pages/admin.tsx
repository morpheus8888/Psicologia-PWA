import Page from '@/components/page'
import Section from '@/components/section'
import UserAvatar from '@/components/user-avatar'
import { useLingui, Trans } from '@lingui/react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/router'

type AdminManagedUser = {
  id: string
  email: string
  role: 'ADMIN' | 'PROFESSIONAL' | 'CLIENT'
  diaryVisibility: 'PRIVATE' | 'PROFESSIONALS' | 'PUBLIC'
  avatar: string | null
  nickname: string | null
  phone: string | null
  createdAt: string
  isAdmin: boolean
}

const AdminPanel = () => {
  const { user, token, isLoggedIn } = useAuth()
  const router = useRouter()
  const { i18n } = useLingui()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [users, setUsers] = useState<AdminManagedUser[]>([])
  const [showUserList, setShowUserList] = useState(false)
  const [diaryCache, setDiaryCache] = useState<Record<string, any[]>>({})
  const [loadingDiaryFor, setLoadingDiaryFor] = useState<string | null>(null)
  const [messageDraft, setMessageDraft] = useState({ userId: '', title: '', content: '', sending: false })
  const [passwordDraft, setPasswordDraft] = useState({ userId: '', newPassword: '', saving: false })
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    if (!token) return
    
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }, [token])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    if (user && user.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadUsers()
  }, [isLoggedIn, user, router, loadUsers])

  const adminUsers = useMemo(() => users.filter((u) => u.role === 'ADMIN'), [users])
  const professionalUsers = useMemo(() => users.filter((u) => u.role === 'PROFESSIONAL'), [users])
  const clientUsers = useMemo(() => users.filter((u) => u.role === 'CLIENT'), [users])

  const sendMessage = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Inserisci sia il titolo che il contenuto del messaggio')
      return
    }
    
    setSending(true)
    
    try {
      const res = await fetch('/api/admin/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      })

      if (res.ok) {
        alert('Messaggio inviato a tutti gli utenti!')
        setTitle('')
        setContent('')
      } else {
        const data = await res.json()
        alert(data.error || 'Errore nell\'invio del messaggio')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
    
    setSending(false)
  }

  const toggleUserList = () => {
    const next = !showUserList
    setShowUserList(next)
    if (next && users.length === 0) {
      loadUsers()
    }
  }

  const loadDiaryForUser = async (account: AdminManagedUser) => {
    if (account.diaryVisibility !== 'PUBLIC' || !token) return
    if (diaryCache[account.id]) return

    setLoadingDiaryFor(account.id)
    try {
      const res = await fetch(`/api/admin/users/${account.id}/diary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDiaryCache((prev) => ({ ...prev, [account.id]: data.entries }))
      } else {
        const data = await res.json()
        alert(data.error || 'Impossibile recuperare il diario')
      }
    } catch (error) {
      alert('Errore di connessione durante il caricamento del diario')
    }
    setLoadingDiaryFor(null)
  }

  const openMessageForm = (accountId: string) => {
    setMessageDraft({ userId: accountId, title: '', content: '', sending: false })
  }

  const submitUserMessage = async () => {
    if (!token || !messageDraft.userId) return
    if (!messageDraft.title.trim() || !messageDraft.content.trim()) {
      alert('Completa titolo e contenuto')
      return
    }

    setMessageDraft((prev) => ({ ...prev, sending: true }))
    try {
      const res = await fetch(`/api/admin/users/${messageDraft.userId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: messageDraft.title, content: messageDraft.content })
      })

      if (res.ok) {
        alert('Messaggio inviato')
        setMessageDraft({ userId: '', title: '', content: '', sending: false })
      } else {
        const data = await res.json()
        alert(data.error || 'Errore nell\'invio del messaggio')
        setMessageDraft((prev) => ({ ...prev, sending: false }))
      }
    } catch (error) {
      alert('Errore di connessione')
      setMessageDraft((prev) => ({ ...prev, sending: false }))
    }
  }

  const openPasswordForm = (accountId: string) => {
    setPasswordDraft({ userId: accountId, newPassword: '', saving: false })
  }

  const submitPasswordReset = async () => {
    if (!token || !passwordDraft.userId) return
    if (passwordDraft.newPassword.length < 8) {
      alert('La password deve avere almeno 8 caratteri')
      return
    }

    setPasswordDraft((prev) => ({ ...prev, saving: true }))
    try {
      const res = await fetch(`/api/admin/users/${passwordDraft.userId}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: passwordDraft.newPassword })
      })

      if (res.ok) {
        alert('Password aggiornata')
        setPasswordDraft({ userId: '', newPassword: '', saving: false })
      } else {
        const data = await res.json()
        alert(data.error || 'Errore durante l\'aggiornamento della password')
        setPasswordDraft((prev) => ({ ...prev, saving: false }))
      }
    } catch (error) {
      alert('Errore di connessione')
      setPasswordDraft((prev) => ({ ...prev, saving: false }))
    }
  }

  const handleRoleChange = async (accountId: string, role: AdminManagedUser['role']) => {
    if (!token) return
    setRoleUpdating(accountId)
    try {
      const res = await fetch(`/api/admin/users/${accountId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      })

      if (res.ok) {
        await loadUsers()
        if (messageDraft.userId && messageDraft.userId === accountId) {
          setMessageDraft((prev) => ({ ...prev, userId: '', sending: false }))
        }
      } else {
        const data = await res.json()
        alert(data.error || 'Errore durante l\'aggiornamento del ruolo')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
    setRoleUpdating(null)
  }

  const handleDeleteUser = async (accountId: string) => {
    if (!token) return
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) {
      return
    }
    setDeletingUserId(accountId)
    try {
      const res = await fetch(`/api/admin/users/${accountId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        alert('Utente eliminato')
        setDiaryCache((prev) => {
          const next = { ...prev }
          delete next[accountId]
          return next
        })
        if (messageDraft.userId === accountId) {
          setMessageDraft({ userId: '', title: '', content: '', sending: false })
        }
        if (passwordDraft.userId === accountId) {
          setPasswordDraft({ userId: '', newPassword: '', saving: false })
        }
        await loadUsers()
      } else {
        const data = await res.json()
        alert(data.error || 'Errore durante l\'eliminazione')
      }
    } catch (error) {
      alert('Errore di connessione')
    }
    setDeletingUserId(null)
  }

  const formatDiaryDate = (dateString: string) =>
    new Date(dateString).toLocaleString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  const roleLabelMap: Record<AdminManagedUser['role'], string> = {
    ADMIN: 'Administrator',
    PROFESSIONAL: 'Professional',
    CLIENT: 'Client',
  }

  const visibilityLabels: Record<AdminManagedUser['diaryVisibility'], string> = {
    PRIVATE: 'Only me',
    PROFESSIONALS: 'Professionals only',
    PUBLIC: 'Everyone',
  }

  const roleOptions: AdminManagedUser['role'][] = ['ADMIN', 'PROFESSIONAL', 'CLIENT']

  if (!isLoggedIn || user?.role !== 'ADMIN') {
    return (
      <Page title='Admin Panel'>
        <Section>
          <div className="text-center">
            <p className="text-zinc-600 dark:text-zinc-400">Accesso negato</p>
          </div>
        </Section>
      </Page>
    )
  }

  return (
    <Page title='Admin Panel'>
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">
              <Trans id="Admin Panel" />
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Pannello di amministrazione per gestire utenti e messaggi
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={toggleUserList}
                className="px-4 py-2 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
              >
                {showUserList ? (
                  <Trans id="Hide account list" />
                ) : (
                  <Trans id="List all accounts" />
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Send Message Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                Invia Messaggio a Tutti gli Utenti
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Titolo
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                    placeholder="Inserisci il titolo del messaggio..."
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Contenuto
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-32 p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 resize-none"
                    placeholder="Scrivi il contenuto del messaggio..."
                  />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={sending}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {sending ? 'Invio in corso...' : 'Invia Messaggio'}
                </button>
              </div>
            </div>

            {/* Users Statistics */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                Statistiche Utenti
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                  <span className="text-zinc-700 dark:text-zinc-300"><Trans id="Total users" /></span>
                  <span className="text-2xl font-bold text-blue-500">{users.length}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                  <span className="text-zinc-700 dark:text-zinc-300"><Trans id="Administrators" /></span>
                  <span className="text-2xl font-bold text-green-500">
                    {adminUsers.length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                  <span className="text-zinc-700 dark:text-zinc-300"><Trans id="Professionals" /></span>
                  <span className="text-2xl font-bold text-purple-500">
                    {professionalUsers.length}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                  <span className="text-zinc-700 dark:text-zinc-300"><Trans id="Clients" /></span>
                  <span className="text-2xl font-bold text-amber-500">
                    {clientUsers.length}
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-3">
                  Utenti Recenti
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300">{user.email}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isAdmin 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-3">
                  <Trans id="Active Administrators" />
                </h3>
                {adminUsers.length === 0 ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    <Trans id="No administrators found" />
                  </p>
                ) : (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {adminUsers.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-700 dark:text-zinc-300">{admin.email}</span>
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <Trans id="Admin" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showUserList && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
              <Trans id="All accounts" />
            </h2>

            {users.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                <Trans id="No accounts available" />
              </p>
            ) : (
              <div className="space-y-4">
                {users.map((account) => {
                  const canViewDiary = account.diaryVisibility === 'PUBLIC'
                  const isMessageOpen = messageDraft.userId === account.id
                  const isPasswordOpen = passwordDraft.userId === account.id

                  return (
                    <div
                      key={account.id}
                      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <UserAvatar
                            animal={account.avatar || 'leone'}
                            size="md"
                            className="border border-zinc-300 dark:border-zinc-600"
                          />
                          <div>
                            <p className="font-medium text-zinc-800 dark:text-zinc-100">{account.email}</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              {account.nickname || '—'}
                            </p>
                            {account.phone && (
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {account.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                            <Trans id={roleLabelMap[account.role]} />
                          </span>
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
                            <Trans id={visibilityLabels[account.diaryVisibility]} />
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => loadDiaryForUser(account)}
                          disabled={!canViewDiary || loadingDiaryFor === account.id}
                          className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                            canViewDiary
                              ? 'border border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white'
                              : 'border border-dashed border-zinc-400 text-zinc-400 cursor-not-allowed'
                          }`}
                        >
                          {loadingDiaryFor === account.id ? (
                            <Trans id="Loading diary..." />
                          ) : (
                            <Trans id="View diary" />
                          )}
                        </button>
                        <button
                          onClick={() => (isMessageOpen ? setMessageDraft({ userId: '', title: '', content: '', sending: false }) : openMessageForm(account.id))}
                          className="rounded-lg border border-green-500 px-3 py-2 text-sm text-green-600 hover:bg-green-500 hover:text-white transition-colors"
                        >
                          {isMessageOpen ? <Trans id="Close message" /> : <Trans id="Send message" />}
                        </button>
                        <button
                          onClick={() => (isPasswordOpen ? setPasswordDraft({ userId: '', newPassword: '', saving: false }) : openPasswordForm(account.id))}
                          className="rounded-lg border border-amber-500 px-3 py-2 text-sm text-amber-600 hover:bg-amber-500 hover:text-white transition-colors"
                        >
                          {isPasswordOpen ? <Trans id="Close password form" /> : <Trans id="Reset password" />}
                        </button>
                        <select
                          value={account.role}
                          onChange={(event) => {
                            const selectedRole = event.target.value as AdminManagedUser['role']
                            if (selectedRole !== account.role) {
                              handleRoleChange(account.id, selectedRole)
                            }
                          }}
                          disabled={roleUpdating === account.id}
                          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {i18n._(roleLabelMap[role])}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDeleteUser(account.id)}
                          disabled={deletingUserId === account.id}
                          className="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          {deletingUserId === account.id ? <Trans id="Deleting..." /> : <Trans id="Delete user" />}
                        </button>
                      </div>

                      {isMessageOpen && (
                        <div className="mt-4 space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/30">
                          <input
                            type="text"
                            value={messageDraft.title}
                            onChange={(e) => setMessageDraft((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Titolo"
                            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                          />
                          <textarea
                            value={messageDraft.content}
                            onChange={(e) => setMessageDraft((prev) => ({ ...prev, content: e.target.value }))}
                            rows={4}
                            placeholder="Contenuto"
                            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setMessageDraft({ userId: '', title: '', content: '', sending: false })}
                              className="rounded px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100"
                            >
                              <Trans id="Cancel" />
                            </button>
                            <button
                              onClick={submitUserMessage}
                              disabled={messageDraft.sending}
                              className="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:opacity-50"
                            >
                              {messageDraft.sending ? <Trans id="Sending..." /> : <Trans id="Send" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {isPasswordOpen && (
                        <div className="mt-4 space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
                          <input
                            type="password"
                            value={passwordDraft.newPassword}
                            onChange={(e) => setPasswordDraft((prev) => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="Nuova password"
                            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setPasswordDraft({ userId: '', newPassword: '', saving: false })}
                              className="rounded px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100"
                            >
                              <Trans id="Cancel" />
                            </button>
                            <button
                              onClick={submitPasswordReset}
                              disabled={passwordDraft.saving}
                              className="rounded bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600 disabled:opacity-50"
                            >
                              {passwordDraft.saving ? <Trans id="Saving..." /> : <Trans id="Update" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {diaryCache[account.id] && (
                        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-700 dark:bg-indigo-900/20">
                          <h3 className="mb-2 text-sm font-semibold text-indigo-700 dark:text-indigo-200">
                            <Trans id="Latest diary entries" />
                          </h3>
                          {diaryCache[account.id].length === 0 ? (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              <Trans id="No diary entries" />
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {diaryCache[account.id].map((entry) => (
                                <div key={entry.id} className="rounded border border-indigo-100 bg-white p-3 text-sm dark:border-indigo-800 dark:bg-indigo-900/40">
                                  <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-200">
                                    <span>{formatDiaryDate(entry.date)}</span>
                                    {entry.mood && <span>{entry.mood}</span>}
                                  </div>
                                  {entry.freeText ? (
                                    <div
                                      className="mt-2 text-zinc-700 dark:text-zinc-100"
                                      dangerouslySetInnerHTML={{ __html: entry.freeText }}
                                    />
                                  ) : (
                                    <p className="mt-2 text-zinc-500 dark:text-zinc-300">
                                      <Trans id="No text provided" />
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </Section>
    </Page>
  )
}

export default AdminPanel
