import { useCallback, useEffect, useMemo, useState, ReactNode } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { Trans, useTranslations } from '@/lib/i18n'
import { resolveAnimalMessage, type AnimalMessageKey } from '@/lib/i18n/animals'

import Page from '@/components/page'
import Section from '@/components/section'
import UserAvatar from '@/components/user-avatar'
import { useAuth } from '@/lib/auth-context'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

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
  hasDiaryPassword: boolean
}

type UserDetails = {
  id: string
  email: string
  nickname: string | null
  avatar: string | null
  phone: string | null
  role: 'ADMIN' | 'PROFESSIONAL' | 'CLIENT'
  diaryVisibility: 'PRIVATE' | 'PROFESSIONALS' | 'PUBLIC'
  createdAt: string
  messages: Array<{ id: string; title: string; createdAt: string; isRead: boolean }>
  _count: { diaryEntries: number; messages: number }
}

type Article = {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author: { id: string; email: string }
}

const AdminPanel = () => {
  const { user, token, isLoggedIn } = useAuth()
  const router = useRouter()
  const { t } = useTranslations()

  const [users, setUsers] = useState<AdminManagedUser[]>([])
  const [showUsers, setShowUsers] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDetails | null>(null)
  const [userDetailsLoading, setUserDetailsLoading] = useState(false)
  const [diaryCache, setDiaryCache] = useState<Record<string, Array<{ id: string; date: string; mood: string | null; publicText: string | null; publicSharedAt: string | null }>>>({})
  const [loadingDiaryFor, setLoadingDiaryFor] = useState<string | null>(null)

  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastContent, setBroadcastContent] = useState('')
  const [broadcastSending, setBroadcastSending] = useState(false)

  const [messageDraft, setMessageDraft] = useState({ title: '', content: '', sending: false })
  const [passwordDraft, setPasswordDraft] = useState({ newPassword: '', saving: false })
  const [roleUpdating, setRoleUpdating] = useState(false)
  const [deletingUser, setDeletingUser] = useState(false)

  const [articles, setArticles] = useState<Article[]>([])
  const [articleFormOpen, setArticleFormOpen] = useState(false)
  const [articleSaving, setArticleSaving] = useState(false)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [articleTitle, setArticleTitle] = useState('')
  const [articleSlug, setArticleSlug] = useState('')
  const [articleSummary, setArticleSummary] = useState('')
  const [articleContent, setArticleContent] = useState('')
  const [articlePublished, setArticlePublished] = useState(false)

  const loadUsers = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }, [token])

  const loadUserDetails = useCallback(
    async (userId: string) => {
      if (!token) return
      setUserDetailsLoading(true)
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setSelectedUserDetails(data.user)
        } else {
          const data = await res.json().catch(() => ({}))
          alert(data.error || 'Errore durante il caricamento del profilo utente')
        }
      } catch (error) {
        console.error('Error loading user details:', error)
        alert('Errore di connessione')
      }
      setUserDetailsLoading(false)
    },
    [token]
  )

  const loadDiaryForUser = useCallback(
    async (accountId: string) => {
      if (!token) return
      setLoadingDiaryFor(accountId)
      try {
        const res = await fetch(`/api/admin/users/${accountId}/diary`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setDiaryCache((prev) => ({ ...prev, [accountId]: data.entries }))
        } else {
          const data = await res.json().catch(() => ({}))
          alert(data.error || 'Impossibile recuperare il diario')
        }
      } catch (error) {
        console.error('Error loading diary:', error)
        alert('Errore di connessione durante il caricamento del diario')
      }
      setLoadingDiaryFor(null)
    },
    [token]
  )

  const loadArticles = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/admin/articles', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setArticles(data.articles)
      }
    } catch (error) {
      console.error('Error loading articles:', error)
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
    loadArticles()
  }, [isLoggedIn, user, router, loadUsers, loadArticles])

  const adminUsers = useMemo(() => users.filter((u) => u.role === 'ADMIN'), [users])
  const professionalUsers = useMemo(() => users.filter((u) => u.role === 'PROFESSIONAL'), [users])
  const clientUsers = useMemo(() => users.filter((u) => u.role === 'CLIENT'), [users])

  const handleBroadcast = async () => {
    if (!titleOr(broadcastTitle) || !titleOr(broadcastContent)) {
      alert(t('Provide both title and message'))
      return
    }
    if (!token) return
    setBroadcastSending(true)
    try {
      const res = await fetch('/api/admin/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: broadcastTitle, content: broadcastContent }),
      })
      if (res.ok) {
        alert(t('Broadcast delivered to every user'))
        setBroadcastTitle('')
        setBroadcastContent('')
        setBroadcastOpen(false)
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Errore nell\'invio del messaggio')
      }
    } catch (error) {
      console.error('Error sending broadcast:', error)
      alert('Errore di connessione')
    }
    setBroadcastSending(false)
  }

  const handleRoleChange = async (accountId: string, role: AdminManagedUser['role']) => {
    if (!token) return
    setRoleUpdating(true)
    try {
      const res = await fetch(`/api/admin/users/${accountId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        await loadUsers()
        if (selectedUserId === accountId) {
          await loadUserDetails(accountId)
        }
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Errore durante l\'aggiornamento del ruolo')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Errore di connessione')
    }
    setRoleUpdating(false)
  }

  const submitUserMessage = async () => {
    if (!token || !selectedUserId) return
    if (!titleOr(messageDraft.title) || !titleOr(messageDraft.content)) {
      alert(t('Provide both title and message'))
      return
    }
    setMessageDraft((prev) => ({ ...prev, sending: true }))
    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: messageDraft.title, content: messageDraft.content }),
      })
      if (res.ok) {
        alert(t('Message sent'))
        setMessageDraft({ title: '', content: '', sending: false })
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Errore nell\'invio del messaggio')
        setMessageDraft((prev) => ({ ...prev, sending: false }))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Errore di connessione')
      setMessageDraft((prev) => ({ ...prev, sending: false }))
    }
  }

  const submitPasswordReset = async () => {
    if (!token || !selectedUserId) return
    if (passwordDraft.newPassword.length < 8) {
      alert(t('The new password must be at least 8 characters long'))
      return
    }
    setPasswordDraft((prev) => ({ ...prev, saving: true }))
    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: passwordDraft.newPassword }),
      })
      if (res.ok) {
        alert(t('Password updated'))
        setPasswordDraft({ newPassword: '', saving: false })
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Errore durante l\'aggiornamento della password')
        setPasswordDraft((prev) => ({ ...prev, saving: false }))
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Errore di connessione')
      setPasswordDraft((prev) => ({ ...prev, saving: false }))
    }
  }

  const handleDeleteUser = async () => {
    if (!token || !selectedUserId) return
    const confirmMessage = t(
      'Are you sure you want to delete this user? This action cannot be undone.'
    )
    if (!confirm(typeof confirmMessage === 'string' ? confirmMessage : String(confirmMessage))) {
      return
    }
    setDeletingUser(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        alert(t('User removed'))
        setSelectedUserId(null)
        setSelectedUserDetails(null)
        await loadUsers()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Errore durante l\'eliminazione dell\'utente')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Errore di connessione')
    }
    setDeletingUser(false)
  }

  const selectUser = (account: AdminManagedUser) => {
    setSelectedUserId(account.id)
    setSelectedUserDetails(null)
    setMessageDraft({ title: '', content: '', sending: false })
    setPasswordDraft({ newPassword: '', saving: false })
    void loadUserDetails(account.id)
    if (account.diaryVisibility === 'PUBLIC' && !diaryCache[account.id]) {
      void loadDiaryForUser(account.id)
    }
  }

  const resetArticleForm = () => {
    setEditingArticleId(null)
    setArticleTitle('')
    setArticleSlug('')
    setArticleSummary('')
    setArticleContent('')
    setArticlePublished(false)
  }

  const populateArticleForm = (article: Article) => {
    setEditingArticleId(article.id)
    setArticleTitle(article.title)
    setArticleSlug(article.slug)
    setArticleSummary(article.summary ?? '')
    setArticleContent(article.content)
    setArticlePublished(!!article.publishedAt)
    setArticleFormOpen(true)
  }

  const handleArticleSave = async () => {
    if (!token) return
    if (!titleOr(articleTitle) || !titleOr(articleContent)) {
      alert(t('Article title and content are required'))
      return
    }
    setArticleSaving(true)
    const payload = {
      title: articleTitle,
      slug: articleSlug,
      summary: articleSummary,
      content: articleContent,
      published: articlePublished,
    }
    try {
      const res = await fetch(`/api/admin/articles${editingArticleId ? `/${editingArticleId}` : ''}`, {
        method: editingArticleId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        await loadArticles()
        resetArticleForm()
        setArticleFormOpen(false)
        alert(t('Article saved'))
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Errore durante il salvataggio dell\'articolo')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Errore di connessione')
    }
    setArticleSaving(false)
  }

  const handleArticleDelete = async (articleId: string) => {
    if (!token) return
    if (!confirm(t('Are you sure you want to delete this article?'))) {
      return
    }
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        await loadArticles()
        if (editingArticleId === articleId) {
          resetArticleForm()
          setArticleFormOpen(false)
        }
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Errore durante l\'eliminazione dell\'articolo')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Errore di connessione')
    }
  }

  if (!isLoggedIn || !user || user.role !== 'ADMIN') {
    return (
      <Page title='Admin Panel'>
        <Section>
          <div className='text-center'>
            <p className='text-zinc-600 dark:text-zinc-400'>
              <Trans id='Access denied' />
            </p>
          </div>
        </Section>
      </Page>
    )
  }

  return (
    <Page title='Admin Panel'>
      <Section>
        <div className='max-w-6xl mx-auto space-y-8'>
          <header className='text-center'>
            <h1 className='text-3xl font-bold text-zinc-800 dark:text-zinc-200'>
              <Trans id='Admin Panel' />
            </h1>
            <p className='mt-2 text-sm text-zinc-500 dark:text-zinc-400'>
              <Trans id='Manage users, broadcast communications, and publish articles for the platform.' />
            </p>
          </header>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatsCard label={t('Total users')} value={users.length} accent='primary' />
            <StatsCard label={t('Administrators')} value={adminUsers.length} accent='success' />
            <StatsCard label={t('Professionals')} value={professionalUsers.length} accent='purple' />
            <StatsCard label={t('Clients')} value={clientUsers.length} accent='amber' />
          </div>

          <div className='flex flex-wrap gap-3'>
            <button
              onClick={() => setShowUsers((prev) => !prev)}
              className='rounded-lg border border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-500 hover:bg-indigo-500 hover:text-white'
            >
              {showUsers ? <Trans id='Hide account list' /> : <Trans id='List all accounts' />}
            </button>
            <button
              onClick={() => setBroadcastOpen((prev) => !prev)}
              className='rounded-lg border border-green-500 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-500 hover:text-white'
            >
              <Trans id='Send a message to every user' />
            </button>
            <button
              onClick={() => {
                setArticleFormOpen((prev) => !prev)
                if (!articleFormOpen) {
                  resetArticleForm()
                }
              }}
              className='rounded-lg border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-500 hover:text-white'
            >
              <Trans id='Create article' />
            </button>
          </div>

          {broadcastOpen && (
            <div className='rounded-lg border border-green-300 bg-green-50 p-6 dark:border-green-700 dark:bg-green-900/20'>
              <h2 className='text-lg font-semibold text-green-700 dark:text-green-200'>
                <Trans id='Broadcast to all accounts' />
              </h2>
              <div className='mt-4 space-y-4'>
                <input
                  type='text'
                  value={broadcastTitle}
                  onChange={(event) => setBroadcastTitle(event.target.value)}
                  placeholder={t('Title')}
                  className='w-full rounded border border-green-200 px-3 py-2 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-100'
                />
                <textarea
                  value={broadcastContent}
                  onChange={(event) => setBroadcastContent(event.target.value)}
                  rows={4}
                  placeholder={t('Message content')}
                  className='w-full rounded border border-green-200 px-3 py-2 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-100'
                />
                <div className='flex justify-end gap-2'>
                  <button
                    onClick={() => {
                      setBroadcastOpen(false)
                      setBroadcastTitle('')
                      setBroadcastContent('')
                    }}
                    className='rounded border border-green-400 px-4 py-2 text-sm text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-200'
                  >
                    <Trans id='Cancel' />
                  </button>
                  <button
                    onClick={handleBroadcast}
                    disabled={broadcastSending}
                    className='rounded bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50'
                  >
                    {broadcastSending ? <Trans id='Sending...' /> : <Trans id='Send' />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showUsers && (
            <div className='grid gap-6 lg:grid-cols-[320px_1fr]'>
              <div className='space-y-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800'>
                <h3 className='text-sm font-semibold text-zinc-700 dark:text-zinc-200'>
                  <Trans id='Accounts' />
                </h3>
                <div className='space-y-1'>
                  {users.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => selectUser(account)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        selectedUserId === account.id
                          ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/30'
                          : 'border-zinc-200 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span className='truncate text-zinc-700 dark:text-zinc-200'>{account.email}</span>
                      <span className='text-xs text-zinc-500 dark:text-zinc-400'>{account.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className='rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800'>
                {selectedUserId ? (
                  userDetailsLoading ? (
                    <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                      <Trans id='Loading user details...' />
                    </p>
                  ) : selectedUserDetails ? (
                    <UserDetailPanel
                      user={selectedUserDetails}
                      account={users.find((item) => item.id === selectedUserId)!}
                      messageDraft={messageDraft}
                      setMessageDraft={setMessageDraft}
                      passwordDraft={passwordDraft}
                      setPasswordDraft={setPasswordDraft}
                      diaryEntries={diaryCache[selectedUserId] || []}
                      onReloadUsers={loadUsers}
                      onReloadDetails={() => loadUserDetails(selectedUserId)}
                      onLoadDiary={() => loadDiaryForUser(selectedUserId)}
                      onSendMessage={submitUserMessage}
                      onResetPassword={submitPasswordReset}
                      onDeleteUser={handleDeleteUser}
                      onRoleChange={handleRoleChange}
                      loadingStates={{
                        loadingDiary: loadingDiaryFor === selectedUserId,
                        sendingMessage: messageDraft.sending,
                        resettingPassword: passwordDraft.saving,
                        deletingUser,
                        updatingRole: roleUpdating,
                      }}
                    />
                  ) : (
                    <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                      <Trans id='Select an account to inspect details.' />
                    </p>
                  )
                ) : (
                  <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                    <Trans id='Pick an account from the list to open the detail panel.' />
                  </p>
                )}
              </div>
            </div>
          )}

          <ArticlesPanel
            articles={articles}
            articleFormOpen={articleFormOpen}
            editingArticleId={editingArticleId}
            articleTitle={articleTitle}
            articleSlug={articleSlug}
            articleSummary={articleSummary}
            articleContent={articleContent}
            articlePublished={articlePublished}
            onToggleForm={() => {
              if (articleFormOpen) {
                resetArticleForm()
              }
              setArticleFormOpen((prev) => !prev)
            }}
            onTitleChange={(value) => {
              setArticleTitle(value)
              if (!editingArticleId) {
                setArticleSlug(slugify(value))
              }
            }}
            onSlugChange={setArticleSlug}
            onSummaryChange={setArticleSummary}
            onContentChange={setArticleContent}
            onPublishedChange={setArticlePublished}
            onEditArticle={populateArticleForm}
            onDeleteArticle={handleArticleDelete}
            onSaveArticle={handleArticleSave}
            onResetForm={resetArticleForm}
            saving={articleSaving}
          />
        </div>
      </Section>
    </Page>
  )
}

const StatsCard = ({ label, value, accent }: { label: string; value: number; accent: 'primary' | 'success' | 'purple' | 'amber' }) => {
  const palette: Record<typeof accent, string> = {
    primary: 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-200',
    success: 'border-green-200 bg-green-50 text-green-600 dark:border-green-700 dark:bg-green-900/20 dark:text-green-200',
    purple: 'border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-200',
    amber: 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200',
  }
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${palette[accent]}`}>
      <p className='text-xs uppercase tracking-wide'>{label}</p>
      <p className='mt-2 text-2xl font-bold'>{value}</p>
    </div>
  )
}

const UserDetailPanel = ({
  user,
  account,
  messageDraft,
  setMessageDraft,
  passwordDraft,
  setPasswordDraft,
  diaryEntries,
  onReloadUsers,
  onReloadDetails,
  onLoadDiary,
  onSendMessage,
  onResetPassword,
  onDeleteUser,
  onRoleChange,
  loadingStates,
}: {
  user: UserDetails
  account: AdminManagedUser
  messageDraft: { title: string; content: string; sending: boolean }
  setMessageDraft: React.Dispatch<React.SetStateAction<{ title: string; content: string; sending: boolean }>>
  passwordDraft: { newPassword: string; saving: boolean }
  setPasswordDraft: React.Dispatch<React.SetStateAction<{ newPassword: string; saving: boolean }>>
  diaryEntries: Array<{ id: string; date: string; mood: string | null; publicText: string | null; publicSharedAt: string | null }>
  onReloadUsers: () => Promise<void>
  onReloadDetails: () => Promise<void>
  onLoadDiary: () => Promise<void>
  onSendMessage: () => Promise<void>
  onResetPassword: () => Promise<void>
  onDeleteUser: () => Promise<void>
  onRoleChange: (id: string, role: AdminManagedUser['role']) => Promise<void>
  loadingStates: {
    loadingDiary: boolean
    sendingMessage: boolean
    resettingPassword: boolean
    deletingUser: boolean
    updatingRole: boolean
  }
}) => {
  const { t } = useTranslations()

  const infoPairs = useMemo<Array<{ label: string; value: ReactNode }>>(() => {
    const roleMap: Record<UserDetails['role'], string> = {
      ADMIN: t('Administrator'),
      PROFESSIONAL: t('Professional'),
      CLIENT: t('Client'),
    }
    const visibilityMap: Record<UserDetails['diaryVisibility'], string> = {
      PRIVATE: t('Only me'),
      PUBLIC: t('Everyone'),
      PROFESSIONALS: t('Professionals only'),
    }

    const safeNickname = user.nickname || t('Not set')
    const safePhone = user.phone || t('Not set')
    const avatarContent = account.avatar ? (
      <div className='flex items-center gap-2'>
        <UserAvatar animal={account.avatar} size='sm' />
        <span>{t(resolveAnimalMessage(account.avatar as AnimalMessageKey))}</span>
      </div>
    ) : (
      <span>{t('Not set')}</span>
    )

    return [
      { label: t('Avatar'), value: avatarContent },
      { label: t('Display name'), value: safeNickname },
      { label: t('Email'), value: user.email },
      { label: t('Phone'), value: safePhone },
      { label: t('Role'), value: roleMap[user.role] ?? user.role },
      {
        label: t('Diary visibility'),
        value: visibilityMap[user.diaryVisibility] ?? user.diaryVisibility,
      },
      { label: t('Created at'), value: new Date(user.createdAt).toLocaleString() },
    ]
  }, [account.avatar, t, user])

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <UserAvatar animal={user.avatar || 'leone'} size='md' />
        <div>
          <p className='text-lg font-semibold text-zinc-800 dark:text-zinc-100'>{user.email}</p>
          <p className='text-sm text-zinc-500 dark:text-zinc-400'>ID: {user.id}</p>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        {infoPairs.map(({ label, value }) => (
          <div key={label} className='rounded-lg border border-zinc-200 p-3 dark:border-zinc-700'>
            <p className='text-xs uppercase text-zinc-500 dark:text-zinc-400'>{label}</p>
            <div className='mt-1 text-sm text-zinc-800 dark:text-zinc-100'>{value}</div>
          </div>
        ))}
      </div>

      <div className='space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700'>
        <h4 className='text-sm font-semibold text-zinc-700 dark:text-zinc-200'>
          <Trans id='Account actions' />
        </h4>
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='space-y-2 text-sm text-zinc-600 dark:text-zinc-300'>
            <span><Trans id='Role' /></span>
            <select
              value={account.role}
              onChange={(event) => onRoleChange(account.id, event.target.value as AdminManagedUser['role'])}
              disabled={loadingStates.updatingRole}
              className='w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100'
            >
              <option value='ADMIN'>{t('Administrator')}</option>
              <option value='PROFESSIONAL'>{t('Professional')}</option>
              <option value='CLIENT'>{t('Client')}</option>
            </select>
          </label>
          <label className='space-y-2 text-sm text-zinc-600 dark:text-zinc-300'>
            <span><Trans id='New password' /></span>
            <div className='flex gap-2'>
              <input
                type='password'
                value={passwordDraft.newPassword}
                onChange={(event) => setPasswordDraft({ newPassword: event.target.value, saving: false })}
                className='w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100'
              />
              <button
                onClick={onResetPassword}
                disabled={loadingStates.resettingPassword}
                className='rounded bg-amber-500 px-3 py-2 text-sm text-white hover:bg-amber-600 disabled:opacity-50'
              >
                <Trans id='Reset' />
              </button>
            </div>
          </label>
        </div>
        <div className='flex justify-between'>
          <button
            onClick={async () => {
              await onReloadDetails()
              await onReloadUsers()
            }}
            className='rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300'
          >
            <Trans id='Refresh data' />
          </button>
          <button
            onClick={onDeleteUser}
            disabled={loadingStates.deletingUser}
            className='rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50'
          >
            <Trans id='Delete user' />
          </button>
        </div>
      </div>

      <div className='space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700'>
        <h4 className='text-sm font-semibold text-zinc-700 dark:text-zinc-200'>
          <Trans id='Send a private message' />
        </h4>
        <input
          type='text'
          value={messageDraft.title}
          onChange={(event) => setMessageDraft((prev) => ({ ...prev, title: event.target.value }))}
          placeholder={t('Title')}
          className='w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100'
        />
        <textarea
          value={messageDraft.content}
          onChange={(event) => setMessageDraft((prev) => ({ ...prev, content: event.target.value }))}
          rows={3}
          placeholder={t('Message content')}
          className='w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100'
        />
        <div className='flex justify-end'>
          <button
            onClick={onSendMessage}
            disabled={loadingStates.sendingMessage}
            className='rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50'
          >
            {loadingStates.sendingMessage ? <Trans id='Sending...' /> : <Trans id='Send' />}
          </button>
        </div>
      </div>

      <div className='space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700'>
        <div className='flex items-center justify-between'>
          <h4 className='text-sm font-semibold text-zinc-700 dark:text-zinc-200'>
            <Trans id='Diary visibility' />
          </h4>
          <span className='text-xs uppercase text-zinc-500 dark:text-zinc-400'>{user.diaryVisibility}</span>
        </div>
        {account.diaryVisibility === 'PUBLIC' ? (
          <div className='space-y-2'>
            <button
              onClick={onLoadDiary}
              disabled={loadingStates.loadingDiary}
              className='rounded border border-indigo-400 px-3 py-2 text-sm text-indigo-500 hover:bg-indigo-500 hover:text-white disabled:opacity-50'
            >
              {loadingStates.loadingDiary ? <Trans id='Loading diary...' /> : <Trans id='View diary' />}
            </button>
            {diaryEntries.length > 0 ? (
              <ul className='max-h-56 space-y-2 overflow-y-auto text-sm'>
                {diaryEntries.map((entry) => (
                  <li key={entry.id} className='rounded border border-zinc-200 p-2 dark:border-zinc-700'>
                    <div className='flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400'>
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      {entry.mood && <span>{entry.mood}</span>}
                    </div>
                    {entry.publicText ? (
                      <div
                        className='prose prose-sm max-w-none text-zinc-700 dark:prose-invert dark:text-zinc-100'
                        dangerouslySetInnerHTML={{ __html: entry.publicText }}
                      />
                    ) : (
                      <p className='text-xs text-zinc-500 dark:text-zinc-300'>
                        <Trans id='No text provided' />
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                <Trans id='No shared diary entries yet.' />
              </p>
            )}
          </div>
        ) : (
          <p className='text-sm text-zinc-500 dark:text-zinc-400'>
            <Trans id='The diary is not shared. Ask the user to change visibility to "Everyone" if needed.' />
          </p>
        )}
      </div>
    </div>
  )
}

const ArticlesPanel = ({
  articles,
  articleFormOpen,
  editingArticleId,
  articleTitle,
  articleSlug,
  articleSummary,
  articleContent,
  articlePublished,
  onToggleForm,
  onTitleChange,
  onSlugChange,
  onSummaryChange,
  onContentChange,
  onPublishedChange,
  onEditArticle,
  onDeleteArticle,
  onSaveArticle,
  onResetForm,
  saving,
}: {
  articles: Article[]
  articleFormOpen: boolean
  editingArticleId: string | null
  articleTitle: string
  articleSlug: string
  articleSummary: string
  articleContent: string
  articlePublished: boolean
  onToggleForm: () => void
  onTitleChange: (value: string) => void
  onSlugChange: (value: string) => void
  onSummaryChange: (value: string) => void
  onContentChange: (value: string) => void
  onPublishedChange: (value: boolean) => void
  onEditArticle: (article: Article) => void
  onDeleteArticle: (id: string) => void
  onSaveArticle: () => void
  onResetForm: () => void
  saving: boolean
}) => {
  const { t } = useTranslations()

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-zinc-800 dark:text-zinc-200'>
          <Trans id='Blog articles' />
        </h2>
        <button
          onClick={onToggleForm}
          className='rounded border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-500 hover:text-white'
        >
          {articleFormOpen ? <Trans id='Close editor' /> : <Trans id='Create article' />}
        </button>
      </div>

      {articleFormOpen && (
        <div className='rounded-lg border border-amber-300 bg-amber-50 p-6 dark:border-amber-700 dark:bg-amber-900/20'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <label className='text-sm text-zinc-600 dark:text-zinc-200'>
              <span className='mb-1 block font-medium'><Trans id='Title' /></span>
              <input
                type='text'
                value={articleTitle}
                onChange={(event) => onTitleChange(event.target.value)}
                className='w-full rounded border border-amber-200 px-3 py-2 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100'
              />
            </label>
            <label className='text-sm text-zinc-600 dark:text-zinc-200'>
              <span className='mb-1 block font-medium'><Trans id='Slug' /></span>
              <input
                type='text'
                value={articleSlug}
                onChange={(event) => onSlugChange(event.target.value)}
                className='w-full rounded border border-amber-200 px-3 py-2 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100'
              />
            </label>
          </div>
          <label className='mt-4 block text-sm text-zinc-600 dark:text-zinc-200'>
            <span className='mb-1 block font-medium'><Trans id='Summary' /></span>
            <textarea
              value={articleSummary}
              onChange={(event) => onSummaryChange(event.target.value)}
              rows={2}
              className='w-full rounded border border-amber-200 px-3 py-2 text-sm dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100'
            />
          </label>
          <label className='mt-4 block text-sm text-zinc-600 dark:text-zinc-200'>
            <span className='mb-1 block font-medium'><Trans id='Content' /></span>
            <RichTextEditor value={articleContent} onChange={onContentChange} />
          </label>
          <label className='mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-200'>
            <input
              type='checkbox'
              checked={articlePublished}
              onChange={(event) => onPublishedChange(event.target.checked)}
              className='h-4 w-4'
            />
            <span><Trans id='Publish immediately' /></span>
          </label>
          <div className='mt-6 flex justify-between'>
            <button
              onClick={() => {
                onResetForm()
                onToggleForm()
              }}
              className='rounded border border-amber-400 px-4 py-2 text-sm text-amber-600 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200'
            >
              <Trans id='Cancel' />
            </button>
            <button
              onClick={onSaveArticle}
              disabled={saving}
              className='rounded bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50'
            >
              {saving ? t('Saving...') : t('Save')}
            </button>
          </div>
        </div>
      )}

      <div className='space-y-3'>
        {articles.length === 0 ? (
          <p className='text-sm text-zinc-500 dark:text-zinc-400'>
            <Trans id='No articles yet. Create one above.' />
          </p>
        ) : (
          <div className='grid gap-3 md:grid-cols-2'>
            {articles.map((article) => (
              <div key={article.id} className='space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700'>
                <div className='flex items-start justify-between'>
                  <div>
                    <p className='text-sm text-zinc-500 dark:text-zinc-400'>{article.slug}</p>
                    <h3 className='text-lg font-semibold text-zinc-800 dark:text-zinc-100'>{article.title}</h3>
                  </div>
                  {article.publishedAt ? (
                    <span className='rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-200'>
                      <Trans id='Published' />
                    </span>
                  ) : (
                    <span className='rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'>
                      <Trans id='Draft' />
                    </span>
                  )}
                </div>
                {article.summary && (
                  <p className='text-sm text-zinc-600 dark:text-zinc-300'>{article.summary}</p>
                )}
                <div className='flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400'>
                  <span>{new Date(article.updatedAt || article.createdAt).toLocaleDateString()}</span>
                  <span>{article.author.email}</span>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => onEditArticle(article)}
                    className='flex-1 rounded border border-indigo-400 px-3 py-2 text-sm text-indigo-500 hover:bg-indigo-500 hover:text-white'
                  >
                    <Trans id='Edit' />
                  </button>
                  <button
                    onClick={() => onDeleteArticle(article.id)}
                    className='rounded border border-red-400 px-3 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white'
                  >
                    <Trans id='Delete' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const titleOr = (value: string) => value?.trim().length > 0

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export default AdminPanel
