import Page from '@/components/page'
import Section from '@/components/section'
import { Trans } from '@lingui/react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/router'

const Messages = () => {
  const { user, token, isLoggedIn } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    loadMessages()
  }, [isLoggedIn, router])

  const loadMessages = async () => {
    if (!token) return
    
    try {
      const res = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
    
    setLoading(false)
  }

  const markAsRead = async (messageId: string) => {
    if (!token) return
    
    try {
      const res = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ))
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isLoggedIn || !user) {
    return (
      <Page title='Messages'>
        <Section>
          <div className="text-center">
            <p className="text-zinc-600 dark:text-zinc-400">Caricamento...</p>
          </div>
        </Section>
      </Page>
    )
  }

  return (
    <Page title='Messages'>
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">
              <Trans id="Messages" />
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              I tuoi messaggi dal team
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-zinc-500">Caricamento messaggi...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-lg">
                <svg className="mx-auto h-12 w-12 text-zinc-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  Nessun messaggio
                </h3>
                <p className="text-zinc-500">
                  Non hai ancora ricevuto messaggi dal team.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-lg border-l-4 cursor-pointer transition-all hover:shadow-xl ${
                    message.isRead 
                      ? 'border-zinc-300 dark:border-zinc-600' 
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                  onClick={() => !message.isRead && markAsRead(message.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${
                      message.isRead 
                        ? 'text-zinc-800 dark:text-zinc-200'
                        : 'text-blue-800 dark:text-blue-200'
                    }`}>
                      {message.title}
                      {!message.isRead && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          Nuovo
                        </span>
                      )}
                    </h3>
                    <span className="text-sm text-zinc-500">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  
                  <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {message.content.split('\n').map((line: string, index: number) => (
                      <p key={index} className={index > 0 ? 'mt-2' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                  
                  {!message.isRead && (
                    <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-600">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(message.id)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        Segna come letto
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </Page>
  )
}

export default Messages