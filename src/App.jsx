import { useEffect, useState } from 'react'
import './App.css'
import Quiz from './Quiz.jsx'

function App() {
  const [inSession, setInSession] = useState(false)
  const [history, setHistory] = useState([])

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
    return <Quiz onComplete={handleComplete} />
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Real Estate Quiz</h1>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded"
        onClick={() => setInSession(true)}
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
