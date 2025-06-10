import { useEffect, useState } from 'react'
import { questionBank } from './data/questions.js'
import { buildDueQuestions, updateRecord } from './scheduler.js'

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function getQuestions(topics) {
  let list = buildDueQuestions(topics, questionBank)
  if (list.length === 0) {
    // fall back to all questions if none are due yet
    Object.values(questionBank).forEach(section => {
      Object.entries(section).forEach(([topic, qs]) => {
        if (!topics.includes(topic)) return
        qs.forEach((q, i) => {
          list.push({ ...q, id: `${topic}-${i}` })
        })
      })
    })
  }
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}


export default function Quiz({ onComplete, duration, topics, questionCount }) {
  const [questions, setQuestions] = useState(() => {
    const pool = getQuestions(topics)
    return shuffle(pool).slice(0, questionCount)
  })

  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(duration)

  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showSummary, setShowSummary] = useState(false)

  const [topicStats, setTopicStats] = useState(() => {
    const stats = {}
    topics.forEach(t => {
      stats[t] = { correct: 0, total: 0 }
    })
    return stats
  })

  const current = questions[index]

  useEffect(() => {
    const id = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          clearInterval(id)
          setShowSummary(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const handleAnswer = choice => {
    const correct = choice === current.answer

    setTopicStats(stats => {
      const t = current.topic
      const updated = { ...stats }
      updated[t] = {
        correct: stats[t].correct + (correct ? 1 : 0),
        total: stats[t].total + 1,
      }
      return updated
    })

    updateRecord(current.id, correct)

    if (correct) {
      setScore(s => s + 1)
    } else {
      setQuestions(qs => [...qs, current])
    }

    setAnswers(a => [...a, { ...current, userChoice: choice }])
    setSelected(choice)
    setAnswered(true)
  }

  const handleNext = () => {
    if (index + 1 < questions.length) {
      setIndex(i => i + 1)
      setAnswered(false)
      setSelected(null)
    } else {
      setShowSummary(true)
    }
  }

  const handleFinish = () => {
    onComplete({ score, total: answers.length, topicStats })
  }

  if (showSummary) {
    return (
      <div className="p-6 max-w-xl mx-auto bg-gray-800 bg-opacity-80 rounded-xl shadow-2xl space-y-4 text-left">
        <h2 className="text-lg font-semibold mb-2">Quiz Summary</h2>
        <p className="mb-2">Score: {score}/{answers.length}</p>
        <ul className="space-y-4">
          {answers.map((a, i) => (
            <li key={i}>
              <div className="font-medium">{a.question}</div>
              <div>Your answer: {a.userChoice} - {a.options[a.userChoice]}</div>
              <div>Correct answer: {a.answer} - {a.options[a.answer]}</div>
              <div className="text-sm italic">{a.explanation}</div>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 px-4 py-2 rounded font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
          onClick={handleFinish}
        >
          Done
        </button>
      </div>
    )
  }

  if (answered) {
    return (
      <div className="p-6 max-w-xl mx-auto bg-gray-800 bg-opacity-80 rounded-xl shadow-2xl space-y-4 text-left">
        <div className="mb-2 font-medium">{current.question}</div>
        <div className="mb-2">
          {selected === current.answer ? 'Correct!' : `Incorrect. The correct answer is ${current.answer}.`}
        </div>
        <div className="mb-4 text-sm italic">{current.explanation}</div>
        <button
          className="px-4 py-2 rounded font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
          onClick={handleNext}
        >
          {index + 1 < questions.length ? 'Next Question' : 'See Summary'}
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-gray-800 bg-opacity-80 rounded-xl shadow-2xl space-y-4">
      <div className="mb-2">Time Remaining: {time}s</div>
      <div className="mb-2 font-medium">{current.question}</div>
      <ul className="mb-4 space-y-1">
        {Object.entries(current.options).map(([key, text]) => (
          <li key={key}>
            <button
              className="px-2 py-1 border border-purple-600 rounded bg-gray-700 hover:bg-purple-700 w-full text-left"
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
