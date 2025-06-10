import { useEffect, useState } from 'react'
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
  const [topics, setTopics] = useState(ALL_TOPICS)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('history') || '[]')
    setHistory(stored)
  }, [])

  const handleComplete = summary => {
    const updated = [...history, { ...summary, date: Date.now() }]
    setHistory(updated)
    localStorage.setItem('history', JSON.stringify(updated))
    setInSession(false)
  }

  if (inSession) {
    return <Quiz onComplete={handleComplete} duration={duration} topics={topics} />
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Real Estate Quiz</h1>
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
        <div className="mb-2">Focus Areas</div>
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
        </div>
      )}
    </div>
  )
}

export default App
