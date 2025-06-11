import { useEffect, useState, useMemo } from 'react'
import { aggregateTopicStats } from './scheduler.js'
import './App.css'
import Quiz from './Quiz.jsx'
import { questionBank } from './data/questions.js'

const ALL_TOPICS = (() => {
  const set = new Set()
  Object.values(questionBank).forEach(section => {
    Object.keys(section).forEach(t => set.add(t))
  })
  return Array.from(set)
})()

function App() {
  const [inSession, setInSession] = useState(false)
  const [history, setHistory] = useState([])
  const [duration, setDuration] = useState(300)
  const [questionCount, setQuestionCount] = useState(10)
  const [topics, setTopics] = useState(ALL_TOPICS)
  const [weakOnly, setWeakOnly] = useState(false)
  const [points, setPoints] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [streak, setStreak] = useState(0)
  const [badges, setBadges] = useState([])
  const [lastSession, setLastSession] = useState('')

  const aggregated = useMemo(() => {
    const result = aggregateTopicStats()
    history.forEach(session => {
      if (!session.topicStats) return
      Object.entries(session.topicStats).forEach(([topic, stats]) => {
        if (!result[topic]) result[topic] = { correct: 0, total: 0 }
        result[topic].correct += stats.correct
        result[topic].total += stats.total
      })
    })
    return result
  }, [history])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('history') || '[]')
    setHistory(stored)
    setPoints(Number(localStorage.getItem('points') || 0))
    setTotalQuestions(Number(localStorage.getItem('totalQuestions') || 0))
    setStreak(Number(localStorage.getItem('streak') || 0))
    setBadges(JSON.parse(localStorage.getItem('badges') || '[]'))
    setLastSession(localStorage.getItem('lastSession') || '')
  }, [])

  const handleComplete = summary => {
    const now = Date.now()
    const updated = [...history, { ...summary, date: now }]
    setHistory(updated)
    localStorage.setItem('history', JSON.stringify(updated))

    const newPoints = points + summary.score
    const newTotal = totalQuestions + summary.total

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    let newStreak = streak
    if (lastSession === today) {
      newStreak = streak
    } else if (lastSession === yesterday) {
      newStreak = streak + 1
    } else {
      newStreak = 1
    }

    let newBadges = [...badges]
    if (newStreak >= 3 && !newBadges.includes('3-Day Streak')) {
      newBadges.push('3-Day Streak')
    }
    if (newStreak >= 7 && !newBadges.includes('7-Day Streak')) {
      newBadges.push('7-Day Streak')
    }
    if (newTotal >= 50 && !newBadges.includes('50 Questions')) {
      newBadges.push('50 Questions')
    }
    if (newTotal >= 100 && !newBadges.includes('100 Questions')) {
      newBadges.push('100 Questions')
    }

    setPoints(newPoints)
    setTotalQuestions(newTotal)
    setStreak(newStreak)
    setBadges(newBadges)
    setLastSession(today)

    localStorage.setItem('points', newPoints)
    localStorage.setItem('totalQuestions', newTotal)
    localStorage.setItem('streak', newStreak)
    localStorage.setItem('badges', JSON.stringify(newBadges))
    localStorage.setItem('lastSession', today)

    setInSession(false)
  }

  if (inSession) {
    return (
      <Quiz
        onComplete={handleComplete}
        duration={duration}
        topics={topics}
        questionCount={questionCount}
      />
    )
  }
  return (
    <div className="quiz-container max-w-2xl">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] opacity-5 z-0"></div>
      <div className="relative z-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-300 to-yellow-400 text-transparent bg-clip-text mb-6 text-center">Real Estate Quiz</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <div className="text-sm text-indigo-200">Points</div>
            <div className="text-2xl font-bold text-yellow-400">{points}</div>
          </div>
          <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <div className="text-sm text-indigo-200">Level</div>
            <div className="text-2xl font-bold text-yellow-400">{Math.floor(points / 100) + 1}</div>
          </div>
          <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <div className="text-sm text-indigo-200">Streak</div>
            <div className="text-2xl font-bold text-yellow-400">{streak} <span className="text-xs">day{streak === 1 ? '' : 's'}</span></div>
          </div>
        </div>
          {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-6 bg-indigo-800 bg-opacity-30 p-4 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-2">
              Achievements
            </h2>
            <div className="flex flex-wrap gap-2">
              {badges.map((b, i) => (
                <span key={i} className="bg-indigo-900 text-indigo-200 text-xs px-3 py-1 rounded-full">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Quiz Setup */}
        <div className="mb-6 bg-indigo-800 bg-opacity-30 p-4 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Quiz Setup</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-indigo-200 text-sm">Duration</label>
              <select
                className="w-full bg-indigo-900 bg-opacity-50 text-white border border-indigo-700 rounded-lg p-2"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
              >
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
                <option value={1200}>20 minutes</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-indigo-200 text-sm">Questions</label>
              <select
                className="w-full bg-indigo-900 bg-opacity-50 text-white border border-indigo-700 rounded-lg p-2"
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-indigo-200 text-sm">
              <input
                type="checkbox"
                className="mr-2 accent-indigo-500"
                checked={weakOnly}
                onChange={e => {
                  const checked = e.target.checked
                  setWeakOnly(checked)
                  if (checked) {
                    const weak = ALL_TOPICS.filter(t => {
                      const s = aggregated[t] || { correct: 0, total: 0 }
                      const pct = s.total ? s.correct / s.total : 0
                      return pct < 0.6
                    })
                    setTopics(weak)
                  } else {
                    setTopics(ALL_TOPICS)
                  }
                }}
              />
              Focus on Weak Topics
            </label>
          </div>
          
          <div>
            <h3 className="text-indigo-200 text-sm mb-2">Topic Selection</h3>
            <div className="max-h-40 overflow-y-auto bg-indigo-900 bg-opacity-30 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {ALL_TOPICS.map(topic => (
                  <label key={topic} className="flex items-start text-white text-sm">
                    <input
                      type="checkbox"
                      className="mr-1 mt-1 accent-indigo-500"
                      checked={topics.includes(topic)}
                      onChange={e => {
                        if (e.target.checked) {
                          setTopics([...topics, topic])
                        } else {
                          setTopics(topics.filter(t => t !== topic))
                        }
                      }}
                    />
                    <span>{topic}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Start Button */}
        <button
          className="quiz-button mb-6"
          onClick={() => setInSession(true)}
          disabled={topics.length === 0}
        >
          Start Quiz
        </button>
        
        {/* History Section */}
        {history.length > 0 && (
          <div className="bg-indigo-800 bg-opacity-30 p-4 rounded-xl">            <h2 className="text-lg font-semibold text-white mb-3">
              Quiz History
            </h2>
            
            <div className="mb-4 max-h-32 overflow-y-auto bg-indigo-900 bg-opacity-30 rounded-lg p-2">
              {history.map((h, i) => (
                <div key={i} className="text-sm border-b border-indigo-700 last:border-0 py-2 flex justify-between">
                  <span className="text-indigo-200">{new Date(h.date).toLocaleString()}</span>
                  <span className="font-medium">
                    <span className="text-yellow-400">{h.score}</span>
                    <span className="text-indigo-300">/{h.total}</span>
                  </span>
                </div>
              ))}
            </div>
              <h2 className="text-lg font-semibold text-white mb-3">
              Topic Performance
            </h2>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {ALL_TOPICS.map(topic => {
                const stats = aggregated[topic] || { correct: 0, total: 0 }
                const pct = stats.total
                  ? Math.round((stats.correct / stats.total) * 100)
                  : 0
                return (
                  <div key={topic} className="mb-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-indigo-200">{topic}</span>
                      <span className="text-indigo-200">
                        {stats.correct}/{stats.total} <span className="text-yellow-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-indigo-950 rounded-full h-2">
                      <div 
                        className="quiz-progress-bar" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>        )}
      </div>
    </div>
  )
}

export default App
