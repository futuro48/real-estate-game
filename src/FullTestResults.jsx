import React from 'react'

export default function FullTestResults({ results, onClose }) {
  if (!results) return null

  return (
    <div className="bg-indigo-800 bg-opacity-30 p-4 rounded-xl mb-6">
      <h2 className="text-lg font-semibold text-white mb-2">Full Test Results</h2>
      <div className="flex justify-between text-sm text-indigo-200 mb-2">
        <span>Date</span>
        <span className="text-white">{new Date(results.date).toLocaleDateString()}</span>
      </div>
      <div className="flex justify-between text-sm text-indigo-200 mb-2">
        <span>Overall Score</span>
        <span className="text-white">{results.overallScore}%</span>
      </div>
      <div className="space-y-1 text-sm mb-2">
        <div className="flex justify-between text-indigo-200">
          <span>Section A</span>
          <span className="text-white">{results.sectionAScore}%</span>
        </div>
        <div className="flex justify-between text-indigo-200">
          <span>Section B</span>
          <span className="text-white">{results.sectionBScore}%</span>
        </div>
      </div>
      <div className="text-white font-semibold mb-2">
        {results.passed ? '✅ Passed' : '❌ Did not pass'}
      </div>
      {results.studyRecommendations && results.studyRecommendations.length > 0 && (
        <div className="text-sm text-indigo-200 mb-2">
          <div className="font-medium text-white mb-1">Study Recommendations</div>
          <ul className="list-disc list-inside space-y-1">
            {results.studyRecommendations.map((rec, i) => (
              <li key={i}>
                {rec.topic}: {rec.score}% (target {rec.threshold}%)
              </li>
            ))}
          </ul>
        </div>
      )}
      <button className="quiz-button mt-3" onClick={onClose}>Close</button>
    </div>
  )
}
