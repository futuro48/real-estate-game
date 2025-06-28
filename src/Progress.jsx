import React from 'react'

function TopicBar({ topic, stats }) {
  const pct = stats.total ? (stats.correct / stats.total) * 100 : 0
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-indigo-200 mb-1">
        <span>{topic}</span>
        <span>{stats.correct}/{stats.total}</span>
      </div>
      <div className="w-full bg-indigo-950 rounded-full h-2">
        <div className="quiz-progress-bar" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  )
}

export default function Progress({ history, fullTestHistory, aggregated, onClose }) {
  return (
    <div className="quiz-container max-w-2xl">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] opacity-5 z-0"></div>
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-white mb-4">Progress Overview</h2>

        <div className="mb-6 bg-indigo-800 bg-opacity-30 p-4 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-3">Topic Performance</h3>
          <div className="max-h-60 overflow-y-auto">
            {Object.entries(aggregated).map(([topic, stats]) => (
              <TopicBar key={topic} topic={topic} stats={stats} />
            ))}
          </div>
        </div>

        <div className="mb-6 bg-indigo-800 bg-opacity-30 p-4 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-3">Quiz History</h3>
          <div className="max-h-60 overflow-y-auto text-sm text-indigo-200 space-y-1">
            {history.length === 0 && <div>No sessions yet.</div>}
            {history.map((h, i) => (
              <div key={i} className="flex justify-between">
                <span>{new Date(h.date).toLocaleDateString()}</span>
                <span className="text-white">{h.score}/{h.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 bg-indigo-800 bg-opacity-30 p-4 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-3">Full Test History</h3>
          <div className="max-h-60 overflow-y-auto text-sm text-indigo-200 space-y-1">
            {fullTestHistory.length === 0 && <div>No tests taken.</div>}
            {fullTestHistory.map((t, i) => (
              <div key={i} className="flex justify-between">
                <span>{new Date(t.date).toLocaleDateString()}</span>
                <span className="text-white">{t.overallScore}% {t.passed ? '✅' : '❌'}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="quiz-button" onClick={onClose}>Back</button>
      </div>
    </div>
  )
}
