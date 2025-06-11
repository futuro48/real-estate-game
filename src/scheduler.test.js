import { describe, it, beforeEach, expect, vi } from 'vitest'
import { updateRecord, buildDueQuestions, getRecord, DEFAULT_INTERVALS, aggregateTopicStats } from './scheduler.js'

const noopQuestion = {
  question: 'Q',
  options: { A: 'a' },
  answer: 'A',
  explanation: 'E',
  topic: 'Topic'
}

describe('scheduler', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
  })

  it('updateRecord stores new correct answer', () => {
    updateRecord('t-0', true)
    const rec = getRecord('t-0')
    expect(rec.box).toBe(2)
    expect(rec.correct).toBe(1)
    expect(rec.total).toBe(1)
    const expectedNext = Date.now() + DEFAULT_INTERVALS[2] * 24 * 60 * 60 * 1000
    expect(rec.next).toBe(expectedNext)
  })

  it('updateRecord stores incorrect answer', () => {
    updateRecord('t-1', false)
    const rec = getRecord('t-1')
    expect(rec.box).toBe(1)
    expect(rec.correct).toBe(0)
    expect(rec.total).toBe(1)
    const expectedNext = Date.now() + DEFAULT_INTERVALS[1] * 24 * 60 * 60 * 1000
    expect(rec.next).toBe(expectedNext)
  })

  it('buildDueQuestions returns only due questions', () => {
    const now = Date.now()
    const future = now + 1000 * 60 * 60 * 24
    const schedule = {
      'Topic-0': { box: 2, next: future, correct: 1, total: 1 },
      'Topic-1': { box: 1, next: now - 1000, correct: 0, total: 1 }
    }
    localStorage.setItem('schedule', JSON.stringify(schedule))

    const bank = {
      Section: {
        Topic: [
          { ...noopQuestion },
          { ...noopQuestion, question: 'Q2' }
        ]
      }
    }

    const due = buildDueQuestions(['Topic'], bank)
    expect(due.map(q => q.question)).toEqual(['Q2'])
    expect(due[0].id).toBe('Topic-1')
  })

  it('updates interval over consecutive correct answers', () => {
    updateRecord('t-2', true)
    let rec = getRecord('t-2')
    expect(rec.box).toBe(2)
    expect(rec.next).toBe(Date.now() + DEFAULT_INTERVALS[2] * 24 * 60 * 60 * 1000)
    updateRecord('t-2', true)
    rec = getRecord('t-2')
    expect(rec.box).toBe(3)
    expect(rec.next).toBe(Date.now() + DEFAULT_INTERVALS[3] * 24 * 60 * 60 * 1000)
  })

  it('aggregates topic stats', () => {
    const schedule = {
      'A-0': { box: 2, next: 0, correct: 1, total: 2 },
      'A-1': { box: 1, next: 0, correct: 2, total: 3 },
      'B-0': { box: 3, next: 0, correct: 4, total: 5 }
    }
    localStorage.setItem('schedule', JSON.stringify(schedule))
    const agg = aggregateTopicStats()
    expect(agg).toEqual({
      A: { correct: 3, total: 5 },
      B: { correct: 4, total: 5 }
    })
  })
})
