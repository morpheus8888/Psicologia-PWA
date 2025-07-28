import Page from '@/components/page'
import Section from '@/components/section'
import { Trans } from '@lingui/react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/router'

const AdminPanel = () => {
  const { user, token, isLoggedIn } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    if (user && !user.isAdmin) {
      router.push('/')
      return
    }
    loadUsers()
  }, [isLoggedIn, user, router])

  const loadUsers = async () => {
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
  }

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

  if (!isLoggedIn || !user?.isAdmin) {
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
                  <span className="text-zinc-700 dark:text-zinc-300">Totale Utenti</span>
                  <span className="text-2xl font-bold text-blue-500">{users.length}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                  <span className="text-zinc-700 dark:text-zinc-300">Amministratori</span>
                  <span className="text-2xl font-bold text-green-500">
                    {users.filter(u => u.isAdmin).length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                  <span className="text-zinc-700 dark:text-zinc-300">Utenti Normali</span>
                  <span className="text-2xl font-bold text-purple-500">
                    {users.filter(u => !u.isAdmin).length}
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
            </div>
          </div>
        </div>
      </Section>
    </Page>
  )
}

export default AdminPanel