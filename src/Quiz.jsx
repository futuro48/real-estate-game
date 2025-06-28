import { useEffect, useState } from 'react'
import { questionBankPSI as questionBank } from './data/questions-psi.js'
import { testOne } from './data/test-one.js'
import { testTwo } from './data/test-two.js'
import { buildDueQuestions, updateRecord } from './scheduler.js'
import { motion, AnimatePresence } from 'framer-motion'

// Simple HTML sanitizer to strip scripts and event handlers
function sanitize(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  doc.querySelectorAll('script').forEach(el => el.remove())
  doc.body.querySelectorAll('*').forEach(el => {
    ;[...el.attributes].forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name)
      }
    })
  })
  return doc.body.innerHTML
}

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

function getFullTestQuestions(selectedTest) {
  const testData = {
    'test-one': testOne,
    'test-two': testTwo,
  }[selectedTest]

  if (!testData || !testData.sections) {
    return []
  }

  const questions = []

  const sectionA = testData.sections.find(s => s.name === 'Section A')
  if (sectionA && sectionA.questions) {
    sectionA.questions.forEach((q, i) => {
      questions.push({ ...q, id: `sectionA-${i}`, section: 'A' })
    })
  }

  const sectionB = testData.sections.find(s => s.name === 'Section B')
  if (sectionB && sectionB.questions) {
    sectionB.questions.forEach((q, i) => {
      questions.push({ ...q, id: `sectionB-${i}`, section: 'B' })
    })
  }

  return questions
}

function formatQuestion(text) {
  if (!text) return ''
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  return sanitize(formatted)
}

export default function Quiz({ onEndSession, duration, topics, questionCount, isFullTest = false, selectedTest }) {
  const [questions, setQuestions] = useState(() => {
    if (isFullTest) {
      return getFullTestQuestions(selectedTest)
    } else {
      const pool = getQuestions(topics)
      return shuffle(pool).slice(0, questionCount)
    }
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
    if (isFullTest) {
      const testData = {
        'test-one': testOne,
        'test-two': testTwo,
      }[selectedTest]

      if (testData) {
        // For full test, extract topics from all questions
        const allTopics = new Set()
        testData.sectionA.forEach(q => allTopics.add(q.topic))
        testData.sectionB.forEach(q => allTopics.add(q.topic))
        allTopics.forEach(t => {
          stats[t] = { correct: 0, total: 0 }
        })
      }
    } else if (topics) {
      // For regular quiz mode
      topics.forEach(t => {
        stats[t] = { correct: 0, total: 0 }
      })
    }
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
    if (isFullTest) {
      const testData = {
        'test-one': testOne,
        'test-two': testTwo,
        'test-three': testThree,
      }[selectedTest]

      // Calculate section scores and topic breakdown for full test
      const sectionAAnswers = answers.filter(a => a.section === 'A')
      const sectionBAnswers = answers.filter(a => a.section === 'B')

      const sectionAScore = sectionAAnswers.length > 0 ? sectionAAnswers.filter(a => a.userChoice === a.answer).length / sectionAAnswers.length : 0
      const sectionBScore = sectionBAnswers.length > 0 ? sectionBAnswers.filter(a => a.userChoice === a.answer).length / sectionBAnswers.length : 0

      // Build topic breakdown
      const topicBreakdown = {}
      answers.forEach(a => {
        if (!topicBreakdown[a.topic]) {
          topicBreakdown[a.topic] = { correct: 0, total: 0 }
        }
        topicBreakdown[a.topic].total++
        if (a.userChoice === a.answer) {
          topicBreakdown[a.topic].correct++
        }
      })

      onEndSession({ 
        score, 
        total: answers.length, 
        topicStats,
        sectionAScore,
        sectionBScore,
        topicBreakdown,
        answers,
        analysisRules: testData.analysisRules
      })
    } else {
      onEndSession({ score, total: answers.length, topicStats, answers })
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercent = (index / questions.length) * 100;
  const timePercent = (time / duration) * 100;

  if (showSummary) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="quiz-container"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] opacity-5 z-0"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isFullTest ? 'Full Test Complete!' : 'Quiz Complete!'}
            </h2>
            <div className="quiz-status">
              {Math.round((score/answers.length) * 100)}%
            </div>
          </div>
          
          <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-xl mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-indigo-200">Final Score</span>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-yellow-400">{score}</span>
                <span className="text-indigo-200">/{answers.length}</span>
              </div>
            </div>
            
            {isFullTest && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-200">Section A (General)</span>
                  <span className="text-white">
                    {Math.round((answers.filter(a => a.section === 'A' && a.userChoice === a.answer).length / answers.filter(a => a.section === 'A').length) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-200">Section B (Massachusetts)</span>
                  <span className="text-white">
                    {Math.round((answers.filter(a => a.section === 'B' && a.userChoice === a.answer).length / answers.filter(a => a.section === 'B').length) * 100)}%
                  </span>
                </div>
              </div>
            )}
            
            {/* Topic progress bars */}
            {Object.entries(topicStats).map(([topic, stats]) => (
              <div key={topic} className="mb-2">
                <div className="flex justify-between text-xs text-indigo-200 mb-1">
                  <span>{topic}</span>
                  <span>{stats.correct}/{stats.total}</span>
                </div>
                <div className="w-full bg-indigo-950 rounded-full h-2">
                  <div 
                    className="quiz-progress-bar"
                    style={{ width: `${(stats.correct/Math.max(1, stats.total)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-xl max-h-60 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3 text-white">Question Review</h3>
            <div className="space-y-4">
              {answers.map((a, i) => (                <div key={i} className={`p-3 rounded-lg ${a.userChoice === a.answer ? 'bg-green-900 bg-opacity-40' : 'bg-red-900 bg-opacity-40'}`}>
                  <div className="font-medium text-white mb-2" dangerouslySetInnerHTML={{ __html: formatQuestion(a.question) }}></div>
                  <div className={`text-sm ${a.userChoice === a.answer ? 'text-green-300' : 'text-red-300'}`}>
                    Your answer: {a.options[a.userChoice]}
                  </div>
                  {a.userChoice !== a.answer && (
                    <div className="text-sm text-green-300">
                      Correct answer: {a.options[a.answer]}
                    </div>
                  )}
                  {a.explanation && (
                    <div className="text-xs italic text-indigo-200 mt-1">{a.explanation}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="quiz-button mt-6"
            onClick={handleFinish}
          >
            Complete Quiz
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (answered) {
    const isCorrect = selected === current.answer;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="quiz-container"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] opacity-5 z-0"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="quiz-progress">
              <div 
                className="quiz-progress-bar"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="ml-3 text-indigo-200 text-sm font-medium">
              {index + 1}/{isFullTest ? questions.length : questionCount}
              {isFullTest && (
                <div className="text-xs text-indigo-300">
                  Section {current.section}
                </div>
              )}
            </div>
          </div>
            <div className="quiz-question" dangerouslySetInnerHTML={{ __html: formatQuestion(current.question) }}></div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-5 rounded-xl mb-6 flex flex-col items-center ${
              isCorrect 
                ? 'bg-green-900 bg-opacity-20 border border-green-500' 
                : 'bg-red-900 bg-opacity-20 border border-red-500'
            }`}
          >
            <div className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
            </div>
            <div className="text-white mb-2">
              {isCorrect 
                ? 'Great job!' 
                : `The correct answer is: ${current.options[current.answer]}`
              }
            </div>
            {current.explanation && (
              <div className="text-sm text-indigo-200 italic mt-2">{current.explanation}</div>
            )}
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="quiz-button"
            onClick={handleNext}
          >
            {index + 1 < questions.length ? 'Next Question' : 'See Results'}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="quiz-container"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] opacity-5 z-0"></div>
      <div className="relative z-10">
        {/* Status bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="quiz-status">
            {isFullTest ? (
              <div>
                <div>Question {index + 1}/{questions.length}</div>
                <div className="text-xs text-indigo-300">
                  Section {current.section} {current.section === 'A' ? '(General)' : '(Massachusetts)'}
                </div>
              </div>
            ) : (
              `Question ${index + 1}/${questionCount}`
            )}
          </div>
          <div className="quiz-status flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(time)}
          </div>
        </div>
        
        {/* Timer bar */}
        <div className="w-full h-2 bg-indigo-800 rounded-full mb-6 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: `${timePercent}%` }}
            transition={{ duration: 1 }}
          ></motion.div>
        </div>
          {/* Question */}
        <div className="quiz-question" dangerouslySetInnerHTML={{ __html: formatQuestion(current.question) }}></div>
        
        {/* Options */}
        <div className="space-y-3 mb-6">
          {Object.entries(current.options).map(([key, text]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="quiz-option"
              onClick={() => handleAnswer(key)}
            >
              <div className="quiz-option-letter">
                <span className="text-white font-bold">{key}</span>
              </div>
              <span className="text-white">{text}</span>
            </motion.button>
          ))}
        </div>
        
        {/* Score */}
        <div className="flex justify-between items-center">
          <div className="quiz-status">
            Score: {score}/{index}
          </div>
          <div className="flex">
            {[...Array(3)].map((_, i) => (
              <svg 
                key={i} 
                className={`w-6 h-6 ${i < Math.min(3, score) ? 'text-yellow-400' : 'text-indigo-800'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
