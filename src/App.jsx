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
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Real Estate Quiz</h1>
      <div className="mb-4 text-left">
        <div>Points: {points}</div>
        <div>Level: {Math.floor(points / 100) + 1}</div>
        <div>Streak: {streak} day{streak === 1 ? '' : 's'}</div>
        {badges.length > 0 && (
          <div className="mt-2">
            <h2 className="font-semibold">Badges</h2>
            <ul className="list-disc pl-5">
              {badges.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mb-4 text-left">
        <label className="block mb-2">
          Duration
          <select
            className="ml-2 border rounded p-1"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
          >
            <option value={300}>5 minutes</option>
            <option value={600}>10 minutes</option>
            <option value={1200}>20 minutes</option>
          </select>
        </label>
        <label className="block mb-2">
          Number of Questions
          <select
            className="ml-2 border rounded p-1"
            value={questionCount}
            onChange={e => setQuestionCount(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
        <div className="mb-2">Focus Areas</div>
        <label className="block mb-2 text-sm">
          <input
            type="checkbox"
            className="mr-1"
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
        <div className="grid grid-cols-2 gap-1">
          {ALL_TOPICS.map(topic => (
            <label key={topic} className="text-sm">
              <input
                type="checkbox"
                className="mr-1"
                checked={topics.includes(topic)}
                onChange={e => {
                  if (e.target.checked) {
                    setTopics([...topics, topic])
                  } else {
                    setTopics(topics.filter(t => t !== topic))
                  }
                }}
              />
              {topic}
            </label>
          ))}
        </div>
      </div>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded"
        onClick={() => setInSession(true)}
        disabled={topics.length === 0}
      >
        Start Quiz
      </button>
      {history.length > 0 && (
        <div className="mt-4 text-left">
          <h2 className="font-semibold mb-2">Past Sessions</h2>
          <ul className="list-disc pl-5 space-y-1">
            {history.map((h, i) => (
              <li key={i}>
                {new Date(h.date).toLocaleString()} - Score: {h.score}/{h.total}
              </li>
            ))}
          </ul>
          <h2 className="font-semibold mt-4 mb-2">Overall Topic Performance</h2>
          {ALL_TOPICS.map(topic => {
            const stats = aggregated[topic] || { correct: 0, total: 0 }
            const pct = stats.total
              ? Math.round((stats.correct / stats.total) * 100)
              : 0
            return (
              <div key={topic} className="mb-2">
                <div className="text-sm font-medium">
                  {topic} - {stats.correct}/{stats.total}
                </div>
                <div className="bg-gray-200 h-2 rounded">
                  <div
                    className="bg-green-500 h-2 rounded"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default App
