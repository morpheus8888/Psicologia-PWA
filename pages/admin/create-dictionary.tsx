import Page from '@/components/page'
import Section from '@/components/section'
import dynamic from 'next/dynamic'
import { Trans, useLingui } from '@lingui/react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/router'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

export default function CreateDictionary() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const { i18n } = useLingui()
  const [term, setTerm] = useState('')
  const [definition, setDefinition] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    if (user && !user.isAdmin) {
      router.push('/')
    }
  }, [isLoggedIn, user, router])

  const saveEntry = async () => {
    if (!term.trim() || !definition.trim()) {
      alert(i18n._('Please provide term and definition'))
      return
    }
    setSaving(true)
    const res = await fetch('/api/vocabulary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term, definition })
    })
    const data = await res.json()
    if (res.ok) {
      alert(i18n._('Saved'))
      setTerm('')
      setDefinition('')
    } else {
      alert(data.error || 'Error')
    }
    setSaving(false)
  }

  if (!isLoggedIn || !user?.isAdmin) {
    return (
      <Page title='Create Dictionary'>
        <Section>
          <p className='text-center text-zinc-600 dark:text-zinc-400'>
            <Trans id='Access denied' />
          </p>
        </Section>
      </Page>
    )
  }

  return (
    <Page title='Create Dictionary'>
      <Section>
        <h1 className='text-3xl font-bold mb-6 text-zinc-800 dark:text-zinc-200'>
          <Trans id='Create dictionary entry' />
        </h1>
        <div className='mb-4'>
          <input
            type='text'
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={i18n._('Word')}
            className='w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg'
          />
        </div>
        <RichTextEditor
          value={definition}
          onChange={setDefinition}
          placeholder={i18n._('Definition')}
        />
        <button
          onClick={saveEntry}
          disabled={saving}
          className='mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50'
        >
          {saving ? i18n._('Saving...') : i18n._('Save')}
        </button>
      </Section>
    </Page>
  )
}
