import Page from '@/components/page'
import Section from '@/components/section'
import { Trans } from '@lingui/react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/router'
import { getQuestionsForDate } from '@/lib/diary-questions'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

const Diary = () => {
  const { user, token, isLoggedIn } = useAuth()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [isWriting, setIsWriting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [freeText, setFreeText] = useState('')
  const [dailyQuestions, setDailyQuestions] = useState<string[]>([])

  // 6 basic emotions with emojis
  const emotions = [
    { emoji: '😊', name: 'Happy' },
    { emoji: '😢', name: 'Sad' },
    { emoji: '😠', name: 'Angry' },
    { emoji: '😨', name: 'Fear' },
    { emoji: '😮', name: 'Surprise' },
    { emoji: '🤢', name: 'Disgust' }
  ]
  const [entryDates, setEntryDates] = useState<string[]>([])
  const [entryMoods, setEntryMoods] = useState<Record<string, string | null>>({})
  const [viewingEntry, setViewingEntry] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    loadEntryDates()
    loadEntryForDate(selectedDate)
    // Load questions for the selected date
    const questions = getQuestionsForDate(selectedDate)
    setDailyQuestions(questions)
  }, [isLoggedIn, router, selectedDate])

  const loadEntryDates = async () => {
    if (!token) return
    
    try {
      const res = await fetch('/api/diary/dates', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setEntryDates(data.dates)
        setEntryMoods(data.moods || {})
      }
    } catch (error) {
      console.error('Error loading entry dates:', error)
    }
  }

  const loadEntryForDate = async (date: Date) => {
    if (!token) return

    const dateStr = date.toISOString().split('T')[0]
    
    try {
      const res = await fetch(`/api/diary/entry?date=${dateStr}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setViewingEntry(data.entry)
      } else {
        setViewingEntry(null)
      }
    } catch (error) {
      console.error('Error loading entry:', error)
      setViewingEntry(null)
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const hasEntry = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return entryDates.includes(dateStr)
  }

  const getMoodForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return entryMoods[dateStr]
  }

  const startWriting = () => {
    setIsWriting(true)
    setIsEditing(false)
    setCurrentQuestion(0)
    setAnswers({})
    setCurrentAnswer('')
    setFreeText('')
    setSelectedMood('')
    setShowMoodSelector(false)
  }

  const startEditing = () => {
    setIsEditing(true)
    setIsWriting(false)
    if (viewingEntry && viewingEntry.freeText) {
      setFreeText(viewingEntry.freeText)
    } else {
      setFreeText('')
    }
  }

  const handleAnswer = () => {
    if (!currentAnswer.trim()) {
      alert('Per favore scrivi una risposta o clicca "Non voglio rispondere"')
      return
    }
    
    setAnswers(prev => ({ ...prev, [dailyQuestions[currentQuestion]]: currentAnswer }))
    setCurrentAnswer('')
    
    if (currentQuestion < dailyQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // Show mood selector after last question
      setIsWriting(false)
      setShowMoodSelector(true)
    }
  }

  const skipQuestion = () => {
    setCurrentAnswer('')
    
    if (currentQuestion < dailyQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // Show mood selector after last question
      setIsWriting(false)
      setShowMoodSelector(true)
    }
  }

  const handleMoodSelection = (mood: string) => {
    setSelectedMood(mood)
    saveEntry(mood)
  }

  const saveEntry = async (mood?: string) => {
    console.log('🚀 SaveEntry started:', { mood, isEditing, freeTextLength: freeText?.length })
    setSaving(true)
    
    try {
      let entryData
      
      if (isEditing) {
        // Free text editing
        entryData = { 
          date: selectedDate.toISOString().split('T')[0], 
          freeText,
          mood: mood || selectedMood
        }
      } else {
        // Combine answers into free text
        const combinedText = Object.entries(answers)
          .map(([_, answer]) => answer)
          .join('\n\n')
        
        entryData = { 
          date: selectedDate.toISOString().split('T')[0], 
          freeText: combinedText,
          mood: mood || selectedMood
        }
      }
      
      console.log('📤 About to send request:', entryData)
      
      const res = await fetch('/api/diary/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entryData)
      })

      console.log('📬 Response received:', { status: res.status, ok: res.ok })

      if (res.ok) {
        console.log('✅ Save successful!')
        setIsWriting(false)
        setIsEditing(false)
        setShowMoodSelector(false)
        loadEntryDates()
        loadEntryForDate(selectedDate)
        alert('Voce del diario salvata!')
      } else {
        console.log('❌ Save failed, trying to parse error...')
        try {
          const data = await res.json()
          console.log('❌ Error response:', data)
          alert(data.error || 'Errore nel salvare la voce')
        } catch (parseError) {
          console.log('❌ Could not parse error response:', parseError)
          alert(`Errore HTTP ${res.status}`)
        }
      }
    } catch (error) {
      console.log('💥 Network/Fetch error:', error)
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
    
    const calendar = []
    const currentDate = new Date(startDate)
    
    for (let week = 0; week < 6; week++) {
      const weekRow = []
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate)
        const isCurrentMonth = date.getMonth() === month
        const isSelected = date.toDateString() === selectedDate.toDateString()
        const isCurrentDay = date.toDateString() === new Date().toDateString()
        const hasEntryForDate = hasEntry(date)
        const mood = getMoodForDate(date)
        
        weekRow.push(
          <button
            key={date.toISOString()}
            onClick={() => {
              setSelectedDate(date)
              loadEntryForDate(date)
              setIsWriting(false)
            }}
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors relative
              ${isCurrentMonth ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}
              ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'}
              ${isCurrentDay && !isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
              ${hasEntryForDate && !isSelected ? 'bg-green-100 dark:bg-green-900 border-2 border-green-500' : ''}
            `}
          >
            <span className={mood ? 'text-xs sm:text-sm' : 'text-xs sm:text-sm'}>{date.getDate()}</span>
            {mood && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 text-sm scale-130">
                {mood}
              </span>
            )}
          </button>
        )
        currentDate.setDate(currentDate.getDate() + 1)
      }
      calendar.push(
        <div key={week} className="flex justify-between">
          {weekRow}
        </div>
      )
    }
    
    return calendar
  }

  if (!isLoggedIn || !user) {
    return (
      <Page title='Diary'>
        <Section>
          <div className="text-center">
            <p className="text-zinc-600 dark:text-zinc-400">Caricamento...</p>
          </div>
        </Section>
      </Page>
    )
  }

  return (
    <Page title='Diary'>
      <Section>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">
              <Trans id="My Personal Diary" />
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-2">
              <Trans id="Welcome to your personal diary" />
            </p>
            <p className="text-zinc-500 dark:text-zinc-500 text-sm">
              <Trans id="This is your private space to reflect and write about your daily experiences" />
            </p>
          </div>

          <div className={`grid gap-6 lg:gap-8 ${isEditing ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
            {/* Calendar */}
            {!isEditing && (
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setMonth(newDate.getMonth() - 1)
                    setSelectedDate(newDate)
                  }}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
                >
                  ←
                </button>
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  {selectedDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setMonth(newDate.getMonth() + 1)
                    setSelectedDate(newDate)
                  }}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
                >
                  →
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-zinc-500 mb-2">
                  <div>Dom</div><div>Lun</div><div>Mar</div><div>Mer</div><div>Gio</div><div>Ven</div><div>Sab</div>
                </div>
                {generateCalendar()}
              </div>
              
              <p className="text-xs text-zinc-500 mt-4 text-center">
                <Trans id="Days with entries are highlighted" />
              </p>
            </div>
            )}

            {/* Writing/Viewing Area */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 sm:p-6 shadow-lg">
              {isWriting ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                    <Trans id="Today's Entry" />
                  </h3>
                  <div className="mb-4">
                    <p className="text-sm text-zinc-500 mb-2">
                      Domanda {currentQuestion + 1} di {dailyQuestions.length}
                    </p>
                    <p className="text-lg mb-4 text-zinc-700 dark:text-zinc-300">
                      <Trans id={dailyQuestions[currentQuestion]} />
                    </p>
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="w-full h-32 p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 resize-none"
                      placeholder="Scrivi la tua risposta..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAnswer}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {currentQuestion === dailyQuestions.length - 1 ? 
                        (saving ? 'Salvando...' : <Trans id="Finish Entry" />) : 
                        <Trans id="Next Question" />
                      }
                    </button>
                    <button
                      onClick={skipQuestion}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                    >
                      <Trans id="I don't want to answer" />
                    </button>
                  </div>
                </div>
              ) : showMoodSelector ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                    <Trans id="How do you feel today?" />
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
                    <Trans id="Select the emoji that best represents how you feel today:" />
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    {emotions.map((emotion) => (
                      <button
                        key={emotion.name}
                        onClick={() => handleMoodSelection(emotion.emoji)}
                        disabled={saving}
                        className="flex flex-col items-center p-3 sm:p-4 border-2 border-gray-200 dark:border-zinc-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 active:scale-95"
                      >
                        <span className="text-3xl sm:text-4xl mb-1 sm:mb-2">{emotion.emoji}</span>
                        <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                          <Trans id={emotion.name} />
                        </span>
                      </button>
                    ))}
                  </div>
                  {saving && (
                    <p className="text-center text-zinc-500">Salvando...</p>
                  )}
                </div>
              ) : isEditing ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                    Modifica voce del {selectedDate.toLocaleDateString()}
                  </h3>
                  <RichTextEditor
                    value={freeText}
                    onChange={setFreeText}
                    placeholder="Scrivi liberamente i tuoi pensieri e riflessioni..."
                  />
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => saveEntry()}
                      disabled={saving}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      {saving ? 'Salvando...' : <Trans id="Save Entry" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setFreeText('')
                      }}
                      disabled={saving}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                    >
                      <Trans id="Annulla" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                    {isToday(selectedDate) ? <Trans id="Today's Entry" /> : 
                     <><Trans id="Entry for" /> {selectedDate.toLocaleDateString()}</>}
                  </h3>
                  
                  {viewingEntry ? (
                    <div className="space-y-4">
                      {viewingEntry.freeText ? (
                        <div>
                          <div 
                            className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: viewingEntry.freeText }}
                          />
                          {viewingEntry.mood && (
                            <div className="flex items-center justify-center mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-600">
                              <span className="text-sm text-zinc-500 mr-2">Umore del giorno:</span>
                              <span className="text-2xl">{viewingEntry.mood}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-zinc-500 text-center py-8">
                          <Trans id="No entry for this date" />
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-zinc-500 mb-4">
                        <Trans id="No entry for this date" />
                      </p>
                      {isToday(selectedDate) && (
                        <button
                          onClick={startWriting}
                          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Scrivi nel diario
                        </button>
                      )}
                      {!isToday(selectedDate) && (
                        <p className="text-sm text-zinc-400">
                          <Trans id="You can only edit today's entry" />
                        </p>
                      )}
                    </div>
                  )}
                  
                  {isToday(selectedDate) && viewingEntry && (
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={startEditing}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Modifica con editor libero
                      </button>
                      <button
                        onClick={startWriting}
                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Riscrivi con domande
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>
    </Page>
  )
}

export default Diary