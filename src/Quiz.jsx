import { useEffect, useMemo, useState } from 'react'
import { questionBank } from './data/questions.js'

function getQuestions(topics) {
  const list = []
  Object.values(questionBank).forEach(section => {
    Object.entries(section).forEach(([topic, qs]) => {
      if (topics.includes(topic)) list.push(...qs)
    })
  })
  return list
}

export default function Quiz({ onComplete, duration, topics }) {
  const questions = useMemo(() => getQuestions(topics), [topics])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(duration)
  const current = questions[index]

  useEffect(() => {
    const id = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          clearInterval(id)
          onComplete({ score, total: index })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [index, onComplete, score])

  const handleAnswer = choice => {
    if (choice === current.answer) {
      setScore(s => s + 1)
    }
    if (index + 1 < questions.length) {
      setIndex(i => i + 1)
    } else {
      onComplete({
        score: choice === current.answer ? score + 1 : score,
        total: index + 1,
      })
    }
  }

  return (
    <div>
      <div className="mb-2">Time Remaining: {time}s</div>
      <div className="mb-2 font-medium">{current.question}</div>
      <ul className="mb-4 space-y-1">
        {Object.entries(current.options).map(([key, text]) => (
          <li key={key}>
            <button
              className="px-2 py-1 border rounded w-full text-left"
              onClick={() => handleAnswer(key)}
            >
              <strong>{key}.</strong> {text}
            </button>
          </li>
        ))}
      </ul>
      <div>Score: {score}/{index}</div>
    </div>
  )
}
