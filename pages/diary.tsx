import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Trans, useTranslations } from '@/lib/i18n'
import type { MessageKey } from '@/locales/en/messages'

import Page from '@/components/page'
import Section from '@/components/section'
import { useAuth } from '@/lib/auth-context'
import { getQuestionsForDate } from '@/lib/diary-questions'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

interface DiaryEntry {
  id: string
  freeText: string | null
  mood: string | null
  date: string
}

const emotions: Array<{ emoji: string; label: MessageKey }> = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😨', label: 'Fear' },
  { emoji: '😮', label: 'Surprise' },
  { emoji: '🤢', label: 'Disgust' },
]

const Diary = () => {
  const { user, token, isLoggedIn } = useAuth()
  const router = useRouter()
  const { i18n, t } = useTranslations()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dailyQuestions, setDailyQuestions] = useState<string[]>(getQuestionsForDate(new Date()))
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [isWriting, setIsWriting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [freeText, setFreeText] = useState('')
  const [entryDates, setEntryDates] = useState<string[]>([])
  const [entryMoods, setEntryMoods] = useState<Record<string, string | null>>({})
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null)
  const [saving, setSaving] = useState(false)

  const [diaryPassword, setDiaryPassword] = useState('')
  const [passwordValidated, setPasswordValidated] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false)

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.locale, { weekday: 'short' })
    const referenceSunday = new Date(Date.UTC(2023, 0, 1))
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(new Date(referenceSunday.getTime() + index * 24 * 60 * 60 * 1000))
    )
  }, [i18n.locale])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    setDailyQuestions(getQuestionsForDate(selectedDate))
    if (passwordValidated && diaryPassword) {
      void fetchEntry(selectedDate, diaryPassword)
    } else {
      setViewingEntry(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  useEffect(() => {
    if (!user) {
      return
    }

    if (!user.hasDiaryPassword) {
      sessionStorage.removeItem('diaryPassword')
      setDiaryPassword('')
      setPasswordValidated(false)
      setPasswordModalOpen(false)
      return
    }

    const storedPassword = sessionStorage.getItem('diaryPassword')
    if (storedPassword) {
      void unlockDiary(storedPassword, { silent: true })
    } else {
      setPasswordModalOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.hasDiaryPassword])

  const hasEntry = useMemo(() => {
    const set = new Set(entryDates)
    return (date: Date) => set.has(date.toISOString().split('T')[0])
  }, [entryDates])

  const getMoodForDate = (date: Date) => entryMoods[date.toISOString().split('T')[0]]

  const fetchEntryDates = async (password: string) => {
    if (!token) throw new Error('Token mancante')

    const res = await fetch('/api/diary/dates', {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-diary-password': password,
      },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || t('Unable to unlock diary with the provided password'))
    }

    const data = await res.json()
    setEntryDates(data.dates)
    setEntryMoods(data.moods || {})
    return data
  }

  const fetchEntry = async (date: Date, password: string) => {
    if (!token) return
    const dateStr = date.toISOString().split('T')[0]

    try {
      const res = await fetch(`/api/diary/entry?date=${dateStr}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-diary-password': password,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setViewingEntry(data.entry)
        if (data.entry?.freeText) {
          setFreeText(data.entry.freeText)
        }
      } else {
        setViewingEntry(null)
      }
    } catch (error) {
      console.error('Error loading diary entry:', error)
      setViewingEntry(null)
    }
  }

  const unlockDiary = async (password: string, options: { silent?: boolean } = {}) => {
    if (!token) return false
    const { silent = false } = options

    if (!silent) {
      setPasswordError('')
    }

    setIsVerifyingPassword(true)
    try {
      await fetchEntryDates(password)
      sessionStorage.setItem('diaryPassword', password)
      setDiaryPassword(password)
      setPasswordValidated(true)
      setPasswordModalOpen(false)
      setPasswordInput('')
      await fetchEntry(selectedDate, password)
      return true
    } catch (error) {
      sessionStorage.removeItem('diaryPassword')
      setDiaryPassword('')
      setPasswordValidated(false)
      if (!silent) {
        setPasswordError((error as Error).message)
      } else {
        setPasswordModalOpen(true)
      }
      return false
    } finally {
      setIsVerifyingPassword(false)
    }
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!passwordInput.trim()) {
      setPasswordError(t('Enter your diary password to continue'))
      return
    }
    await unlockDiary(passwordInput.trim())
  }

  const handleResetDiaryUnlock = () => {
    sessionStorage.removeItem('diaryPassword')
    setDiaryPassword('')
    setPasswordValidated(false)
    setViewingEntry(null)
    setPasswordModalOpen(true)
  }

  const startWriting = () => {
    if (!passwordValidated) {
      setPasswordModalOpen(true)
      return
    }
    setIsWriting(true)
    setIsEditing(false)
    setShowMoodSelector(false)
    setCurrentQuestion(0)
    setAnswers({})
    setCurrentAnswer('')
    setFreeText('')
    setSelectedMood('')
  }

  const skipQuestion = () => {
    setCurrentAnswer('')
    if (currentQuestion < dailyQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setIsWriting(false)
      setShowMoodSelector(true)
    }
  }

  const handleAnswer = () => {
    if (!currentAnswer.trim()) {
      alert(t('Please write an answer or skip the question'))
      return
    }
    setAnswers((prev) => ({ ...prev, [dailyQuestions[currentQuestion]]: currentAnswer }))
    setCurrentAnswer('')
    if (currentQuestion < dailyQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setIsWriting(false)
      setShowMoodSelector(true)
    }
  }

  const handleMoodSelection = (mood: string) => {
    setSelectedMood(mood)
    void saveEntry(mood)
  }

  const startEditing = () => {
    if (!passwordValidated || !viewingEntry) return
    setIsEditing(true)
    setIsWriting(false)
    setShowMoodSelector(false)
    setFreeText(viewingEntry.freeText || '')
  }

  const saveEntry = async (mood?: string) => {
    if (!token || !passwordValidated || !diaryPassword) {
      setPasswordModalOpen(true)
      alert(t('Unlock your diary before saving an entry'))
      return
    }

    setSaving(true)
    try {
      let entryBody: { date: string; freeText: string; mood: string | null }

      if (isEditing) {
        entryBody = {
          date: selectedDate.toISOString().split('T')[0],
          freeText,
          mood: mood || selectedMood || null,
        }
      } else {
        const combinedText = Object.entries(answers)
          .map(([, answer]) => answer)
          .join('\n\n')
        entryBody = {
          date: selectedDate.toISOString().split('T')[0],
          freeText: combinedText,
          mood: mood || selectedMood || null,
        }
      }

      const res = await fetch('/api/diary/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...entryBody, diaryPassword }),
      })

      if (res.ok) {
        setIsWriting(false)
        setIsEditing(false)
        setShowMoodSelector(false)
        await fetchEntryDates(diaryPassword)
        await fetchEntry(selectedDate, diaryPassword)
        alert(t('Diary entry saved!'))
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Errore nel salvare la voce')
        if (res.status === 400 && (data.error || '').toLowerCase().includes('password')) {
          handleResetDiaryUnlock()
        }
      }
    } catch (error) {
      console.error('Error saving diary entry:', error)
      alert('Errore di connessione')
    }
    setSaving(false)
  }

  const generateCalendar = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const calendarRows = []
    const current = new Date(startDate)

    for (let week = 0; week < 6; week++) {
      const row = []
      for (let day = 0; day < 7; day++) {
        const date = new Date(current)
        const isCurrentMonth = date.getMonth() === month
        const isSelected = date.toDateString() === selectedDate.toDateString()
        const isToday = date.toDateString() === new Date().toDateString()
        const hasEntryForDay = hasEntry(date)
        const mood = getMoodForDate(date)

        row.push(
          <button
            key={date.toISOString()}
            onClick={() => {
              setSelectedDate(date)
              if (passwordValidated && diaryPassword) {
                void fetchEntry(date, diaryPassword)
              }
              setIsWriting(false)
              setIsEditing(false)
            }}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors relative
              ${isCurrentMonth ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}
              ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'}
              ${isToday && !isSelected ? 'bg-blue-100 dark:bg-blue-900/40' : ''}
              ${hasEntryForDay && !isSelected ? 'bg-green-100 dark:bg-green-900/40 border border-green-400 dark:border-green-500' : ''}
            `}
          >
            <span>{date.getDate()}</span>
            {mood && (
              <span className='absolute -top-1 -right-1 text-sm'>{mood}</span>
            )}
          </button>
        )
        current.setDate(current.getDate() + 1)
      }
      calendarRows.push(
        <div key={week} className='flex justify-between gap-1'>
          {row}
        </div>
      )
    }

    return calendarRows
  }

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString()

  if (!isLoggedIn || !user) {
    return (
      <Page title='Diary'>
        <Section>
          <div className='text-center'>
            <p className='text-zinc-600 dark:text-zinc-400'>Caricamento...</p>
          </div>
        </Section>
      </Page>
    )
  }

  if (!user.hasDiaryPassword) {
    return (
      <Page title='Diary'>
        <Section>
          <div className='mx-auto max-w-lg text-center'>
            <h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
              <Trans id='Protect your diary first' />
            </h2>
            <p className='mt-3 text-sm text-zinc-500 dark:text-zinc-400'>
              <Trans id='Set a dedicated diary password in the profile settings to unlock, read and write your journal.' />
            </p>
            <button
              onClick={() => router.push('/profile')}
              className='mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600'
            >
              <Trans id='Go to settings' />
            </button>
          </div>
        </Section>
      </Page>
    )
  }

  return (
    <Page title='Diary'>
      <Section>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-4'>
              <Trans id='My Personal Diary' />
            </h1>
            <p className='text-zinc-600 dark:text-zinc-400'>
              <Trans id='Welcome to your personal diary' />
            </p>
            <p className='text-sm text-zinc-500 dark:text-zinc-500'>
              <Trans id='This is your private space to reflect and write about your daily experiences' />
            </p>
          </div>

          {passwordValidated && (
            <div className='mb-6 flex justify-center'>
              <button
                onClick={handleResetDiaryUnlock}
                className='rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-600 dark:text-zinc-300'
              >
                <Trans id='Lock diary again' />
              </button>
            </div>
          )}

          {passwordValidated ? (
            <div className={`grid gap-6 lg:gap-8 ${isEditing ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
              {!isEditing && (
                <div className='rounded-lg bg-white p-5 shadow dark:bg-zinc-800'>
                  <div className='flex items-center justify-between mb-4'>
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate)
                        newDate.setMonth(newDate.getMonth() - 1)
                        setSelectedDate(newDate)
                      }}
                      className='rounded p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    >
                      ←
                    </button>
                    <h2 className='text-lg font-semibold text-zinc-800 dark:text-zinc-200'>
                      {selectedDate.toLocaleDateString(i18n.locale, { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate)
                        newDate.setMonth(newDate.getMonth() + 1)
                        setSelectedDate(newDate)
                      }}
                      className='rounded p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    >
                      →
                    </button>
                  </div>
                  <div className='space-y-2'>
                    <div className='grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500'>
                      {weekdayLabels.map((label, index) => (
                        <div key={index}>{label}</div>
                      ))}
                    </div>
                    {generateCalendar()}
                  </div>
                  <p className='mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400'>
                    <Trans id='Days with entries are highlighted' />
                  </p>
                </div>
              )}

              <div className='rounded-lg bg-white p-5 shadow dark:bg-zinc-800'>
                {isWriting ? (
                  <div>
                    <h3 className='mb-4 text-xl font-semibold text-zinc-800 dark:text-zinc-200'>
                      <Trans id="Today's Entry" />
                    </h3>
                    <div className='mb-4'>
                      <p className='mb-2 text-sm text-zinc-500'>
                        {t('Question {current} of {total}', {
                          current: currentQuestion + 1,
                          total: dailyQuestions.length,
                        })}
                      </p>
                      <p className='mb-4 text-lg text-zinc-700 dark:text-zinc-300'>
                        {t(dailyQuestions[currentQuestion] as MessageKey)}
                      </p>
                      <textarea
                        value={currentAnswer}
                        onChange={(event) => setCurrentAnswer(event.target.value)}
                        className='h-32 w-full resize-none rounded-lg border border-zinc-300 p-3 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100'
                        placeholder={t('Write your answer here...')}
                      />
                    </div>
                    <div className='flex gap-3'>
                      <button
                        onClick={handleAnswer}
                        disabled={saving}
                        className='flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
                      >
                        {currentQuestion === dailyQuestions.length - 1 ? (
                          <Trans id='Finish Entry' />
                        ) : (
                          <Trans id='Next Question' />
                        )}
                      </button>
                      <button
                        onClick={skipQuestion}
                        disabled={saving}
                        className='rounded-lg border border-zinc-300 px-4 py-2 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      >
                        <Trans id="I don't want to answer" />
                      </button>
                    </div>
                  </div>
                ) : showMoodSelector ? (
                  <div>
                    <h3 className='mb-4 text-xl font-semibold text-zinc-800 dark:text-zinc-200'>
                      <Trans id='How do you feel today?' />
                    </h3>
                    <p className='mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400'>
                      <Trans id='Select the emoji that best represents how you feel today:' />
                    </p>
                    <div className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3'>
                    {emotions.map((emotion) => (
                      <button
                        key={emotion.label}
                          onClick={() => handleMoodSelection(emotion.emoji)}
                          disabled={saving}
                          className='flex flex-col items-center rounded-lg border-2 border-zinc-200 p-3 transition-colors hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-blue-900/20'
                        >
                          <span className='mb-1 text-3xl'>{emotion.emoji}</span>
                          <span className='text-xs text-zinc-600 dark:text-zinc-400'>
                        {t(emotion.label)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : isEditing ? (
                  <div>
                    <h3 className='mb-4 text-xl font-semibold text-zinc-800 dark:text-zinc-200'>
                      <Trans id='Edit with free editor' />
                    </h3>
                    <RichTextEditor value={freeText} onChange={setFreeText} />
                    <div className='mt-4 flex justify-end gap-3'>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setFreeText('')
                        }}
                        className='rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      >
                        <Trans id='Cancel' />
                      </button>
                      <button
                        onClick={() => void saveEntry(selectedMood)}
                        disabled={saving}
                        className='rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:opacity-50'
                      >
                        <Trans id='Save Entry' />
                      </button>
                    </div>
                  </div>
                ) : viewingEntry ? (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <div>
                        <h3 className='text-xl font-semibold text-zinc-800 dark:text-zinc-200'>
                          <Trans id='Entry for' /> {selectedDate.toLocaleDateString(i18n.locale)}
                        </h3>
                        {viewingEntry.mood && (
                          <p className='text-sm text-zinc-500 dark:text-zinc-400'>{viewingEntry.mood}</p>
                        )}
                      </div>
                      {isToday(selectedDate) && (
                        <div className='flex gap-2'>
                          <button
                            onClick={startEditing}
                            className='rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700'
                          >
                            <Trans id='Edit with free editor' />
                          </button>
                          <button
                            onClick={startWriting}
                            className='rounded-lg bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600'
                          >
                            <Trans id='Rewrite with questions' />
                          </button>
                        </div>
                      )}
                    </div>
                    {viewingEntry.freeText ? (
                      <div className='prose prose-zinc max-w-none dark:prose-invert' dangerouslySetInnerHTML={{ __html: viewingEntry.freeText }} />
                    ) : (
                      <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                        <Trans id='No entry for this date' />
                      </p>
                    )}
                  </div>
                ) : (
                  <div className='text-center'>
                    <h3 className='mb-2 text-xl font-semibold text-zinc-800 dark:text-zinc-200'>
                      <Trans id='No entry for this date' />
                    </h3>
                    {isToday(selectedDate) ? (
                      <>
                        <p className='mb-4 text-sm text-zinc-500 dark:text-zinc-400'>
                          <Trans id='Select a date from the calendar to view or write entries' />
                        </p>
                        <button
                          onClick={startWriting}
                          className='rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600'
                        >
                          <Trans id='Write freely your thoughts and reflections' />
                        </button>
                      </>
                    ) : (
                      <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                        <Trans id="You can only edit today's entry" />
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-800'>
              <p className='text-sm text-zinc-600 dark:text-zinc-300'>
                <Trans id='Enter your diary password to unlock entries.' />
              </p>
              <button
                onClick={() => setPasswordModalOpen(true)}
                className='mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600'
              >
                <Trans id='Unlock diary' />
              </button>
            </div>
          )}
        </div>

        {passwordModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4'>
            <div className='w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900'>
              <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
                <Trans id='Unlock diary' />
              </h3>
              <p className='mt-2 text-sm text-zinc-500 dark:text-zinc-400'>
                <Trans id='Enter your diary password to continue' />
              </p>
              <form onSubmit={handlePasswordSubmit} className='mt-4 space-y-4'>
                <input
                  type='password'
                  autoFocus
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  className='w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
                />
                {passwordError && (
                  <p className='text-sm text-red-500 dark:text-red-400'>{passwordError}</p>
                )}
                <div className='flex justify-end gap-2'>
                  {passwordValidated && (
                    <button
                      type='button'
                      onClick={() => {
                        setPasswordModalOpen(false)
                        setPasswordError('')
                        setPasswordInput('')
                      }}
                      className='rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                    >
                      <Trans id='Cancel' />
                    </button>
                  )}
                  <button
                    type='submit'
                    disabled={isVerifyingPassword}
                    className='rounded bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50'
                  >
                    {isVerifyingPassword ? <Trans id='Unlocking...' /> : <Trans id='Unlock' />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Section>
    </Page>
  )
}

export default Diary
