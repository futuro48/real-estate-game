import { useState } from 'react'
import './App.css'
import { questionBank } from './data/questions.js'

function App() {
  const [index, setIndex] = useState(0)
  const questions = questionBank.National['Property Ownership']
  const current = questions[index]

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sample Question</h1>
      <p className="mb-2">{current.question}</p>
      <ul className="list-disc pl-5 mb-4">
        {Object.entries(current.options).map(([key, value]) => (
          <li key={key}>
            <strong>{key}.</strong> {value}
          </li>
        ))}
      </ul>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded"
        onClick={() => setIndex((index + 1) % questions.length)}
      >
        Next Question
      </button>
    </div>
  )
}

export default App
