import Page from '@/components/page'
import Section from '@/components/section'
import { Trans, useLingui } from '@lingui/react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/router'

interface Entry {
  id: string
  term: string
  definition: string
}

export default function Vocabulary() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const { i18n } = useLingui()
  const [entries, setEntries] = useState<Entry[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    loadEntries('')
  }, [isLoggedIn, router])

  const loadEntries = async (q: string) => {
    setLoading(true)
    const res = await fetch('/api/vocabulary?q=' + encodeURIComponent(q))
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries)
    }
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    loadEntries(search)
  }

  if (!isLoggedIn) {
    return (
      <Page title='Vocabulary'>
        <Section>
          <p className='text-center text-zinc-600 dark:text-zinc-400'>Loading...</p>
        </Section>
      </Page>
    )
  }

  return (
    <Page title='Vocabulary'>
      <Section>
        <h1 className='text-3xl font-bold mb-4 text-zinc-800 dark:text-zinc-200'>
          <Trans id='Vocabolario Psicologico' />
        </h1>
        <p className='text-zinc-600 dark:text-zinc-400 mb-6'>
          <Trans id='A glossary of relevant psychological terms' />
        </p>
        <form onSubmit={handleSearch} className='mb-6'>
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={i18n._('Search')}
            className='w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg'
          />
        </form>
        {loading ? (
          <p className='text-zinc-600 dark:text-zinc-400'>Loading...</p>
        ) : (
          <div className='space-y-6'>
            {entries.map((entry) => (
              <div key={entry.id} className='bg-white dark:bg-zinc-800 p-4 rounded-lg shadow'>
                <h3 className='text-xl font-semibold mb-2 text-zinc-800 dark:text-zinc-200'>
                  {entry.term}
                </h3>
                <div
                  className='prose dark:prose-invert'
                  dangerouslySetInnerHTML={{ __html: entry.definition }}
                />
              </div>
            ))}
          </div>
        )}
      </Section>
    </Page>
  )
}
