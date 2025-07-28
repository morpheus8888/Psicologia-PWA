export const DIARY_QUESTIONS = [
  // Riflessioni quotidiane
  'What did you do today?',
  'How are you feeling right now?',
  'What made you smile today?',
  'What challenged you today?',
  'What are you grateful for today?',
  
  // Memoria e pianificazione
  'Do you remember what you planned to do yesterday?',
  'What do you want to accomplish tomorrow?',
  'What did you learn today?',
  'What would you do differently today?',
  'What are you looking forward to?',
  
  // Emozioni e stati d\'animo
  'What made you happy today?',
  'What frustrated you today?',
  'How did you handle stress today?',
  'What emotions did you experience today?',
  'What calmed you down today?',
  
  // Autocritica e crescita
  'What do you think you did wrong today?',
  'What would you like to improve tomorrow?',
  'What mistake did you make and what did you learn from it?',
  'How did you step out of your comfort zone today?',
  'What personal goal did you work on today?',
  
  // Relazioni
  'Who did you spend time with today?',
  'How did you show kindness to someone today?',
  'What conversation had the biggest impact on you today?',
  'How did you connect with others today?',
  'Did you feel understood by someone today?',
  
  // Creatività e passioni
  'What inspired you today?',
  'What creative activity did you do today?',
  'What new idea came to you today?',
  'What hobby or interest did you pursue today?',
  'What beauty did you notice today?',
  
  // Salute e benessere
  'How did you take care of your body today?',
  'What did you eat that made you feel good?',
  'How much did you sleep last night and how did it affect your day?',
  'What physical activity did you do today?',
  'How did you relax today?',
  
  // Lavoro e produttività
  'What work task gave you the most satisfaction today?',
  'What was your biggest accomplishment today?',
  'How did you manage your time today?',
  'What new skill did you develop today?',
  'What challenge at work did you overcome today?',
  
  // Mindfulness e presenza
  'What moment today were you most present?',
  'What did you notice about your surroundings today?',
  'How did you practice mindfulness today?',
  'What sounds, smells, or textures stood out to you today?',
  'When did you feel most at peace today?',
  
  // Valori e significato
  'How did you live according to your values today?',
  'What gave your day meaning?',
  'How did you make a difference today?',
  'What principle guided your decisions today?',
  'How did you honor what\'s important to you today?',
  
  // Ricordi e nostalgia
  'What memory from the past came to mind today?',
  'What from today will you want to remember in the future?',
  'How did your past experience help you today?',
  'What tradition or ritual did you practice today?',
  'What reminded you of your childhood today?',
  
  // Sogni e aspirazioni
  'What dream did you think about today?',
  'How did you work toward your future goals today?',
  'What possibility excited you today?',
  'What vision for your life became clearer today?',
  'What hope do you have for tomorrow?',
  
  // Difficoltà e resilienza
  'What obstacle did you face and how did you handle it?',
  'What helped you persevere through a difficult moment today?',
  'How did you show courage today?',
  'What strength did you discover in yourself today?',
  'How did you bounce back from a setback today?',
  
  // Connessione spirituale
  'What gave you a sense of wonder today?',
  'How did you connect with something larger than yourself today?',
  'What question about life crossed your mind today?',
  'What moment felt sacred or special today?',
  'How did you find meaning in ordinary moments today?',
  
  // Cambiamento e crescita
  'What changed in your perspective today?',
  'How are you different today than you were yesterday?',
  'What pattern in your behavior did you notice today?',
  'What feedback did you receive and how did you respond?',
  'What comfort zone did you step outside of today?',
  
  // Comunicazione ed espressione
  'What did you want to say but didn\'t today?',
  'How did you express yourself authentically today?',
  'What conversation do you wish you could have had today?',
  'How did you listen deeply to someone today?',
  'What truth about yourself did you acknowledge today?',
  
  // Ambiente e spazio
  'How did your environment affect your mood today?',
  'What space brought you comfort today?',
  'How did nature impact you today?',
  'What in your surroundings would you like to change?',
  'Where did you feel most like yourself today?',
  
  // Tempo e ritmo
  'How did you spend your free time today?',
  'What moment felt rushed and what felt unhurried today?',
  'How did you balance work and rest today?',
  'What rhythm felt natural to you today?',
  'When did time seem to stand still or fly by today?',
  
  // Intuizione e saggezza
  'What did your intuition tell you today?',
  'What wisdom did you gain from today\'s experiences?',
  'What pattern did you recognize in your life today?',
  'What truth became clear to you today?',
  'What insight surprised you today?'
]

// Function to select 10 random questions for a specific date
export function getQuestionsForDate(date: Date): string[] {
  // Use date as seed for consistent randomization for the same day
  const dateString = date.toISOString().split('T')[0]
  const seed = dateString.split('-').join('')
  
  // Simple seeded random function
  let seedValue = parseInt(seed)
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280
    return seedValue / 233280
  }
  
  // Shuffle array using seeded random
  const shuffled = [...DIARY_QUESTIONS]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  // Return first 10 questions
  return shuffled.slice(0, 10)
}