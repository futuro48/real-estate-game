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
  const questions = useMemo(() => {
    const pool = getQuestions(topics)
    return shuffle(pool).slice(0, questionCount)
  }, [topics, questionCount])

  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(duration)

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
          onComplete({ score, total: index, topicStats })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [index, onComplete, score, topicStats])

  const handleAnswer = choice => {
    setTopicStats(stats => {
      const t = current.topic
      const updated = { ...stats }
      updated[t] = {
        correct:
          stats[t].correct + (choice === current.answer ? 1 : 0),
        total: stats[t].total + 1,
      }
      return updated
    })

    const correct = choice === current.answer
    updateRecord(current.id, correct)

    if (correct) {
      setScore(s => s + 1)
    }
    if (!correct) {
      setQuestions(qs => [...qs, current])
    }
    if (index + 1 < questions.length) {
      setIndex(i => i + 1)
    } else {
      onComplete({
        score: correct ? score + 1 : score,
        total: index + 1,
        topicStats: {
          ...topicStats,
          [current.topic]: {
            correct:
              topicStats[current.topic].correct + (correct ? 1 : 0),
            total: topicStats[current.topic].total + 1,
          },
        },
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
